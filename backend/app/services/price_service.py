import logging
from datetime import datetime, timedelta

from sqlalchemy import select
from sqlalchemy.dialects.sqlite import insert as sqlite_insert
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.integrations.ebay_api import ebay_client
from app.integrations.tcgplayer_api import tcgplayer_client
from app.models.card import Card
from app.models.price import Condition, Marketplace, Price, PriceHistory
from app.schemas.price import (
    MarketplacePrices,
    PriceComparisonResponse,
    PriceEntry,
    PriceHistoryPoint,
)

logger = logging.getLogger(__name__)

# Map TCGPlayer subtype names to our variant names
TCGPLAYER_SUBTYPE_MAP = {
    "Normal": "Normal",
    "Holofoil": "Foil",
    "Reverse Holofoil": "Reverse Holofoil",
    "1st Edition Normal": "1st Edition",
    "1st Edition Holofoil": "1st Edition Foil",
}


async def get_current_prices(
    db: AsyncSession, card_id: int
) -> PriceComparisonResponse | None:
    """Get current prices across all marketplaces for a card."""
    card_stmt = select(Card).where(Card.id == card_id)
    card_result = await db.execute(card_stmt)
    card = card_result.scalar_one_or_none()
    if card is None:
        return None

    # Check if we have recent prices
    price_stmt = select(Price).where(Price.card_id == card_id)
    price_result = await db.execute(price_stmt)
    prices = list(price_result.scalars().all())

    stale_threshold = datetime.utcnow() - timedelta(seconds=settings.cache_ttl_seconds)
    is_stale = not prices or any(p.updated_at < stale_threshold for p in prices)

    if is_stale:
        await _fetch_fresh_prices(db, card)
        # Re-query after fetch
        price_result = await db.execute(price_stmt)
        prices = list(price_result.scalars().all())

    # Group prices by marketplace
    marketplace_map: dict[str, list[PriceEntry]] = {}
    marketplace_urls: dict[str, str | None] = {}

    for p in prices:
        if p.marketplace not in marketplace_map:
            marketplace_map[p.marketplace] = []
            marketplace_urls[p.marketplace] = p.listing_url
        marketplace_map[p.marketplace].append(
            PriceEntry(
                condition=p.condition,
                variant=p.variant,
                low_price=p.low_price,
                mid_price=p.mid_price,
                high_price=p.high_price,
                market_price=p.market_price,
            )
        )

    marketplaces = [
        MarketplacePrices(
            marketplace=mp,
            url=marketplace_urls.get(mp),
            prices=entries,
        )
        for mp, entries in marketplace_map.items()
    ]

    return PriceComparisonResponse(
        card_id=card.id,
        card_name=card.name,
        fetched_at=datetime.utcnow(),
        marketplaces=marketplaces,
    )


async def _fetch_fresh_prices(db: AsyncSession, card: Card) -> None:
    """Fetch fresh prices from all configured marketplaces."""
    # Fetch TCGPlayer prices
    if tcgplayer_client.is_configured:
        try:
            await _fetch_tcgplayer_prices(db, card)
        except Exception:
            logger.exception("Failed to fetch TCGPlayer prices for card %s", card.id)

    # Fetch eBay prices
    if ebay_client.is_configured:
        try:
            await _fetch_ebay_prices(db, card)
        except Exception:
            logger.exception("Failed to fetch eBay prices for card %s", card.id)


async def _fetch_tcgplayer_prices(db: AsyncSession, card: Card) -> None:
    """Fetch and upsert TCGPlayer prices for a card."""
    # Resolve product ID if we don't have it
    product_id = card.tcgplayer_product_id
    if not product_id:
        products = await tcgplayer_client.search_products(
            card.name, card.set_name
        )
        if not products:
            logger.debug("No TCGPlayer product found for %s", card.name)
            return
        product_id = products[0]
        card.tcgplayer_product_id = product_id
        await db.commit()

    # Fetch prices
    prices_data = await tcgplayer_client.get_product_prices([product_id])
    if not prices_data:
        return

    # Get product URL
    listing_url = f"https://www.tcgplayer.com/product/{product_id}"
    try:
        details = await tcgplayer_client.get_product_details([product_id])
        if details:
            listing_url = details[0].get("url", listing_url)
    except Exception:
        pass

    for price_data in prices_data:
        subtype = price_data.get("subTypeName", "Normal")
        variant = TCGPLAYER_SUBTYPE_MAP.get(subtype, subtype)

        low = price_data.get("lowPrice")
        mid = price_data.get("midPrice")
        high = price_data.get("highPrice")
        market = price_data.get("marketPrice")

        if not any([low, mid, high, market]):
            continue

        await _upsert_price(
            db,
            card_id=card.id,
            marketplace=Marketplace.TCGPLAYER.value,
            condition=Condition.NEAR_MINT.value,
            variant=variant,
            low_price=low,
            mid_price=mid,
            high_price=high,
            market_price=market,
            listing_url=listing_url,
        )

    await db.commit()


async def _fetch_ebay_prices(db: AsyncSession, card: Card) -> None:
    """Fetch and upsert eBay prices for a card."""
    listings = await ebay_client.search_listings(card.name, card.set_name)
    if not listings:
        return

    aggregated = ebay_client.aggregate_prices(listings)
    if aggregated["market_price"] is None:
        return

    listing_url = ebay_client.extract_listing_url(card.name)

    await _upsert_price(
        db,
        card_id=card.id,
        marketplace=Marketplace.EBAY.value,
        condition=Condition.NEAR_MINT.value,
        variant="Normal",
        listing_url=listing_url,
        **aggregated,
    )

    await db.commit()


async def _upsert_price(
    db: AsyncSession,
    *,
    card_id: int,
    marketplace: str,
    condition: str,
    variant: str,
    low_price: float | None = None,
    mid_price: float | None = None,
    high_price: float | None = None,
    market_price: float | None = None,
    listing_url: str | None = None,
) -> None:
    """Upsert a price record and insert a price history point."""
    # Upsert current price
    stmt = sqlite_insert(Price).values(
        card_id=card_id,
        marketplace=marketplace,
        condition=condition,
        variant=variant,
        low_price=low_price,
        mid_price=mid_price,
        high_price=high_price,
        market_price=market_price,
        listing_url=listing_url,
    )
    stmt = stmt.on_conflict_do_update(
        constraint="uq_price_source",
        set_={
            "low_price": stmt.excluded.low_price,
            "mid_price": stmt.excluded.mid_price,
            "high_price": stmt.excluded.high_price,
            "market_price": stmt.excluded.market_price,
            "listing_url": stmt.excluded.listing_url,
            "updated_at": datetime.utcnow(),
        },
    )
    await db.execute(stmt)

    # Insert price history point
    if market_price is not None:
        history = PriceHistory(
            card_id=card_id,
            marketplace=marketplace,
            condition=condition,
            variant=variant,
            market_price=market_price,
        )
        db.add(history)


async def get_price_history(
    db: AsyncSession,
    card_id: int,
    days: int = 30,
    marketplace: str | None = None,
) -> list[PriceHistoryPoint]:
    """Get price history points for charting."""
    cutoff = datetime.utcnow() - timedelta(days=days)

    stmt = (
        select(PriceHistory)
        .where(PriceHistory.card_id == card_id)
        .where(PriceHistory.recorded_at >= cutoff)
    )
    if marketplace:
        stmt = stmt.where(PriceHistory.marketplace == marketplace)
    stmt = stmt.order_by(PriceHistory.recorded_at)

    result = await db.execute(stmt)
    rows = result.scalars().all()

    return [
        PriceHistoryPoint(
            date=row.recorded_at,
            marketplace=row.marketplace,
            variant=row.variant,
            market_price=row.market_price,
        )
        for row in rows
    ]

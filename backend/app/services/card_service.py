import json
import logging
import math
from typing import Any

from sqlalchemy import func, select
from sqlalchemy.dialects.sqlite import insert as sqlite_insert
from sqlalchemy.ext.asyncio import AsyncSession

from app.integrations.pokemon_tcg_api import pokemon_tcg_client
from app.models.card import Card
from app.models.price import Price
from app.schemas.card import CardDetail, CardSuggestion, CardSummary, PaginatedCardResponse

logger = logging.getLogger(__name__)


async def suggest_cards(
    db: AsyncSession, query: str, limit: int = 8
) -> list[CardSuggestion]:
    """Return quick name suggestions from local DB only (no external API call)."""
    stmt = (
        select(Card)
        .where(Card.name.ilike(f"%{query}%"))
        .order_by(Card.name)
        .limit(limit)
    )
    result = await db.execute(stmt)
    cards = result.scalars().all()
    return [CardSuggestion.model_validate(c) for c in cards]


def _api_card_to_dict(data: dict[str, Any]) -> dict[str, Any]:
    """Convert a pokemontcg.io card response to our DB column format."""
    images = data.get("images", {})
    card_set = data.get("set", {})
    types = data.get("types")
    tcgplayer = data.get("tcgplayer", {})

    return {
        "pokemon_tcg_id": data["id"],
        "name": data["name"],
        "set_name": card_set.get("name", ""),
        "set_code": card_set.get("id", ""),
        "number": data.get("number", ""),
        "rarity": data.get("rarity"),
        "supertype": data.get("supertype", "Unknown"),
        "image_small": images.get("small"),
        "image_large": images.get("large"),
        "artist": data.get("artist"),
        "hp": data.get("hp"),
        "types_json": json.dumps(types) if types else None,
        "tcgplayer_product_id": _extract_tcgplayer_product_id(tcgplayer),
    }


def _extract_tcgplayer_product_id(tcgplayer: dict) -> int | None:
    """Extract TCGPlayer product ID from the URL if available."""
    url = tcgplayer.get("url", "")
    # URL format: https://prices.pokemontcg.io/tcgplayer/base1-4
    # The actual product ID isn't directly in the pokemontcg.io data,
    # so we'll resolve it later via TCGPlayer API search.
    return None


async def search_cards(
    db: AsyncSession, query: str, page: int = 1, page_size: int = 20,
    sort_by: str = "name", sort_dir: str = "asc",
    rarity: str | None = None, supertype: str | None = None,
) -> PaginatedCardResponse:
    """Search cards by name. Fetches from API if not enough local results."""
    offset = (page - 1) * page_size

    # Build filter conditions
    filters = [Card.name.ilike(f"%{query}%")]
    if rarity:
        filters.append(Card.rarity == rarity)
    if supertype:
        filters.append(Card.supertype == supertype)

    # Check local DB first (base name filter only for API fetch decision)
    base_count_stmt = select(func.count(Card.id)).where(Card.name.ilike(f"%{query}%"))
    total_result = await db.execute(base_count_stmt)
    base_total = total_result.scalar() or 0

    if base_total < page_size:
        # Fetch from Pokemon TCG API and upsert
        await _fetch_and_upsert_cards(db, query, page, page_size)

    # Count with all filters applied
    count_stmt = select(func.count(Card.id)).where(*filters)
    total_result = await db.execute(count_stmt)
    local_total = total_result.scalar() or 0

    # Determine sort column
    sort_columns = {
        "name": Card.name,
        "set_name": Card.set_name,
        "rarity": Card.rarity,
    }
    sort_column = sort_columns.get(sort_by, Card.name)
    order = sort_column.asc() if sort_dir == "asc" else sort_column.desc()

    # Query with lowest price subquery
    lowest_price_subq = (
        select(
            Price.card_id,
            func.min(Price.market_price).label("lowest_price"),
        )
        .where(Price.market_price.isnot(None))
        .group_by(Price.card_id)
        .subquery()
    )

    stmt = (
        select(Card, lowest_price_subq.c.lowest_price)
        .outerjoin(lowest_price_subq, Card.id == lowest_price_subq.c.card_id)
        .where(*filters)
        .order_by(order)
        .offset(offset)
        .limit(page_size)
    )
    result = await db.execute(stmt)
    rows = result.all()

    items = []
    for card, lowest_price in rows:
        items.append(
            CardSummary(
                id=card.id,
                name=card.name,
                set_name=card.set_name,
                number=card.number,
                rarity=card.rarity,
                image_small=card.image_small,
                lowest_price=lowest_price,
                lowest_price_marketplace=None,
            )
        )

    return PaginatedCardResponse(
        items=items,
        total=local_total,
        page=page,
        page_size=page_size,
        total_pages=max(1, math.ceil(local_total / page_size)),
    )


async def get_card(db: AsyncSession, card_id: int) -> CardDetail | None:
    stmt = select(Card).where(Card.id == card_id)
    result = await db.execute(stmt)
    card = result.scalar_one_or_none()
    if card is None:
        return None
    return CardDetail.model_validate(card)


async def get_card_by_pokemon_tcg_id(
    db: AsyncSession, pokemon_tcg_id: str
) -> Card | None:
    stmt = select(Card).where(Card.pokemon_tcg_id == pokemon_tcg_id)
    result = await db.execute(stmt)
    return result.scalar_one_or_none()


async def get_popular_cards(db: AsyncSession, limit: int = 12) -> list[CardSummary]:
    """Return cards with the most price data, or most recently added as fallback."""
    popular_stmt = (
        select(Card, func.count(Price.id).label("price_count"))
        .outerjoin(Price, Card.id == Price.card_id)
        .group_by(Card.id)
        .order_by(func.count(Price.id).desc(), Card.updated_at.desc())
        .limit(limit)
    )
    result = await db.execute(popular_stmt)
    rows = result.all()

    if not rows or all(row[1] == 0 for row in rows):
        # Fallback: return most recently added cards
        fallback_stmt = select(Card).order_by(Card.created_at.desc()).limit(limit)
        result = await db.execute(fallback_stmt)
        cards = result.scalars().all()
        rows = [(c, 0) for c in cards]

    return [
        CardSummary(
            id=card.id,
            name=card.name,
            set_name=card.set_name,
            number=card.number,
            rarity=card.rarity,
            image_small=card.image_small,
            lowest_price=None,
            lowest_price_marketplace=None,
        )
        for card, _ in rows
    ]


async def get_cards_from_same_set(
    db: AsyncSession, card_id: int, limit: int = 6
) -> list[CardSummary]:
    """Return other cards from the same set as the given card."""
    card_stmt = select(Card).where(Card.id == card_id)
    card_result = await db.execute(card_stmt)
    card = card_result.scalar_one_or_none()
    if card is None:
        return []

    stmt = (
        select(Card)
        .where(Card.set_code == card.set_code)
        .where(Card.id != card_id)
        .order_by(Card.name)
        .limit(limit)
    )
    result = await db.execute(stmt)
    cards = result.scalars().all()
    return [
        CardSummary(
            id=c.id,
            name=c.name,
            set_name=c.set_name,
            number=c.number,
            rarity=c.rarity,
            image_small=c.image_small,
            lowest_price=None,
            lowest_price_marketplace=None,
        )
        for c in cards
    ]


async def get_facets(db: AsyncSession) -> dict:
    """Return distinct rarity and supertype values for filter dropdowns."""
    rarity_stmt = (
        select(Card.rarity)
        .where(Card.rarity.isnot(None))
        .distinct()
        .order_by(Card.rarity)
    )
    supertype_stmt = select(Card.supertype).distinct().order_by(Card.supertype)

    rarities = (await db.execute(rarity_stmt)).scalars().all()
    supertypes = (await db.execute(supertype_stmt)).scalars().all()

    return {"rarities": list(rarities), "supertypes": list(supertypes)}


async def _fetch_and_upsert_cards(
    db: AsyncSession, query: str, page: int, page_size: int
) -> None:
    """Fetch cards from Pokemon TCG API and upsert into our DB."""
    try:
        api_response = await pokemon_tcg_client.search_cards(query, page, page_size)
    except Exception:
        logger.exception("Failed to fetch cards from Pokemon TCG API")
        return

    cards_data = api_response.get("data", [])
    if not cards_data:
        return

    for card_data in cards_data:
        values = _api_card_to_dict(card_data)
        stmt = sqlite_insert(Card).values(**values)
        stmt = stmt.on_conflict_do_update(
            index_elements=["pokemon_tcg_id"],
            set_={
                "name": stmt.excluded.name,
                "set_name": stmt.excluded.set_name,
                "set_code": stmt.excluded.set_code,
                "number": stmt.excluded.number,
                "rarity": stmt.excluded.rarity,
                "supertype": stmt.excluded.supertype,
                "image_small": stmt.excluded.image_small,
                "image_large": stmt.excluded.image_large,
                "artist": stmt.excluded.artist,
                "hp": stmt.excluded.hp,
                "types_json": stmt.excluded.types_json,
            },
        )
        await db.execute(stmt)

    await db.commit()

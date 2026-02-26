import logging
from datetime import datetime, timedelta

from sqlalchemy import distinct, select

from app.database import async_session_factory
from app.models.card import Card
from app.models.price import Price
from app.services.price_service import _fetch_fresh_prices

logger = logging.getLogger(__name__)


async def update_tracked_prices() -> None:
    """
    Background job: fetch fresh prices for all cards that have been
    viewed recently (have price records updated in the last 24 hours).
    Inserts new PriceHistory rows for charting.
    """
    logger.info("Starting scheduled price update...")

    async with async_session_factory() as db:
        try:
            # Find cards with recent price activity (viewed in last 24h)
            cutoff = datetime.utcnow() - timedelta(hours=24)
            stmt = (
                select(distinct(Price.card_id))
                .where(Price.updated_at >= cutoff)
            )
            result = await db.execute(stmt)
            card_ids = [row[0] for row in result.all()]

            if not card_ids:
                logger.info("No recently viewed cards to update")
                return

            logger.info("Updating prices for %d cards", len(card_ids))

            for card_id in card_ids:
                try:
                    card_stmt = select(Card).where(Card.id == card_id)
                    card_result = await db.execute(card_stmt)
                    card = card_result.scalar_one_or_none()
                    if card:
                        await _fetch_fresh_prices(db, card)
                        logger.debug("Updated prices for card %d: %s", card.id, card.name)
                except Exception:
                    logger.exception("Failed to update prices for card %d", card_id)

            await db.commit()
            logger.info("Completed scheduled price update for %d cards", len(card_ids))

        except Exception:
            logger.exception("Scheduled price update failed")
            await db.rollback()

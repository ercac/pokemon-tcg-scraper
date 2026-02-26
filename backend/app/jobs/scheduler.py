import logging

from apscheduler.schedulers.asyncio import AsyncIOScheduler

from app.config import settings
from app.jobs.price_updater import update_tracked_prices

logger = logging.getLogger(__name__)

scheduler = AsyncIOScheduler()


def setup_scheduler() -> None:
    """Configure and start the background job scheduler."""
    scheduler.add_job(
        update_tracked_prices,
        trigger="interval",
        minutes=settings.price_update_interval_minutes,
        id="price_updater",
        replace_existing=True,
        max_instances=1,
    )
    scheduler.start()
    logger.info(
        "Scheduler started — price updater runs every %d minutes",
        settings.price_update_interval_minutes,
    )


def shutdown_scheduler() -> None:
    """Shut down the scheduler gracefully."""
    if scheduler.running:
        scheduler.shutdown(wait=False)
        logger.info("Scheduler shut down")

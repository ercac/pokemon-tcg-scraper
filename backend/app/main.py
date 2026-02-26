import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from app.config import settings
from app.database import Base, engine
from app.integrations.ebay_api import ebay_client
from app.integrations.pokemon_tcg_api import pokemon_tcg_client
from app.integrations.tcgplayer_api import tcgplayer_client
from app.jobs.scheduler import setup_scheduler, shutdown_scheduler
from app.middleware.rate_limit import limiter
from app.routers import cards, health, sets

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    await pokemon_tcg_client.start()

    if tcgplayer_client.is_configured:
        await tcgplayer_client.start()
        logger.info("TCGPlayer API client started")
    else:
        logger.warning("TCGPlayer API not configured - skipping")

    if ebay_client.is_configured:
        await ebay_client.start()
        logger.info("eBay API client started")
    else:
        logger.warning("eBay API not configured - skipping")

    setup_scheduler()

    yield

    # Shutdown
    shutdown_scheduler()
    await pokemon_tcg_client.close()
    await tcgplayer_client.close()
    await ebay_client.close()
    await engine.dispose()


app = FastAPI(
    title="Pokemon TCG Price Comparison",
    version="0.1.0",
    lifespan=lifespan,
)

# Rate limiting
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(health.router)
app.include_router(cards.router)
app.include_router(sets.router)

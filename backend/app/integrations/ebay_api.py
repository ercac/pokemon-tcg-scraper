import base64
import logging
import statistics
import time
from typing import Any

import httpx

from app.config import settings
from app.integrations.base_client import BaseAPIClient

logger = logging.getLogger(__name__)

POKEMON_CARDS_CATEGORY = "183454"


class EbayClient(BaseAPIClient):
    def __init__(self):
        super().__init__(
            base_url=settings.ebay_api_base,
            max_concurrent=3,
        )
        self._token: str | None = None
        self._token_expires_at: float = 0

    @property
    def is_configured(self) -> bool:
        return bool(settings.ebay_app_id and settings.ebay_cert_id)

    async def _ensure_authenticated(self) -> None:
        if self._token and time.time() < self._token_expires_at:
            return
        await self._authenticate()

    async def _authenticate(self) -> None:
        """Obtain a bearer token using client credentials."""
        if not self.is_configured:
            raise RuntimeError("eBay API credentials not configured")

        credentials = f"{settings.ebay_app_id}:{settings.ebay_cert_id}"
        encoded = base64.b64encode(credentials.encode()).decode()

        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                "https://api.ebay.com/identity/v1/oauth2/token",
                data={
                    "grant_type": "client_credentials",
                    "scope": "https://api.ebay.com/oauth/api_scope",
                },
                headers={
                    "Content-Type": "application/x-www-form-urlencoded",
                    "Authorization": f"Basic {encoded}",
                },
            )
            response.raise_for_status()
            data = response.json()

        self._token = data["access_token"]
        expires_in = data.get("expires_in", 7200)
        self._token_expires_at = time.time() + expires_in - 300

        if self._client:
            self._client.headers["Authorization"] = f"Bearer {self._token}"

    async def start(self):
        await super().start()
        if self.is_configured:
            await self._authenticate()
            self._client.headers["Authorization"] = f"Bearer {self._token}"

    async def _authed_request(
        self, method: str, path: str, **kwargs
    ) -> httpx.Response:
        await self._ensure_authenticated()
        return await self._request(method, path, **kwargs)

    async def search_listings(
        self,
        card_name: str,
        set_name: str | None = None,
        limit: int = 25,
    ) -> list[dict[str, Any]]:
        """Search eBay Browse API for Pokemon card listings."""
        query = f"Pokemon {card_name}"
        if set_name:
            query += f" {set_name}"

        params = {
            "q": query,
            "category_ids": POKEMON_CARDS_CATEGORY,
            "filter": "buyingOptions:{FIXED_PRICE},conditionIds:{1000|1500|2000|2500|3000}",
            "limit": str(limit),
            "sort": "price",
        }

        response = await self._authed_request(
            "GET",
            "/buy/browse/v1/item_summary/search",
            params=params,
        )
        data = response.json()
        return data.get("itemSummaries", [])

    def aggregate_prices(
        self, listings: list[dict[str, Any]]
    ) -> dict[str, Any]:
        """Aggregate eBay listing prices into low/mid/high/market format."""
        prices = []
        for item in listings:
            price_data = item.get("price", {})
            try:
                value = float(price_data.get("value", 0))
                if value > 0:
                    prices.append(value)
            except (ValueError, TypeError):
                continue

        if not prices:
            return {
                "low_price": None,
                "mid_price": None,
                "high_price": None,
                "market_price": None,
            }

        prices.sort()
        return {
            "low_price": round(prices[0], 2),
            "mid_price": round(statistics.median(prices), 2),
            "high_price": round(prices[-1], 2) if len(prices) > 2 else round(prices[-1], 2),
            "market_price": round(statistics.median(prices), 2),
        }

    def extract_listing_url(self, card_name: str) -> str:
        """Generate a search URL for eBay."""
        query = card_name.replace(" ", "+")
        return f"https://www.ebay.com/sch/i.html?_nkw=Pokemon+{query}&_sacat=183454"


ebay_client = EbayClient()

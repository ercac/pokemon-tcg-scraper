import logging
import time
from typing import Any

import httpx

from app.config import settings
from app.integrations.base_client import BaseAPIClient

logger = logging.getLogger(__name__)


class TCGPlayerClient(BaseAPIClient):
    POKEMON_CATEGORY_ID = 3

    def __init__(self):
        super().__init__(
            base_url=settings.tcgplayer_api_base,
            max_concurrent=5,
        )
        self._token: str | None = None
        self._token_expires_at: float = 0

    @property
    def is_configured(self) -> bool:
        return bool(settings.tcgplayer_public_key and settings.tcgplayer_private_key)

    async def _ensure_authenticated(self) -> None:
        if self._token and time.time() < self._token_expires_at:
            return
        await self._authenticate()

    async def _authenticate(self) -> None:
        """Obtain a bearer token using client credentials."""
        if not self.is_configured:
            raise RuntimeError("TCGPlayer API credentials not configured")

        # TCGPlayer token endpoint is at the API root, not versioned
        token_url = "https://api.tcgplayer.com/token"
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                token_url,
                data={
                    "grant_type": "client_credentials",
                    "client_id": settings.tcgplayer_public_key,
                    "client_secret": settings.tcgplayer_private_key,
                },
                headers={"Content-Type": "application/x-www-form-urlencoded"},
            )
            response.raise_for_status()
            data = response.json()

        self._token = data["access_token"]
        # Token is typically valid for ~14 days, refresh 1 hour early
        expires_in = data.get(".expires_in", 1209600)
        self._token_expires_at = time.time() + expires_in - 3600

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

    async def search_products(
        self, card_name: str, set_name: str | None = None
    ) -> list[dict[str, Any]]:
        """Search TCGPlayer catalog for Pokemon card products."""
        filters = [
            {"name": "productName", "values": [card_name]},
        ]
        if set_name:
            filters.append({"name": "setName", "values": [set_name]})

        response = await self._authed_request(
            "POST",
            f"/catalog/categories/{self.POKEMON_CATEGORY_ID}/search",
            json={
                "sort": "relevance",
                "limit": 10,
                "offset": 0,
                "filters": filters,
            },
        )
        data = response.json()
        return data.get("results", [])

    async def get_product_prices(
        self, product_ids: list[int]
    ) -> list[dict[str, Any]]:
        """Get market prices for products by their IDs."""
        if not product_ids:
            return []

        # TCGPlayer allows comma-separated product IDs
        ids_str = ",".join(str(pid) for pid in product_ids[:10])
        response = await self._authed_request(
            "GET",
            f"/pricing/product/{ids_str}",
        )
        data = response.json()
        return data.get("results", [])

    async def get_product_details(
        self, product_ids: list[int]
    ) -> list[dict[str, Any]]:
        """Get product details including URLs."""
        if not product_ids:
            return []

        ids_str = ",".join(str(pid) for pid in product_ids[:10])
        response = await self._authed_request(
            "GET",
            f"/catalog/products/{ids_str}",
        )
        data = response.json()
        return data.get("results", [])


tcgplayer_client = TCGPlayerClient()

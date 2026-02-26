import logging
from typing import Any

from app.config import settings
from app.integrations.base_client import BaseAPIClient

logger = logging.getLogger(__name__)


class PokemonTCGClient(BaseAPIClient):
    def __init__(self):
        super().__init__(
            base_url=settings.pokemon_tcg_api_base,
            max_concurrent=3,
        )

    async def start(self):
        await super().start()
        if settings.pokemon_tcg_api_key:
            self._client.headers["X-Api-Key"] = settings.pokemon_tcg_api_key

    async def search_cards(
        self, query: str, page: int = 1, page_size: int = 20
    ) -> dict[str, Any]:
        response = await self._get(
            "/cards",
            params={
                "q": f"name:{query}*",
                "page": page,
                "pageSize": page_size,
                "orderBy": "name",
            },
        )
        return response.json()

    async def get_card(self, pokemon_tcg_id: str) -> dict[str, Any]:
        response = await self._get(f"/cards/{pokemon_tcg_id}")
        return response.json()

    async def get_sets(
        self, page: int = 1, page_size: int = 50
    ) -> dict[str, Any]:
        response = await self._get(
            "/sets",
            params={
                "page": page,
                "pageSize": page_size,
                "orderBy": "-releaseDate",
            },
        )
        return response.json()


pokemon_tcg_client = PokemonTCGClient()

import asyncio
import logging

import httpx

logger = logging.getLogger(__name__)


class BaseAPIClient:
    def __init__(self, base_url: str, max_concurrent: int = 5, timeout: float = 30.0):
        self._base_url = base_url
        self._semaphore = asyncio.Semaphore(max_concurrent)
        self._timeout = timeout
        self._client: httpx.AsyncClient | None = None

    async def start(self):
        self._client = httpx.AsyncClient(
            base_url=self._base_url,
            timeout=self._timeout,
        )

    async def close(self):
        if self._client:
            await self._client.aclose()
            self._client = None

    async def _request(
        self,
        method: str,
        path: str,
        **kwargs,
    ) -> httpx.Response:
        if not self._client:
            await self.start()
        async with self._semaphore:
            response = await self._client.request(method, path, **kwargs)
            response.raise_for_status()
            return response

    async def _get(self, path: str, **kwargs) -> httpx.Response:
        return await self._request("GET", path, **kwargs)

    async def _post(self, path: str, **kwargs) -> httpx.Response:
        return await self._request("POST", path, **kwargs)

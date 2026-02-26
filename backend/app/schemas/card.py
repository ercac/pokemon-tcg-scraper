import json
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, computed_field


class CardSummary(BaseModel):
    id: int
    name: str
    set_name: str
    number: str
    rarity: Optional[str] = None
    image_small: Optional[str] = None
    lowest_price: Optional[float] = None
    lowest_price_marketplace: Optional[str] = None

    model_config = {"from_attributes": True}


class CardDetail(BaseModel):
    id: int
    pokemon_tcg_id: str
    name: str
    set_name: str
    set_code: str
    number: str
    rarity: Optional[str] = None
    supertype: str
    image_small: Optional[str] = None
    image_large: Optional[str] = None
    artist: Optional[str] = None
    hp: Optional[str] = None
    types_json: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}

    @computed_field
    @property
    def types(self) -> list[str]:
        if self.types_json:
            try:
                return json.loads(self.types_json)
            except (json.JSONDecodeError, TypeError):
                pass
        return []


class PaginatedCardResponse(BaseModel):
    items: list[CardSummary]
    total: int
    page: int
    page_size: int
    total_pages: int

from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class PriceEntry(BaseModel):
    condition: str
    variant: str
    low_price: Optional[float] = None
    mid_price: Optional[float] = None
    high_price: Optional[float] = None
    market_price: Optional[float] = None

    model_config = {"from_attributes": True}


class MarketplacePrices(BaseModel):
    marketplace: str
    url: Optional[str] = None
    prices: list[PriceEntry]


class PriceComparisonResponse(BaseModel):
    card_id: int
    card_name: str
    fetched_at: datetime
    marketplaces: list[MarketplacePrices]


class PriceHistoryPoint(BaseModel):
    date: datetime
    marketplace: str
    variant: str
    market_price: float

    model_config = {"from_attributes": True}

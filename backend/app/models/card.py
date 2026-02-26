from datetime import datetime
from typing import TYPE_CHECKING, Optional

from sqlalchemy import DateTime, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base

if TYPE_CHECKING:
    from app.models.price import Price, PriceHistory


class Card(Base):
    __tablename__ = "cards"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    pokemon_tcg_id: Mapped[str] = mapped_column(
        String(50), unique=True, index=True
    )
    tcgplayer_product_id: Mapped[Optional[int]] = mapped_column(
        Integer, index=True, nullable=True
    )
    name: Mapped[str] = mapped_column(String(200), index=True)
    set_name: Mapped[str] = mapped_column(String(200))
    set_code: Mapped[str] = mapped_column(String(50))
    number: Mapped[str] = mapped_column(String(20))
    rarity: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    supertype: Mapped[str] = mapped_column(String(50))
    image_small: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    image_large: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    artist: Mapped[Optional[str]] = mapped_column(String(200), nullable=True)
    hp: Mapped[Optional[str]] = mapped_column(String(10), nullable=True)
    types_json: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), onupdate=func.now()
    )

    prices: Mapped[list["Price"]] = relationship(
        back_populates="card", cascade="all, delete-orphan"
    )
    price_history: Mapped[list["PriceHistory"]] = relationship(
        back_populates="card", cascade="all, delete-orphan"
    )

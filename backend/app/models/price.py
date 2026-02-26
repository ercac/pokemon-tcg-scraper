import enum
from datetime import datetime
from typing import TYPE_CHECKING, Optional

from sqlalchemy import (
    DateTime,
    Float,
    ForeignKey,
    Index,
    Integer,
    String,
    UniqueConstraint,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base

if TYPE_CHECKING:
    from app.models.card import Card


class Marketplace(str, enum.Enum):
    TCGPLAYER = "tcgplayer"
    EBAY = "ebay"


class Condition(str, enum.Enum):
    NEAR_MINT = "near_mint"
    LIGHTLY_PLAYED = "lightly_played"
    MODERATELY_PLAYED = "moderately_played"
    HEAVILY_PLAYED = "heavily_played"
    DAMAGED = "damaged"


class Price(Base):
    __tablename__ = "prices"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    card_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("cards.id"), index=True
    )
    marketplace: Mapped[str] = mapped_column(String(20))
    condition: Mapped[str] = mapped_column(String(30))
    variant: Mapped[str] = mapped_column(String(30), default="Normal")
    low_price: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    mid_price: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    high_price: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    market_price: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    listing_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), onupdate=func.now()
    )

    card: Mapped["Card"] = relationship(back_populates="prices")

    __table_args__ = (
        UniqueConstraint(
            "card_id", "marketplace", "condition", "variant",
            name="uq_price_source",
        ),
    )


class PriceHistory(Base):
    __tablename__ = "price_history"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    card_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("cards.id"), index=True
    )
    marketplace: Mapped[str] = mapped_column(String(20))
    condition: Mapped[str] = mapped_column(String(30))
    variant: Mapped[str] = mapped_column(String(30), default="Normal")
    market_price: Mapped[float] = mapped_column(Float)
    recorded_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), index=True
    )

    card: Mapped["Card"] = relationship(back_populates="price_history")

    __table_args__ = (
        Index("ix_price_history_card_date", "card_id", "recorded_at"),
    )

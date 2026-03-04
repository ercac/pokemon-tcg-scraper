from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.schemas.card import CardDetail, CardSuggestion, CardSummary, PaginatedCardResponse
from app.schemas.price import PriceComparisonResponse, PriceHistoryPoint
from app.services import card_service, price_service

router = APIRouter(prefix="/api/cards", tags=["cards"])


@router.get("/suggest", response_model=list[CardSuggestion])
async def suggest_cards(
    q: str = Query(..., min_length=2, max_length=200),
    limit: int = Query(8, ge=1, le=20),
    db: AsyncSession = Depends(get_db),
):
    return await card_service.suggest_cards(db, q, limit)


@router.get("/popular", response_model=list[CardSummary])
async def get_popular_cards(
    limit: int = Query(12, ge=1, le=30),
    db: AsyncSession = Depends(get_db),
):
    return await card_service.get_popular_cards(db, limit)


@router.get("/facets")
async def get_card_facets(db: AsyncSession = Depends(get_db)):
    return await card_service.get_facets(db)


@router.get("/search", response_model=PaginatedCardResponse)
async def search_cards(
    q: str = Query(..., min_length=1, max_length=200),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    sort_by: str = Query("name"),
    sort_dir: str = Query("asc"),
    rarity: str | None = Query(None),
    supertype: str | None = Query(None),
    db: AsyncSession = Depends(get_db),
):
    return await card_service.search_cards(
        db, q, page, page_size,
        sort_by=sort_by, sort_dir=sort_dir,
        rarity=rarity, supertype=supertype,
    )


@router.get("/{card_id}", response_model=CardDetail)
async def get_card(
    card_id: int,
    db: AsyncSession = Depends(get_db),
):
    card = await card_service.get_card(db, card_id)
    if card is None:
        raise HTTPException(status_code=404, detail="Card not found")
    return card


@router.get("/{card_id}/related", response_model=list[CardSummary])
async def get_related_cards(
    card_id: int,
    limit: int = Query(6, ge=1, le=20),
    db: AsyncSession = Depends(get_db),
):
    return await card_service.get_cards_from_same_set(db, card_id, limit)


@router.get("/{card_id}/prices", response_model=PriceComparisonResponse)
async def get_card_prices(
    card_id: int,
    db: AsyncSession = Depends(get_db),
):
    result = await price_service.get_current_prices(db, card_id)
    if result is None:
        raise HTTPException(status_code=404, detail="Card not found")
    return result


@router.get("/{card_id}/price-history", response_model=list[PriceHistoryPoint])
async def get_price_history(
    card_id: int,
    days: int = Query(30, ge=7, le=365),
    marketplace: str | None = Query(None),
    db: AsyncSession = Depends(get_db),
):
    return await price_service.get_price_history(db, card_id, days, marketplace)

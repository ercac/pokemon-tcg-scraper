import { request } from './client'
import type { CardDetail, CardSuggestion, PaginatedCards, SetInfo } from '../types/card'
import type { PriceComparison, PriceHistoryPoint } from '../types/price'

export async function suggestCards(
  query: string,
  limit: number = 8,
): Promise<CardSuggestion[]> {
  return request<CardSuggestion[]>('/api/cards/suggest', { q: query, limit })
}

export async function searchCards(
  query: string,
  page: number = 1,
  pageSize: number = 20,
): Promise<PaginatedCards> {
  return request<PaginatedCards>('/api/cards/search', {
    q: query,
    page,
    page_size: pageSize,
  })
}

export async function getCard(cardId: number): Promise<CardDetail> {
  return request<CardDetail>(`/api/cards/${cardId}`)
}

export async function getCardPrices(cardId: number): Promise<PriceComparison> {
  return request<PriceComparison>(`/api/cards/${cardId}/prices`)
}

export async function getPriceHistory(
  cardId: number,
  days: number = 30,
  marketplace?: string,
): Promise<PriceHistoryPoint[]> {
  return request<PriceHistoryPoint[]>(`/api/cards/${cardId}/price-history`, {
    days,
    marketplace,
  })
}

export async function getSets(): Promise<SetInfo[]> {
  return request<SetInfo[]>('/api/sets')
}

import { request } from './client'
import type { CardDetail, CardSuggestion, CardSummary, PaginatedCards, SetInfo } from '../types/card'
import type { PriceComparison, PriceHistoryPoint } from '../types/price'

export async function suggestCards(
  query: string,
  limit: number = 8,
): Promise<CardSuggestion[]> {
  return request<CardSuggestion[]>('/api/cards/suggest', { q: query, limit })
}

export interface SearchParams {
  q: string
  page?: number
  page_size?: number
  sort_by?: string
  sort_dir?: string
  rarity?: string
  supertype?: string
}

export async function searchCards(params: SearchParams): Promise<PaginatedCards> {
  return request<PaginatedCards>('/api/cards/search', params as Record<string, string | number | undefined>)
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

export async function getPopularCards(limit: number = 12): Promise<CardSummary[]> {
  return request<CardSummary[]>('/api/cards/popular', { limit })
}

export async function getRelatedCards(cardId: number, limit: number = 6): Promise<CardSummary[]> {
  return request<CardSummary[]>(`/api/cards/${cardId}/related`, { limit })
}

export async function getCardFacets(): Promise<{ rarities: string[]; supertypes: string[] }> {
  return request('/api/cards/facets')
}

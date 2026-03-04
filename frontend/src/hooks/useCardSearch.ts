import { useQuery } from '@tanstack/react-query'
import { searchCards } from '../api/cards'
import type { SearchParams } from '../api/cards'

export function useCardSearch(params: SearchParams) {
  return useQuery({
    queryKey: ['cards', 'search', params],
    queryFn: () => searchCards(params),
    enabled: params.q.length > 0,
    staleTime: 5 * 60 * 1000,
  })
}

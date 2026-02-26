import { useQuery } from '@tanstack/react-query'
import { searchCards } from '../api/cards'

export function useCardSearch(query: string, page: number = 1) {
  return useQuery({
    queryKey: ['cards', 'search', query, page],
    queryFn: () => searchCards(query, page),
    enabled: query.length > 0,
    staleTime: 5 * 60 * 1000,
  })
}

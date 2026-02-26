import { useQuery } from '@tanstack/react-query'
import { getCard, getCardPrices } from '../api/cards'

export function useCard(cardId: number) {
  return useQuery({
    queryKey: ['cards', cardId],
    queryFn: () => getCard(cardId),
    staleTime: Infinity,
  })
}

export function useCardPrices(cardId: number) {
  return useQuery({
    queryKey: ['cards', cardId, 'prices'],
    queryFn: () => getCardPrices(cardId),
    staleTime: 5 * 60 * 1000,
  })
}

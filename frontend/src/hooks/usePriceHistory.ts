import { useQuery } from '@tanstack/react-query'
import { getPriceHistory } from '../api/cards'
import type { ChartDataPoint, PriceHistoryPoint } from '../types/price'

export function usePriceHistory(
  cardId: number,
  days: number = 30,
  marketplace?: string,
) {
  return useQuery({
    queryKey: ['cards', cardId, 'price-history', days, marketplace],
    queryFn: () => getPriceHistory(cardId, days, marketplace),
    staleTime: 5 * 60 * 1000,
    select: transformToChartData,
  })
}

function transformToChartData(points: PriceHistoryPoint[]): ChartDataPoint[] {
  const dateMap = new Map<string, ChartDataPoint>()

  for (const point of points) {
    const dateKey = point.date.split('T')[0]
    if (!dateMap.has(dateKey)) {
      dateMap.set(dateKey, { date: dateKey })
    }
    const entry = dateMap.get(dateKey)!
    entry[point.marketplace as 'tcgplayer' | 'ebay'] = point.market_price
  }

  return Array.from(dateMap.values()).sort(
    (a, b) => a.date.localeCompare(b.date),
  )
}

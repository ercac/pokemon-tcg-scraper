export interface PriceEntry {
  condition: string
  variant: string
  low_price: number | null
  mid_price: number | null
  high_price: number | null
  market_price: number | null
}

export interface MarketplacePrices {
  marketplace: string
  url: string | null
  prices: PriceEntry[]
}

export interface PriceComparison {
  card_id: number
  card_name: string
  fetched_at: string
  marketplaces: MarketplacePrices[]
}

export interface PriceHistoryPoint {
  date: string
  marketplace: string
  variant: string
  market_price: number
}

export interface ChartDataPoint {
  date: string
  tcgplayer?: number
  ebay?: number
}

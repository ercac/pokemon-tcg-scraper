export interface CardSummary {
  id: number
  name: string
  set_name: string
  number: string
  rarity: string | null
  image_small: string | null
  lowest_price: number | null
  lowest_price_marketplace: string | null
}

export interface CardDetail {
  id: number
  pokemon_tcg_id: string
  name: string
  set_name: string
  set_code: string
  number: string
  rarity: string | null
  supertype: string
  image_small: string | null
  image_large: string | null
  artist: string | null
  hp: string | null
  types: string[]
  created_at: string
  updated_at: string
}

export interface CardSuggestion {
  id: number
  name: string
  set_name: string
  image_small: string | null
}

export interface PaginatedCards {
  items: CardSummary[]
  total: number
  page: number
  page_size: number
  total_pages: number
}

export interface SetInfo {
  id: string
  name: string
  series: string
  total: number
  releaseDate: string
  images: {
    symbol: string
    logo: string
  }
}

import { useState, useCallback } from 'react'

export interface RecentlyViewedCard {
  id: number
  name: string
  set_name: string
  image_small: string | null
}

const STORAGE_KEY = 'recently-viewed-cards'
const MAX_ITEMS = 6

function loadFromStorage(): RecentlyViewedCard[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveToStorage(cards: RecentlyViewedCard[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cards))
  } catch {
    // localStorage full or disabled
  }
}

export function useRecentlyViewed() {
  const [cards, setCards] = useState<RecentlyViewedCard[]>(loadFromStorage)

  const addCard = useCallback((card: RecentlyViewedCard) => {
    setCards((prev) => {
      const filtered = prev.filter((c) => c.id !== card.id)
      const updated = [card, ...filtered].slice(0, MAX_ITEMS)
      saveToStorage(updated)
      return updated
    })
  }, [])

  return { cards, addCard }
}

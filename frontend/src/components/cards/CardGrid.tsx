import type { CardSummary } from '../../types/card'
import CardTile from './CardTile'

interface CardGridProps {
  cards: CardSummary[]
}

export default function CardGrid({ cards }: CardGridProps) {
  if (cards.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-slate-500 text-lg">No cards found</p>
        <p className="text-slate-400 text-sm mt-1">Try a different search term</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {cards.map((card, index) => (
        <div
          key={card.id}
          className="animate-fade-in-up opacity-0"
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <CardTile card={card} />
        </div>
      ))}
    </div>
  )
}

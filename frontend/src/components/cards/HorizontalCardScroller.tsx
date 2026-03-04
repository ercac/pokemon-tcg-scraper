import type { CardSummary } from '../../types/card'
import CardTile from './CardTile'

interface HorizontalCardScrollerProps {
  title: string
  cards: CardSummary[]
}

export default function HorizontalCardScroller({ title, cards }: HorizontalCardScrollerProps) {
  if (cards.length === 0) return null

  return (
    <section className="max-w-6xl w-full mb-12">
      <h2 className="text-xl font-semibold text-slate-900 mb-4">{title}</h2>
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin snap-x snap-mandatory">
        {cards.map((card) => (
          <div key={card.id} className="flex-shrink-0 w-40 snap-start">
            <CardTile card={card} />
          </div>
        ))}
      </div>
    </section>
  )
}

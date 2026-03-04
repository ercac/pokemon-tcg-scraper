import { Link } from 'react-router-dom'
import type { RecentlyViewedCard } from '../../hooks/useRecentlyViewed'
import CardImage from './CardImage'

interface RecentlyViewedRowProps {
  cards: RecentlyViewedCard[]
}

export default function RecentlyViewedRow({ cards }: RecentlyViewedRowProps) {
  if (cards.length === 0) return null

  return (
    <section className="max-w-4xl w-full mb-12">
      <h2 className="text-lg font-semibold text-slate-900 mb-4">Recently Viewed</h2>
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
        {cards.map((card) => (
          <Link
            key={card.id}
            to={`/cards/${card.id}`}
            className="group bg-white rounded-xl border border-slate-200 hover:shadow-md hover:border-blue-300 transition-all overflow-hidden"
          >
            <div className="aspect-[2.5/3.5] p-2 bg-slate-50">
              <CardImage src={card.image_small} alt={card.name} className="w-full h-full" />
            </div>
            <div className="p-2">
              <p className="text-xs font-medium text-slate-900 truncate group-hover:text-blue-600 transition">
                {card.name}
              </p>
              <p className="text-[10px] text-slate-400 truncate">{card.set_name}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}

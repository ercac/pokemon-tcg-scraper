import { Link } from 'react-router-dom'
import type { CardSummary } from '../../types/card'
import { formatUSD } from '../../utils/formatPrice'
import CardImage from './CardImage'

interface CardTileProps {
  card: CardSummary
}

export default function CardTile({ card }: CardTileProps) {
  return (
    <Link
      to={`/cards/${card.id}`}
      className="group bg-white rounded-xl shadow-sm hover:shadow-lg border border-slate-200 hover:border-blue-300 transition-all duration-200 overflow-hidden flex flex-col"
    >
      <div className="aspect-[2.5/3.5] p-3 bg-slate-50">
        <CardImage
          src={card.image_small}
          alt={card.name}
          className="w-full h-full"
        />
      </div>
      <div className="p-3 flex flex-col gap-1">
        <h3 className="font-semibold text-sm text-slate-900 truncate group-hover:text-blue-600 transition">
          {card.name}
        </h3>
        <p className="text-xs text-slate-500 truncate">
          {card.set_name} &middot; #{card.number}
        </p>
        {card.rarity && (
          <span className="text-xs text-slate-400">{card.rarity}</span>
        )}
        {card.lowest_price !== null && (
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-lg font-bold text-green-600">
              {formatUSD(card.lowest_price)}
            </span>
            {card.lowest_price_marketplace && (
              <span className="text-xs text-slate-400">
                on {card.lowest_price_marketplace}
              </span>
            )}
          </div>
        )}
      </div>
    </Link>
  )
}

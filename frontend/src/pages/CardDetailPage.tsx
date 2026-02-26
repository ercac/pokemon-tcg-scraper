import { useParams } from 'react-router-dom'
import { useCard, useCardPrices } from '../hooks/useCard'
import CardImage from '../components/cards/CardImage'
import PriceComparisonTable from '../components/prices/PriceComparisonTable'
import PriceHistoryChart from '../components/prices/PriceHistoryChart'
import LoadingSpinner from '../components/common/LoadingSpinner'
import ErrorMessage from '../components/common/ErrorMessage'

export default function CardDetailPage() {
  const { id } = useParams<{ id: string }>()
  const cardId = parseInt(id || '0', 10)

  const { data: card, isLoading: cardLoading, error: cardError } = useCard(cardId)
  const { data: prices, isLoading: pricesLoading } = useCardPrices(cardId)

  if (cardLoading) return <LoadingSpinner />
  if (cardError) return <ErrorMessage message={cardError.message} />
  if (!card) return <ErrorMessage message="Card not found" />

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Card header */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
        {/* Card image */}
        <div className="lg:col-span-1">
          <CardImage
            src={card.image_large || card.image_small}
            alt={card.name}
            className="w-full max-w-sm mx-auto aspect-[2.5/3.5]"
          />
        </div>

        {/* Card info + prices */}
        <div className="lg:col-span-2">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">{card.name}</h1>
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="px-3 py-1 bg-slate-100 rounded-full text-sm text-slate-600">
              {card.set_name}
            </span>
            <span className="px-3 py-1 bg-slate-100 rounded-full text-sm text-slate-600">
              #{card.number}
            </span>
            {card.rarity && (
              <span className="px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-sm">
                {card.rarity}
              </span>
            )}
            <span className="px-3 py-1 bg-slate-100 rounded-full text-sm text-slate-600">
              {card.supertype}
            </span>
          </div>

          {/* Card metadata */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            {card.hp && (
              <div>
                <span className="text-xs text-slate-400 uppercase tracking-wider">HP</span>
                <p className="font-semibold text-slate-900">{card.hp}</p>
              </div>
            )}
            {card.types && card.types.length > 0 && (
              <div>
                <span className="text-xs text-slate-400 uppercase tracking-wider">Types</span>
                <p className="font-semibold text-slate-900">{card.types.join(', ')}</p>
              </div>
            )}
            {card.artist && (
              <div>
                <span className="text-xs text-slate-400 uppercase tracking-wider">Artist</span>
                <p className="font-semibold text-slate-900">{card.artist}</p>
              </div>
            )}
            <div>
              <span className="text-xs text-slate-400 uppercase tracking-wider">Set Code</span>
              <p className="font-semibold text-slate-900">{card.set_code}</p>
            </div>
          </div>

          {/* Price comparison */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">
              Price Comparison
            </h2>
            {pricesLoading ? (
              <LoadingSpinner />
            ) : prices ? (
              <PriceComparisonTable data={prices} />
            ) : (
              <p className="text-slate-400 text-center py-4">No price data available</p>
            )}
          </div>
        </div>
      </div>

      {/* Price history chart */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <PriceHistoryChart cardId={cardId} />
      </div>
    </div>
  )
}

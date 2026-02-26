import { useState } from 'react'
import type { PriceComparison } from '../../types/price'
import { formatUSD } from '../../utils/formatPrice'

interface PriceComparisonTableProps {
  data: PriceComparison
}

const MARKETPLACE_COLORS: Record<string, string> = {
  tcgplayer: 'bg-blue-600',
  ebay: 'bg-red-500',
}

const MARKETPLACE_LABELS: Record<string, string> = {
  tcgplayer: 'TCGPlayer',
  ebay: 'eBay',
}

export default function PriceComparisonTable({ data }: PriceComparisonTableProps) {
  // Collect all unique variants across marketplaces
  const allVariants = Array.from(
    new Set(data.marketplaces.flatMap((mp) => mp.prices.map((p) => p.variant))),
  )
  const [selectedVariant, setSelectedVariant] = useState(allVariants[0] || 'Normal')

  return (
    <div>
      {/* Variant tabs */}
      {allVariants.length > 1 && (
        <div className="flex gap-2 mb-4">
          {allVariants.map((v) => (
            <button
              key={v}
              onClick={() => setSelectedVariant(v)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${
                v === selectedVariant
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      )}

      {/* Price table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="text-left py-3 px-4 font-semibold text-slate-600">Marketplace</th>
              <th className="text-right py-3 px-4 font-semibold text-green-600">Low</th>
              <th className="text-right py-3 px-4 font-semibold text-blue-600">Market</th>
              <th className="text-right py-3 px-4 font-semibold text-orange-600">High</th>
              <th className="text-right py-3 px-4 font-semibold text-slate-600"></th>
            </tr>
          </thead>
          <tbody>
            {data.marketplaces.map((mp) => {
              const priceEntry = mp.prices.find((p) => p.variant === selectedVariant)
              return (
                <tr key={mp.marketplace} className="border-b border-slate-100 hover:bg-slate-50 transition">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2.5 h-2.5 rounded-full ${
                          MARKETPLACE_COLORS[mp.marketplace] || 'bg-slate-400'
                        }`}
                      />
                      <span className="font-medium">
                        {MARKETPLACE_LABELS[mp.marketplace] || mp.marketplace}
                      </span>
                    </div>
                  </td>
                  <td className="text-right py-4 px-4 text-green-600 font-medium">
                    {formatUSD(priceEntry?.low_price)}
                  </td>
                  <td className="text-right py-4 px-4 text-blue-600 font-bold text-base">
                    {formatUSD(priceEntry?.market_price)}
                  </td>
                  <td className="text-right py-4 px-4 text-orange-600 font-medium">
                    {formatUSD(priceEntry?.high_price)}
                  </td>
                  <td className="text-right py-4 px-4">
                    {mp.url && (
                      <a
                        href={mp.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-md text-xs font-medium hover:bg-blue-700 transition"
                      >
                        Buy
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {data.marketplaces.length === 0 && (
        <div className="text-center py-8 text-slate-400">
          No price data available yet. Prices will be fetched from marketplaces.
        </div>
      )}
    </div>
  )
}

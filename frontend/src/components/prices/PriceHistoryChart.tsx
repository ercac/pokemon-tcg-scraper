import { useState } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'
import type { ChartDataPoint } from '../../types/price'
import { formatDate, formatUSD } from '../../utils/formatPrice'
import { usePriceHistory } from '../../hooks/usePriceHistory'
import LoadingSpinner from '../common/LoadingSpinner'

interface PriceHistoryChartProps {
  cardId: number
}

const MARKETPLACE_COLORS: Record<string, string> = {
  tcgplayer: '#2563eb',
  ebay: '#dc2626',
}

const DATE_RANGES = [
  { label: '7d', days: 7 },
  { label: '30d', days: 30 },
  { label: '90d', days: 90 },
  { label: '1y', days: 365 },
]

export default function PriceHistoryChart({ cardId }: PriceHistoryChartProps) {
  const [days, setDays] = useState(30)
  const { data, isLoading, error } = usePriceHistory(cardId, days)

  return (
    <div>
      {/* Date range selector */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-900">Price History</h3>
        <div className="flex gap-1">
          {DATE_RANGES.map((range) => (
            <button
              key={range.days}
              onClick={() => setDays(range.days)}
              className={`px-3 py-1 rounded-md text-sm font-medium transition ${
                days === range.days
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading && <LoadingSpinner />}

      {error && (
        <div className="text-center py-8 text-slate-400 text-sm">
          Unable to load price history
        </div>
      )}

      {data && data.length > 0 ? (
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              dataKey="date"
              tickFormatter={formatDate}
              stroke="#94a3b8"
              fontSize={12}
            />
            <YAxis
              tickFormatter={(v: number) => formatUSD(v)}
              stroke="#94a3b8"
              fontSize={12}
              width={80}
            />
            <Tooltip
              formatter={(value: number) => formatUSD(value)}
              labelFormatter={formatDate}
              contentStyle={{
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
              }}
            />
            <Legend />
            {Object.entries(MARKETPLACE_COLORS).map(([marketplace, color]) => (
              <Line
                key={marketplace}
                type="monotone"
                dataKey={marketplace}
                name={marketplace === 'tcgplayer' ? 'TCGPlayer' : 'eBay'}
                stroke={color}
                strokeWidth={2}
                dot={false}
                connectNulls
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      ) : (
        !isLoading && (
          <div className="text-center py-12 text-slate-400">
            <p className="text-lg">No price history available yet</p>
            <p className="text-sm mt-1">
              History will be recorded as prices are tracked over time
            </p>
          </div>
        )
      )}
    </div>
  )
}

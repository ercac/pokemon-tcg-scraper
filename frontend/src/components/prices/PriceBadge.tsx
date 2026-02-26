import { formatUSD } from '../../utils/formatPrice'

interface PriceBadgeProps {
  price: number | null
  label?: string
  variant?: 'low' | 'market' | 'high'
}

const variantStyles = {
  low: 'bg-green-50 text-green-700 border-green-200',
  market: 'bg-blue-50 text-blue-700 border-blue-200',
  high: 'bg-orange-50 text-orange-700 border-orange-200',
}

export default function PriceBadge({ price, label, variant = 'market' }: PriceBadgeProps) {
  return (
    <div className={`px-3 py-2 rounded-lg border ${variantStyles[variant]}`}>
      {label && <p className="text-xs font-medium opacity-75">{label}</p>}
      <p className="text-lg font-bold">{formatUSD(price)}</p>
    </div>
  )
}

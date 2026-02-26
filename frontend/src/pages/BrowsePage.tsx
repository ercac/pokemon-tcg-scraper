import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { getSets } from '../api/cards'
import LoadingSpinner from '../components/common/LoadingSpinner'
import ErrorMessage from '../components/common/ErrorMessage'

export default function BrowsePage() {
  const navigate = useNavigate()
  const { data: sets, isLoading, error, refetch } = useQuery({
    queryKey: ['sets'],
    queryFn: getSets,
    staleTime: 30 * 60 * 1000,
  })

  if (isLoading) return <LoadingSpinner />
  if (error) return <ErrorMessage message={error.message} onRetry={() => refetch()} />

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Browse Sets</h1>

      {sets && sets.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {sets.map((set) => (
            <button
              key={set.id}
              onClick={() =>
                navigate(`/search?q=${encodeURIComponent(set.name)}`)
              }
              className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md hover:border-blue-300 transition text-left group"
            >
              <div className="flex items-center gap-3 mb-2">
                {set.images?.symbol && (
                  <img
                    src={set.images.symbol}
                    alt={set.name}
                    className="h-6 w-6 object-contain"
                  />
                )}
                <h3 className="font-semibold text-slate-900 group-hover:text-blue-600 transition truncate">
                  {set.name}
                </h3>
              </div>
              <div className="flex justify-between text-sm text-slate-500">
                <span>{set.series}</span>
                <span>{set.total} cards</span>
              </div>
              {set.releaseDate && (
                <p className="text-xs text-slate-400 mt-1">{set.releaseDate}</p>
              )}
            </button>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-slate-400">
          No sets available
        </div>
      )}
    </div>
  )
}

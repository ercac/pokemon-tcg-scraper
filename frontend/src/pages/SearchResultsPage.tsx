import { useSearchParams } from 'react-router-dom'
import { useCardSearch } from '../hooks/useCardSearch'
import CardGrid from '../components/cards/CardGrid'
import Pagination from '../components/common/Pagination'
import LoadingSpinner from '../components/common/LoadingSpinner'
import ErrorMessage from '../components/common/ErrorMessage'

export default function SearchResultsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const query = searchParams.get('q') || ''
  const page = parseInt(searchParams.get('page') || '1', 10)

  const { data, isLoading, error, refetch } = useCardSearch(query, page)

  const handlePageChange = (newPage: number) => {
    setSearchParams({ q: query, page: String(newPage) })
  }

  if (!query) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <p className="text-slate-500 text-lg">Enter a search term to find cards</p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Search info */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">
          Results for &ldquo;{query}&rdquo;
        </h1>
        {data && (
          <p className="text-sm text-slate-500 mt-1">
            {data.total} card{data.total !== 1 ? 's' : ''} found
          </p>
        )}
      </div>

      {isLoading && <LoadingSpinner />}

      {error && (
        <ErrorMessage
          message={error.message}
          onRetry={() => refetch()}
        />
      )}

      {data && (
        <>
          <CardGrid cards={data.items} />
          <Pagination
            page={data.page}
            totalPages={data.total_pages}
            onPageChange={handlePageChange}
          />
        </>
      )}
    </div>
  )
}

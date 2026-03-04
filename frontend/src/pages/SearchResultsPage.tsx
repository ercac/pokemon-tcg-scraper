import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useCardSearch } from '../hooks/useCardSearch'
import { getCardFacets } from '../api/cards'
import { useToast } from '../components/common/Toast'
import CardGrid from '../components/cards/CardGrid'
import CardGridSkeleton from '../components/common/CardGridSkeleton'
import SearchToolbar from '../components/search/SearchToolbar'
import Pagination from '../components/common/Pagination'

export default function SearchResultsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { showToast } = useToast()

  const query = searchParams.get('q') || ''
  const page = parseInt(searchParams.get('page') || '1', 10)
  const sortBy = searchParams.get('sort_by') || 'name'
  const sortDir = searchParams.get('sort_dir') || 'asc'
  const rarity = searchParams.get('rarity') || ''
  const supertype = searchParams.get('supertype') || ''

  const { data, isLoading, error } = useCardSearch({
    q: query,
    page,
    sort_by: sortBy,
    sort_dir: sortDir,
    rarity: rarity || undefined,
    supertype: supertype || undefined,
  })

  const { data: facets } = useQuery({
    queryKey: ['card-facets'],
    queryFn: getCardFacets,
    staleTime: 30 * 60 * 1000,
  })

  useEffect(() => {
    if (error) {
      showToast(error.message, 'error')
    }
  }, [error, showToast])

  const updateParams = (updates: Record<string, string>) => {
    const params: Record<string, string> = { q: query }
    if (sortBy !== 'name' || sortDir !== 'asc') {
      params.sort_by = sortBy
      params.sort_dir = sortDir
    }
    if (rarity) params.rarity = rarity
    if (supertype) params.supertype = supertype
    // Apply updates and reset page to 1 if filter/sort changed
    const newParams = { ...params, ...updates }
    if (updates.sort_by || updates.rarity || updates.supertype) {
      newParams.page = '1'
    }
    setSearchParams(newParams)
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

      {/* Sort & Filter Toolbar */}
      <SearchToolbar
        sortBy={sortBy}
        sortDir={sortDir}
        rarity={rarity}
        supertype={supertype}
        rarities={facets?.rarities || []}
        supertypes={facets?.supertypes || []}
        onSortChange={(sb, sd) => updateParams({ sort_by: sb, sort_dir: sd })}
        onRarityChange={(r) => updateParams({ rarity: r })}
        onSupertypeChange={(s) => updateParams({ supertype: s })}
      />

      {isLoading && <CardGridSkeleton count={20} />}

      {data && (
        <>
          <CardGrid cards={data.items} />
          <Pagination
            page={data.page}
            totalPages={data.total_pages}
            onPageChange={(newPage) => updateParams({ page: String(newPage) })}
          />
        </>
      )}
    </div>
  )
}

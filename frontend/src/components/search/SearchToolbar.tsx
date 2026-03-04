interface SearchToolbarProps {
  sortBy: string
  sortDir: string
  rarity: string
  supertype: string
  rarities: string[]
  supertypes: string[]
  onSortChange: (sortBy: string, sortDir: string) => void
  onRarityChange: (rarity: string) => void
  onSupertypeChange: (supertype: string) => void
}

const SORT_OPTIONS = [
  { label: 'Name A-Z', sortBy: 'name', sortDir: 'asc' },
  { label: 'Name Z-A', sortBy: 'name', sortDir: 'desc' },
  { label: 'Set', sortBy: 'set_name', sortDir: 'asc' },
  { label: 'Rarity', sortBy: 'rarity', sortDir: 'asc' },
]

const selectClass =
  'px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition'

export default function SearchToolbar({
  sortBy,
  sortDir,
  rarity,
  supertype,
  rarities,
  supertypes,
  onSortChange,
  onRarityChange,
  onSupertypeChange,
}: SearchToolbarProps) {
  const currentSort = `${sortBy}-${sortDir}`

  return (
    <div className="flex flex-wrap items-center gap-3 mb-6 p-3 bg-white rounded-xl border border-slate-200">
      <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Sort</label>
      <select
        value={currentSort}
        onChange={(e) => {
          const [sb, sd] = e.target.value.split('-')
          onSortChange(sb, sd)
        }}
        className={selectClass}
      >
        {SORT_OPTIONS.map((opt) => (
          <option key={`${opt.sortBy}-${opt.sortDir}`} value={`${opt.sortBy}-${opt.sortDir}`}>
            {opt.label}
          </option>
        ))}
      </select>

      {rarities.length > 0 && (
        <>
          <div className="hidden sm:block w-px h-6 bg-slate-200" />
          <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Rarity</label>
          <select
            value={rarity}
            onChange={(e) => onRarityChange(e.target.value)}
            className={selectClass}
          >
            <option value="">All</option>
            {rarities.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </>
      )}

      {supertypes.length > 0 && (
        <>
          <div className="hidden sm:block w-px h-6 bg-slate-200" />
          <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Type</label>
          <select
            value={supertype}
            onChange={(e) => onSupertypeChange(e.target.value)}
            className={selectClass}
          >
            <option value="">All</option>
            {supertypes.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </>
      )}
    </div>
  )
}

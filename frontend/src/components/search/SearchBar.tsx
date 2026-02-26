import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

interface SearchBarProps {
  large?: boolean
  initialQuery?: string
}

export default function SearchBar({ large = false, initialQuery = '' }: SearchBarProps) {
  const [query, setQuery] = useState(initialQuery)
  const navigate = useNavigate()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for a Pokemon card..."
          className={`w-full bg-white border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition ${
            large
              ? 'px-6 py-4 text-lg pr-14'
              : 'px-4 py-3 text-base pr-12'
          }`}
        />
        <button
          type="submit"
          className={`absolute right-2 top-1/2 -translate-y-1/2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center justify-center ${
            large ? 'h-10 w-10' : 'h-8 w-8'
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className={large ? 'h-5 w-5' : 'h-4 w-4'} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>
      </div>
    </form>
  )
}

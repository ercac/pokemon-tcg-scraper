import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'

export default function Header() {
  const [query, setQuery] = useState('')
  const navigate = useNavigate()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`)
    }
  }

  return (
    <header className="bg-slate-900 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <span className="text-2xl">⚡</span>
            <span className="font-bold text-lg hidden sm:block">
              PokePriceCheck
            </span>
          </Link>

          {/* Search Bar */}
          <form
            onSubmit={handleSearch}
            className="flex-1 max-w-lg mx-4"
          >
            <div className="relative">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search cards..."
                className="w-full bg-slate-800 text-white placeholder-slate-400 rounded-lg px-4 py-2 pr-10 border border-slate-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
          </form>

          {/* Nav Links */}
          <nav className="flex items-center gap-4">
            <Link
              to="/browse"
              className="text-slate-300 hover:text-white transition text-sm font-medium"
            >
              Browse Sets
            </Link>
          </nav>
        </div>
      </div>
    </header>
  )
}

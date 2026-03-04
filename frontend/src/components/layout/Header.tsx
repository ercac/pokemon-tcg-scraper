import { useState } from 'react'
import { Link } from 'react-router-dom'
import SearchBar from '../search/SearchBar'

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)

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

          {/* Search Bar - hidden on mobile */}
          <div className="flex-1 max-w-lg mx-4 hidden sm:block">
            <SearchBar variant="header" />
          </div>

          {/* Desktop Nav */}
          <nav className="hidden sm:flex items-center gap-4">
            <Link
              to="/browse"
              className="text-slate-300 hover:text-white transition text-sm font-medium"
            >
              Browse Sets
            </Link>
          </nav>

          {/* Hamburger button - mobile only */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="sm:hidden p-2 text-slate-300 hover:text-white transition"
            aria-label="Toggle menu"
          >
            {menuOpen ? (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu panel */}
      {menuOpen && (
        <div className="sm:hidden border-t border-slate-800 px-4 py-3 space-y-3">
          <SearchBar variant="header" />
          <Link
            to="/browse"
            onClick={() => setMenuOpen(false)}
            className="block text-slate-300 hover:text-white transition text-sm font-medium py-2"
          >
            Browse Sets
          </Link>
        </div>
      )}
    </header>
  )
}

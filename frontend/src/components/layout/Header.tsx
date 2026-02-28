import { Link } from 'react-router-dom'
import SearchBar from '../search/SearchBar'

export default function Header() {
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
          <div className="flex-1 max-w-lg mx-4">
            <SearchBar variant="header" />
          </div>

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

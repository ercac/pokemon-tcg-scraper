import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { suggestCards } from '../../api/cards'
import type { CardSuggestion } from '../../types/card'

interface SearchBarProps {
  large?: boolean
  initialQuery?: string
  variant?: 'default' | 'header'
}

export default function SearchBar({ large = false, initialQuery = '', variant = 'default' }: SearchBarProps) {
  const isHeader = variant === 'header'
  const [query, setQuery] = useState(initialQuery)
  const [suggestions, setSuggestions] = useState<CardSuggestion[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const navigate = useNavigate()
  const wrapperRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const fetchSuggestions = useCallback(async (q: string) => {
    if (q.trim().length < 2) {
      setSuggestions([])
      setIsOpen(false)
      return
    }
    try {
      const results = await suggestCards(q.trim())
      setSuggestions(results)
      setIsOpen(results.length > 0)
      setActiveIndex(-1)
    } catch {
      setSuggestions([])
      setIsOpen(false)
    }
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => fetchSuggestions(value), 250)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsOpen(false)
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`)
    }
  }

  const selectSuggestion = (suggestion: CardSuggestion) => {
    setIsOpen(false)
    setQuery(suggestion.name)
    navigate(`/cards/${suggestion.id}`)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return
    const totalItems = suggestions.length + 1 // +1 for "See all results"

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((prev) => (prev + 1) % totalItems)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((prev) => (prev - 1 + totalItems) % totalItems)
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault()
      if (activeIndex < suggestions.length) {
        selectSuggestion(suggestions[activeIndex])
      } else {
        setIsOpen(false)
        navigate(`/search?q=${encodeURIComponent(query.trim())}`)
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false)
    }
  }

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [])

  return (
    <div ref={wrapperRef} className="relative w-full">
      <form onSubmit={handleSubmit} className="w-full">
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onFocus={() => suggestions.length > 0 && setIsOpen(true)}
            placeholder={isHeader ? 'Search cards...' : 'Search for a Pokemon card...'}
            autoComplete="off"
            className={
              isHeader
                ? 'w-full bg-slate-800 text-white placeholder-slate-400 rounded-lg px-4 py-2 pr-10 border border-slate-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition'
                : `w-full bg-white border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition ${
                    large
                      ? 'px-6 py-4 text-lg pr-14'
                      : 'px-4 py-3 text-base pr-12'
                  }`
            }
          />
          <button
            type="submit"
            className={
              isHeader
                ? 'absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition'
                : `absolute right-2 top-1/2 -translate-y-1/2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center justify-center ${
                    large ? 'h-10 w-10' : 'h-8 w-8'
                  }`
            }
          >
            <svg xmlns="http://www.w3.org/2000/svg" className={isHeader ? 'h-5 w-5' : large ? 'h-5 w-5' : 'h-4 w-4'} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </div>
      </form>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
          <ul>
            {suggestions.map((suggestion, index) => (
              <li
                key={suggestion.id}
                onClick={() => selectSuggestion(suggestion)}
                onMouseEnter={() => setActiveIndex(index)}
                className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors ${
                  index === activeIndex ? 'bg-blue-50' : 'hover:bg-slate-50'
                }`}
              >
                {suggestion.image_small ? (
                  <img
                    src={suggestion.image_small}
                    alt={suggestion.name}
                    className="w-8 h-11 object-contain rounded"
                  />
                ) : (
                  <div className="w-8 h-11 bg-slate-100 rounded flex items-center justify-center text-slate-400 text-xs">?</div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-slate-900 truncate">{suggestion.name}</div>
                  <div className="text-xs text-slate-500 truncate">{suggestion.set_name}</div>
                </div>
              </li>
            ))}
          </ul>
          <button
            onClick={() => {
              setIsOpen(false)
              navigate(`/search?q=${encodeURIComponent(query.trim())}`)
            }}
            onMouseEnter={() => setActiveIndex(suggestions.length)}
            className={`w-full text-left px-4 py-2.5 text-sm border-t border-slate-100 transition-colors ${
              activeIndex === suggestions.length ? 'bg-blue-50 text-blue-700' : 'text-blue-600 hover:bg-slate-50'
            }`}
          >
            See all results for "<span className="font-medium">{query.trim()}</span>"
          </button>
        </div>
      )}
    </div>
  )
}

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-sm">
            <span className="text-2xl mr-2">⚡</span>
            <span className="font-semibold text-white">PokePriceCheck</span>
            {' '}&mdash; Pokemon TCG Price Comparison
          </div>
          <div className="text-xs text-slate-500">
            Prices sourced from TCGPlayer &amp; eBay. Not affiliated with Nintendo or The Pokemon Company.
          </div>
        </div>
      </div>
    </footer>
  )
}

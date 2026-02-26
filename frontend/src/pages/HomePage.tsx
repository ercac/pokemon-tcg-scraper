import SearchBar from '../components/search/SearchBar'

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center px-4">
      {/* Hero section */}
      <div className="max-w-2xl w-full text-center mt-20 mb-12">
        <h1 className="text-5xl font-extrabold text-slate-900 mb-4">
          <span className="text-blue-600">Poke</span>PriceCheck
        </h1>
        <p className="text-xl text-slate-500 mb-8">
          Compare Pokemon TCG card prices across TCGPlayer and eBay in one place
        </p>
        <SearchBar large />
      </div>

      {/* Feature cards */}
      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
        <FeatureCard
          icon="🔍"
          title="Search Cards"
          description="Search across the entire Pokemon TCG catalog with comprehensive card data"
        />
        <FeatureCard
          icon="💰"
          title="Compare Prices"
          description="See prices from TCGPlayer and eBay side by side to find the best deal"
        />
        <FeatureCard
          icon="📈"
          title="Track History"
          description="View price trends over time with interactive charts for any card"
        />
      </div>
    </div>
  )
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: string
  title: string
  description: string
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 text-center hover:shadow-md transition">
      <span className="text-4xl">{icon}</span>
      <h3 className="text-lg font-semibold text-slate-900 mt-3">{title}</h3>
      <p className="text-sm text-slate-500 mt-2">{description}</p>
    </div>
  )
}

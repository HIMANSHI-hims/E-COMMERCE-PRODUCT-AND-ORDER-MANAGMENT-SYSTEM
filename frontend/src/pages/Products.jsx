import { useState } from 'react'
import { Search } from 'lucide-react'
import PageHeader from '../components/PageHeader.jsx'
import ProductCard from '../components/ProductCard.jsx'
import Status from '../components/Status.jsx'
import { useStore } from '../context/StoreContext.jsx'

const sorts = {
  'name-asc': ['Name, A to Z', (a, b) => a.name.localeCompare(b.name)],
  'name-desc': ['Name, Z to A', (a, b) => b.name.localeCompare(a.name)],
  'price-asc': ['Price, low to high', (a, b) => a.price - b.price],
  'price-desc': ['Price, high to low', (a, b) => b.price - a.price]
}

export default function Products() {
  const { products, categories, loading, error } = useStore()
  const [q, setQ] = useState('')
  const [cat, setCat] = useState('All')
  const [sort, setSort] = useState('name-asc')
  const rows = products
    .filter((p) => (cat === 'All' || p.category === cat) && `${p.name} ${p.brand} ${p.category}`.toLowerCase().includes(q.toLowerCase()))
    .sort(sorts[sort][1])
  const clear = () => { setQ(''); setCat('All') }

  return (
    <div className="container section">
      <PageHeader title="Products" subtitle="Browse the full catalog and add items to your cart." />
      <div className="filters">
        <label className="search"><Search size={16} /><input type="search" placeholder="Search products" aria-label="Search products" value={q} onChange={(e) => setQ(e.target.value)} /></label>
        <select aria-label="Filter by category" value={cat} onChange={(e) => setCat(e.target.value)}>
          <option>All</option>{categories.map((c) => <option key={c}>{c}</option>)}
        </select>
        <select aria-label="Sort products" value={sort} onChange={(e) => setSort(e.target.value)}>
          {Object.entries(sorts).map(([k, [label]]) => <option key={k} value={k}>{label}</option>)}
        </select>
      </div>
      {loading || error ? <Status /> : rows.length === 0 ? (
        <div className="state"><p>No products match your filters.</p><button className="btn btn-outline" onClick={clear}>Clear filters</button></div>
      ) : (
        <div className="grid">{rows.map((p) => <ProductCard key={p.id} p={p} />)}</div>
      )}
    </div>
  )
}
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ShoppingBag, ShoppingCart, ClipboardList, Boxes, Package, Layers, Receipt, Warehouse } from 'lucide-react'
import ActionCard from '../components/ActionCard.jsx'
import ProductCard from '../components/ProductCard.jsx'
import StatCard from '../components/StatCard.jsx'
import Status from '../components/Status.jsx'
import { useStore } from '../context/StoreContext.jsx'
import * as api from '../services/api.js'

const actions = [
  ['/products', ShoppingBag, 'Explore Products', 'Browse products, compare prices, and discover available stock.'],
  ['/order', ShoppingCart, 'Place an Order', 'Select products, choose quantities, and create your order.'],
  ['/orders', ClipboardList, 'View Orders', 'Review order details, item quantities, totals, and order status.'],
  ['/inventory', Boxes, 'Manage Inventory', 'Review product stock and identify low-inventory items.']
]

export default function Home() {
  const { products, loading, error } = useStore()
  const [ov, setOv] = useState(null)
  const [ovFailed, setOvFailed] = useState(false)

  useEffect(() => {
    let alive = true
    api.getOverview()
      .then((d) => alive && setOv(d))
      .catch(() => alive && setOvFailed(true))
    return () => { alive = false }
  }, [])

  // Show "…" while loading and "–" if the numbers could not be fetched.
  const val = (v) => (ov ? v : ovFailed ? '–' : '…')
  const pct = ov && ov.products ? Math.round((ov.in_stock / ov.products) * 100) : 0

  return (
    <>
      <section className="hero">
        <div className="container">
          <span className="rule" aria-hidden="true" />
          <h1 className="wordmark">ELVORA</h1>
          <p className="tagline">An E-Commerce Order and Management System</p>
          <span className="rule" aria-hidden="true" />
          <p className="lead">Discover products, manage your orders, and experience a simpler way to shop.</p>
          <div className="cta">
            <Link className="btn btn-dark" to="/products">Explore Products</Link>
            <Link className="btn btn-outline" to="/order">Place an Order</Link>
          </div>
        </div>
      </section>

      <section className="section container">
        <h2 className="center">Your Store, Your Way</h2>
        <div className="grid four">
          {actions.map(([to, icon, title, text]) => <ActionCard key={to} to={to} icon={icon} title={title} text={text} />)}
        </div>
      </section>

      <section className="section container">
        <div className="page-head">
          <h2>Selected for You</h2>
          <Link to="/products" className="link">View All Products</Link>
        </div>
        {loading || error ? <Status /> : <div className="grid">{products.slice(0, 5).map((p) => <ProductCard key={p.id} p={p} />)}</div>}
      </section>

      <section className="dark band">
        <div className="container">
          <h2 className="center">Store overview</h2>
          <p className="center small">
            {api.isMock ? 'Based on the sample catalogue.' : 'Live figures from the store database.'}
          </p>
          <div className="grid four stats">
            <StatCard icon={Package} label="Total products" value={val(ov?.products)} />
            <StatCard icon={Layers} label="Product categories" value={val(ov?.categories)} />
            <StatCard icon={Receipt} label="Orders placed" value={val(ov?.orders)} />
            <StatCard icon={Warehouse} label="Inventory availability" value={val(`${pct}%`)} />
          </div>
        </div>
      </section>
    </>
  )
}
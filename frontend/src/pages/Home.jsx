import { Link } from 'react-router-dom'
import { ShoppingBag, ShoppingCart, ClipboardList, Boxes, Package, Layers, Receipt, Warehouse } from 'lucide-react'
import ActionCard from '../components/ActionCard.jsx'
import ProductCard from '../components/ProductCard.jsx'
import StatCard from '../components/StatCard.jsx'
import Status from '../components/Status.jsx'
import { useStore } from '../context/StoreContext.jsx'
import { mockStats } from '../data/mockStats.js'

const actions = [
  ['/products', ShoppingBag, 'Explore Products', 'Browse products, compare prices, and discover available stock.'],
  ['/order', ShoppingCart, 'Place an Order', 'Select products, choose quantities, and create your order.'],
  ['/orders', ClipboardList, 'View Orders', 'Review order details, item quantities, totals, and order status.'],
  ['/inventory', Boxes, 'Manage Inventory', 'Review product stock and identify low-inventory items.']
]

export default function Home() {
  const { products, loading, error } = useStore()
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
          <p className="center small">Demonstration statistics. These are not live database values.</p>
          <div className="grid four stats">
            <StatCard icon={Package} label="Total products" value={mockStats.totalProducts} />
            <StatCard icon={Layers} label="Product categories" value={mockStats.categories} />
            <StatCard icon={Receipt} label="Orders placed" value={mockStats.ordersPlaced} />
            <StatCard icon={Warehouse} label="Inventory availability" value={mockStats.availability} />
          </div>
        </div>
      </section>
    </>
  )
}
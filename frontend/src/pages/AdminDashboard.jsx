import { Link } from 'react-router-dom'
import { Package, Users, ClipboardList, IndianRupee, ShieldAlert } from 'lucide-react'
import PageHeader from '../components/PageHeader.jsx'
import StatCard from '../components/StatCard.jsx'
import ProductManager from '../components/ProductManager.jsx'
import { useStore } from '../context/StoreContext.jsx'
import { mockStats } from '../data/mockStats.js'
import { inr, fmtDate, LOW_STOCK } from '../utils.js'

export default function AdminDashboard() {
  const { products, orders } = useStore()
  const live = orders.filter((o) => o.status !== 'Cancelled')
  const revenue = live.reduce((s, o) => s + o.total, 0)
  const low = products.filter((p) => p.stock <= LOW_STOCK)
  const pays = Object.values(live.reduce((a, o) => {
    const x = a[o.payment] || { m: o.payment, n: 0, t: 0 }
    x.n++; x.t += o.total; a[o.payment] = x
    return a
  }, {}))

  return (
    <div className="container section">
      <PageHeader title="Admin Dashboard" subtitle="A frontend prototype for store management." />
      <p className="note"><ShieldAlert size={16} /> Demonstration data only, not database results. This area has no login yet. Authentication and role-based access will be added in the backend.</p>

      <div className="grid four admin-stats">
        <StatCard icon={Package} label="Products" value={products.length} />
        <StatCard icon={Users} label="Customers" value={mockStats.customers} note="Demo value" />
        <StatCard icon={ClipboardList} label="Orders" value={orders.length} />
        <StatCard icon={IndianRupee} label="Revenue (excl. cancelled)" value={inr(revenue)} />
      </div>

      <nav className="quick" aria-label="Management shortcuts">
        <Link className="btn btn-outline btn-sm" to="/products">Products</Link>
        <Link className="btn btn-outline btn-sm" to="/inventory">Inventory</Link>
        <Link className="btn btn-outline btn-sm" to="/orders">Orders</Link>
        <a className="btn btn-outline btn-sm" href="#payments">Payments</a>
      </nav>

      <div className="two">
        <section>
          <h2>Recent orders</h2>
          <div className="tw"><table>
            <thead><tr><th>Order</th><th>Date</th><th>Customer</th><th>Total</th><th>Status</th></tr></thead>
            <tbody>{orders.slice(0, 5).map((o) => (
              <tr key={o.id}><td>{o.id}</td><td>{fmtDate(o.date)}</td><td>{o.customer}</td><td>{inr(o.total)}</td><td><span className={`pill ${o.status}`}>{o.status}</span></td></tr>
            ))}</tbody>
          </table></div>
        </section>
        <section>
          <h2>Low-stock products</h2>
          {low.length === 0 ? <p className="state">All products are well stocked.</p> : (
            <div className="tw"><table>
              <thead><tr><th>Product</th><th>Stock</th></tr></thead>
              <tbody>{low.map((p) => <tr key={p.id} className="low"><td>{p.name}</td><td>{p.stock}</td></tr>)}</tbody>
            </table></div>
          )}
        </section>
      </div>

      <section id="payments" className="pay-sec">
        <h2>Payments by method</h2>
        <div className="tw"><table>
          <thead><tr><th>Method</th><th>Orders</th><th>Amount</th></tr></thead>
          <tbody>{pays.map((p) => <tr key={p.m}><td>{p.m}</td><td>{p.n}</td><td>{inr(p.t)}</td></tr>)}</tbody>
        </table></div>
      </section>

      <ProductManager allowDelete />
    </div>
  )
}
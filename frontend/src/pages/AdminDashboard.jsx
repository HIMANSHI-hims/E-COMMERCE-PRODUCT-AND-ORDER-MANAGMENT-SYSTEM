import { useEffect } from 'react'
import { Package, Users, ClipboardList, IndianRupee, ShieldAlert } from 'lucide-react'
import PageHeader from '../components/PageHeader.jsx'
import StatCard from '../components/StatCard.jsx'
import OrderManager from '../components/OrderManager.jsx'
import ProductManager from '../components/ProductManager.jsx'
import { useStore } from '../context/StoreContext.jsx'
import * as api from '../services/api.js'
import { inr, LOW_STOCK } from '../utils.js'
import InventoryAuditHistory from '../components/InventoryAuditHistory.jsx'

export default function AdminDashboard() {
  const { products, orders, stats, loadStats, loadOrders } = useStore()
useEffect(() => { loadStats().catch(() => {}); loadOrders().catch(() => {}) }, [loadStats, loadOrders])

  const live = orders.filter((o) => o.status !== 'Cancelled')
  const revenue = live.reduce((s, o) => s + o.total, 0)
  const low = products.filter((p) => p.stock <= LOW_STOCK)
  const pays = Object.values(live.reduce((a, o) => {
    const k = o.payment || 'None'
    const x = a[k] || { m: k, n: 0, t: 0 }
    x.n++; x.t += o.total; a[k] = x
    return a
  }, {}))

  return (
    <div className="container section">
      <PageHeader title="Admin Dashboard" subtitle="Manage products, orders and payments." />
      <p className="note"><ShieldAlert size={16} />
        {api.isMock
          ? 'Demonstration data only. Nothing here is saved to the database.'
          : 'Connected to the Oracle database. Changes made here are saved immediately.'}
      </p>

      <div className="grid four admin-stats">
        <StatCard icon={Package} label="Products" value={products.length} />
        <StatCard icon={Users} label="Customers" value={stats?.customers ?? '…'} note={api.isMock ? 'Demo value' : undefined} />
        <StatCard icon={ClipboardList} label="Orders" value={orders.length} />
        <StatCard icon={IndianRupee} label="Revenue (excl. cancelled)" value={inr(revenue)} />
      </div>

      <div className="pm"><OrderManager /></div>

      <div className="two pay-sec">
        <section>
          <h2>Low-stock products</h2>
          {low.length === 0 ? <p className="state">All products are well stocked.</p> : (
            <div className="tw"><table>
              <thead><tr><th>Product</th><th>Stock</th></tr></thead>
              <tbody>{low.map((p) => <tr key={p.id} className="low"><td>{p.name}</td><td>{p.stock}</td></tr>)}</tbody>
            </table></div>
          )}
        </section>
        <section id="payments">
          <h2>Payments by method</h2>
          <div className="tw"><table>
            <thead><tr><th>Method</th><th>Orders</th><th>Amount</th></tr></thead>
            <tbody>{pays.map((p) => <tr key={p.m}><td>{p.m}</td><td>{p.n}</td><td>{inr(p.t)}</td></tr>)}</tbody>
          </table></div>
        </section>
      </div>

      <ProductManager allowDelete />
      <ProductManager allowDelete />
      <InventoryAuditHistory />
    </div>
  )
}

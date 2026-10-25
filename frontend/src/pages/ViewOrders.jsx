import { useState } from 'react'
import { Search } from 'lucide-react'
import PageHeader from '../components/PageHeader.jsx'
import Status from '../components/Status.jsx'
import { useStore } from '../context/StoreContext.jsx'
import { inr, fmtDate } from '../utils.js'

export default function ViewOrders() {
  const { orders, loading, error } = useStore()
  const [q, setQ] = useState('')
  const [sel, setSel] = useState(null)
  const rows = orders.filter((o) => `${o.id} ${o.customer}`.toLowerCase().includes(q.toLowerCase()))
  const open = orders.find((o) => o.id === sel)

  return (
    <div className="container section">
      <PageHeader title="View Orders" subtitle="Sample order history until the backend is connected." />
      <div className="filters">
        <label className="search"><Search size={16} /><input type="search" placeholder="Search by order ID or customer" aria-label="Search orders" value={q} onChange={(e) => setQ(e.target.value)} /></label>
      </div>
      {loading || error ? <Status /> : rows.length === 0 ? (
        <p className="state">{orders.length === 0 ? 'No orders yet. Place your first order to see it here.' : 'No orders match your search.'}</p>
      ) : (
        <div className="tw">
          <table>
            <thead><tr><th>Order ID</th><th>Date</th><th>Customer</th><th>Total</th><th>Status</th><th>Details</th></tr></thead>
            <tbody>
              {rows.map((o) => (
                <tr key={o.id}>
                  <td>{o.id}</td><td>{fmtDate(o.date)}</td><td>{o.customer}</td><td>{inr(o.total)}</td>
                  <td><span className={`pill ${o.status}`}>{o.status}</span></td>
                  <td><button className="btn btn-outline btn-sm" onClick={() => setSel(o.id)}>View</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {open && (
        <section className="card form detail" aria-live="polite" aria-labelledby="od">
          <div className="page-head">
            <h2 id="od">Order {open.id}</h2>
            <button className="btn btn-outline btn-sm" onClick={() => setSel(null)}>Close</button>
          </div>
          <p className="muted">{open.customer}, placed {fmtDate(open.date)}, paid by {open.payment}</p>
          <div className="tw">
            <table>
              <thead><tr><th>Item</th><th>Qty</th><th>Unit price</th><th>Line total</th></tr></thead>
              <tbody>
                {open.items.map((i) => <tr key={i.productId}><td>{i.name}</td><td>{i.qty}</td><td>{inr(i.price)}</td><td>{inr(i.qty * i.price)}</td></tr>)}
              </tbody>
              <tfoot><tr><td colSpan="3"><strong>Order total</strong></td><td><strong>{inr(open.total)}</strong></td></tr></tfoot>
            </table>
          </div>
        </section>
      )}
    </div>
  )
}
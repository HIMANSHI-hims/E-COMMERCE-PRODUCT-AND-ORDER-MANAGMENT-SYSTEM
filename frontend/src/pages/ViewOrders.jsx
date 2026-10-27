import { useCallback, useEffect, useState } from 'react'
import { Search } from 'lucide-react'
import PageHeader from '../components/PageHeader.jsx'
import * as api from '../services/api.js'
import { inr, fmtDate } from '../utils.js'

// "Laptop × 1, Headphones × 2" for the table, with a count when there are more items.
const productSummary = (items) => {
  const shown = items.slice(0, 2).map((i) => `${i.name} × ${i.qty}`).join(', ')
  const more = items.length - 2
  return more > 0 ? `${shown} and ${more} more` : shown
}

export default function ViewOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [q, setQ] = useState('')
  const [sel, setSel] = useState(null)

  // A customer only ever receives their own orders from the server.
  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      setOrders(await api.getMyOrders())
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])
  useEffect(() => { load() }, [load])

  const needle = q.toLowerCase()
  const rows = orders.filter((o) =>
    `${o.id} ${o.items.map((i) => i.name).join(' ')}`.toLowerCase().includes(needle))
  const open = orders.find((o) => o.id === sel)

  return (
    <div className="container section">
      <PageHeader
        title="Order History"
        subtitle={api.isMock ? 'Sample order history until the backend is connected.' : 'Track the products, status and payment of your orders.'}
      />
      <div className="filters">
        <label className="search"><Search size={16} /><input type="search" placeholder="Search by order ID or product" aria-label="Search orders" value={q} onChange={(e) => setQ(e.target.value)} /></label>
      </div>

      {loading ? <p className="state" role="status">Loading…</p> : error ? (
        <div className="state err" role="alert">
          <p>We couldn’t load your orders: {error}</p>
          <button className="btn btn-outline" onClick={load}>Try again</button>
        </div>
      ) : rows.length === 0 ? (
        <p className="state">{orders.length === 0 ? 'You have not placed any orders yet.' : 'No orders match your search.'}</p>
      ) : (
        <div className="tw">
          <table>
            <thead><tr><th>Order ID</th><th>Date</th><th>Products</th><th>Total</th><th>Order status</th><th>Payment</th><th>Details</th></tr></thead>
            <tbody>
              {rows.map((o) => (
                <tr key={o.id}>
                  <td>{o.id}</td><td>{fmtDate(o.date)}</td>
                  <td className="wrap">{productSummary(o.items)}</td>
                  <td>{inr(o.total)}</td>
                  <td><span className={`pill ${o.status}`}>{o.status}</span></td>
                  <td>{o.payment || 'None'}{o.paymentStatus ? `, ${o.paymentStatus}` : ''}</td>
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
          <p className="muted">Placed {fmtDate(open.date)}. Order status: {open.status}. Payment: {open.payment || 'None'}{open.paymentStatus ? ` (${open.paymentStatus})` : ''}.</p>
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
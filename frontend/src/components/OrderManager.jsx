import { useState } from 'react'
import { Search } from 'lucide-react'
import { useStore } from '../context/StoreContext.jsx'
import { inr, fmtDate } from '../utils.js'

const ORDER = ['Pending', 'Shipped', 'Delivered', 'Cancelled']
const PAY = ['Pending', 'Completed', 'Failed']

export default function OrderManager() {
  const { orders, setOrderStatus, setPaymentStatus, notify } = useStore()
  const [q, setQ] = useState('')
  const [st, setSt] = useState('All')
  const [limit, setLimit] = useState(15)
  const [busy, setBusy] = useState('')

  const rows = orders.filter((o) =>
    (st === 'All' || o.status === st) && `${o.id} ${o.customer}`.toLowerCase().includes(q.toLowerCase()))

  const run = async (key, fn, okMsg) => {
    setBusy(key)
    try { await fn(); notify(okMsg) } catch (e) { notify(e.message, 'err') } finally { setBusy('') }
  }

  return (
    <section aria-labelledby="om-title">
      <h2 id="om-title">Order management</h2>
      <div className="filters">
        <label className="search"><Search size={16} />
          <input type="search" placeholder="Search by order ID or customer" aria-label="Search orders"
            value={q} onChange={(e) => { setQ(e.target.value); setLimit(15) }} />
        </label>
        <select aria-label="Filter by status" value={st} onChange={(e) => { setSt(e.target.value); setLimit(15) }}>
          <option>All</option>{ORDER.map((s) => <option key={s}>{s}</option>)}
        </select>
      </div>
      {rows.length === 0 ? <p className="state">No orders match.</p> : (
        <div className="tw">
          <table>
            <thead><tr><th>Order</th><th>Date</th><th>Customer</th><th>Total</th><th>Order status</th><th>Payment</th><th>Payment status</th></tr></thead>
            <tbody>
              {rows.slice(0, limit).map((o) => (
                <tr key={o.id}>
                  <td>{o.id}</td><td>{fmtDate(o.date)}</td><td>{o.customer}</td><td>{inr(o.total)}</td>
                  <td>
                    <select className="sel-sm" aria-label={`Status of ${o.id}`} value={o.status}
                      disabled={busy === o.id || o.status === 'Cancelled'}
                      onChange={(e) => run(o.id, () => setOrderStatus(o.id, e.target.value), `${o.id} is now ${e.target.value}.`)}>
                      {ORDER.map((s) => <option key={s} disabled={s === 'Cancelled' && o.status === 'Delivered'}>{s}</option>)}
                    </select>
                  </td>
                  <td>{o.payment || 'None'}</td>
                  <td>
                    {o.paymentStatus ? (
                      <select className="sel-sm" aria-label={`Payment status of ${o.id}`} value={o.paymentStatus}
                        disabled={busy === 'p' + o.id}
                        onChange={(e) => run('p' + o.id, () => setPaymentStatus(o.id, e.target.value), `Payment for ${o.id} is now ${e.target.value}.`)}>
                        {PAY.map((s) => <option key={s}>{s}</option>)}
                      </select>
                    ) : '–'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {rows.length > limit && (
        <p className="center" style={{ marginTop: '1rem' }}>
          <button className="btn btn-outline btn-sm" onClick={() => setLimit(limit + 15)}>Show more ({rows.length - limit} left)</button>
        </p>
      )}
    </section>
  )
}
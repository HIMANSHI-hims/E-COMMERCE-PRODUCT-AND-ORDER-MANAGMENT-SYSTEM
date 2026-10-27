import { useCallback, useEffect, useRef, useState } from 'react'
import { RefreshCw, Search } from 'lucide-react'
import { useStore } from '../context/StoreContext.jsx'
import * as api from '../services/api.js'

const PAGE = 25

const fmtTime = (value) => {
  if (!value) return '–'
  const d = new Date(String(value).replace(' ', 'T'))
  return Number.isNaN(d.getTime())
    ? value
    : d.toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function Change({ from, to }) {
  if (typeof from !== 'number' || typeof to !== 'number') return <span className="muted">–</span>
  const d = to - from
  if (d === 0) return <span className="delta">0</span>
  return <span className={`delta ${d > 0 ? 'up' : 'down'}`}>{d > 0 ? '+' : '-'}{Math.abs(d)}</span>
}

export default function InventoryAuditHistory() {
  // `products` changes after every admin stock edit or order, so the log refreshes itself.
  const { products } = useStore()
  const [rows, setRows] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState('')
  const [input, setInput] = useState('')
  const [q, setQ] = useState('')
  const latest = useRef(0)

  // Wait a moment after typing before searching.
  useEffect(() => {
    const t = setTimeout(() => setQ(input.trim()), 300)
    return () => clearTimeout(t)
  }, [input])

  const load = useCallback(async () => {
    const id = ++latest.current // ignore answers that arrive late
    setLoading(true)
    setError('')
    try {
      const d = await api.getInventoryAudit({ limit: PAGE, offset: 0, q })
      if (id !== latest.current) return
      setRows(d.rows)
      setTotal(d.total)
    } catch (e) {
      if (id === latest.current) setError(e.message)
    } finally {
      if (id === latest.current) setLoading(false)
    }
  }, [q])
  useEffect(() => { load() }, [load, products])

  const loadMore = async () => {
    setLoadingMore(true)
    try {
      const d = await api.getInventoryAudit({ limit: PAGE, offset: rows.length, q })
      setRows((list) => {
        const seen = new Set(list.map((r) => r.id))
        return [...list, ...d.rows.filter((r) => !seen.has(r.id))]
      })
      setTotal(d.total)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoadingMore(false)
    }
  }

  return (
    <section className="pm" aria-labelledby="audit-title">
      <div className="page-head">
        <h2 id="audit-title">Inventory audit history</h2>
        <button className="btn btn-outline btn-sm" onClick={load} disabled={loading}>
          <RefreshCw size={14} /> Refresh
        </button>
      </div>
      <p className="muted small">Every stock change recorded by the database, newest first.</p>

      <div className="filters">
        <label className="search">
          <Search size={16} />
          <input type="search" placeholder="Search by product or reason" aria-label="Search audit history"
            value={input} onChange={(e) => setInput(e.target.value)} />
        </label>
      </div>

      {error ? (
        <div className="state err" role="alert">
          <p>We couldn’t load the audit history: {error}</p>
          <button className="btn btn-outline" onClick={load}>Try again</button>
        </div>
      ) : loading && rows.length === 0 ? (
        <p className="state" role="status">Loading…</p>
      ) : rows.length === 0 ? (
        <p className="state">{q ? 'No records match your search.' : 'No stock changes have been recorded yet.'}</p>
      ) : (
        <>
          <div className="tw">
            <table>
              <thead>
                <tr><th>Product</th><th>Old stock</th><th>New stock</th><th>Change</th><th>Reason</th><th>Date and time</th></tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id}>
                    <td>{r.product}<span className="muted small"> (ID {r.productId})</span></td>
                    <td>{r.oldStock ?? '–'}</td>
                    <td>{r.newStock ?? '–'}</td>
                    <td><Change from={r.oldStock} to={r.newStock} /></td>
                    <td className="wrap">{r.reason || '–'}</td>
                    <td>{fmtTime(r.changedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="center small muted audit-foot">
            Showing {rows.length} of {total} records
            {rows.length < total && (
              <>
                {' · '}
                <button className="linkbtn" onClick={loadMore} disabled={loadingMore}>
                  {loadingMore ? 'Loading…' : 'Load more'}
                </button>
              </>
            )}
          </p>
        </>
      )}
    </section>
  )
}
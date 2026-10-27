import { useCallback, useEffect, useState } from 'react'
import { Play, Copy, Check } from 'lucide-react'
import * as api from '../services/api.js'

const MONEY = /price|amount|spent|average/i
const label = (c) => {
  const s = c.replace(/_/g, ' ')
  return s.charAt(0).toUpperCase() + s.slice(1)
}
const cell = (col, v) => {
  if (v === null || v === undefined) return '–'
  if (typeof v === 'number' && MONEY.test(col)) return '₹' + v.toLocaleString('en-IN', { maximumFractionDigits: 2 })
  return String(v)
}

export default function SubqueryInfo() {
  const [queries, setQueries] = useState([])
  const [loading, setLoading] = useState(!api.isMock)
  const [error, setError] = useState('')
  const [res, setRes] = useState({})
  const [copied, setCopied] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      setQueries(await api.getSubqueries())
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])
  useEffect(() => { if (!api.isMock) load() }, [load])

  const run = async (id) => {
    setRes((r) => ({ ...r, [id]: { status: 'loading' } }))
    try {
      const data = await api.runSubquery(id)
      setRes((r) => ({ ...r, [id]: { status: 'done', data } }))
    } catch (e) {
      setRes((r) => ({ ...r, [id]: { status: 'error', error: e.message } }))
    }
  }

  const copy = async (q) => {
    try {
      await navigator.clipboard.writeText(q.sql + ';')
      setCopied(q.id)
      setTimeout(() => setCopied(''), 1800)
    } catch { /* clipboard unavailable */ }
  }

  if (api.isMock) {
    return <p className="state">Subqueries run on the Oracle database. Connect the backend (set VITE_API_BASE_URL) to use this page.</p>
  }
  if (loading) return <p className="state" role="status">Loading…</p>
  if (error) {
    return (
      <div className="state err" role="alert">
        <p>We couldn’t load the subqueries: {error}</p>
        <button className="btn btn-outline" onClick={load}>Try again</button>
      </div>
    )
  }

  return (
    <div className="sq-list">
      {queries.map((q, n) => {
        const r = res[q.id]
        const busy = r?.status === 'loading'
        return (
          <article key={q.id} className="card sq" aria-labelledby={`sq-${q.id}`}>
            <div className="sq-head">
              <h3 id={`sq-${q.id}`}>Query {n + 1}: {q.title}</h3>
              <span className="pill Pending">{q.type}</span>
            </div>
            <p className="muted">{q.description}</p>
            <pre className="code" tabIndex={0}><code>{q.sql};</code></pre>
            <div className="sq-actions">
              <button className="btn btn-dark btn-sm" onClick={() => run(q.id)} disabled={busy}>
                <Play size={14} /> {busy ? 'Running…' : 'Run Query'}
              </button>
              <button className="btn btn-outline btn-sm" onClick={() => copy(q)}>
                {copied === q.id ? <><Check size={14} /> Copied</> : <><Copy size={14} /> Copy query</>}
              </button>
            </div>

            <div aria-live="polite">
              {busy && <p className="state" role="status">Running query on Oracle…</p>}
              {r?.status === 'error' && <div className="state err" role="alert"><p>{r.error}</p></div>}
              {r?.status === 'done' && (r.data.rows.length === 0 ? (
                <p className="state">The query ran successfully and returned no rows.</p>
              ) : (
                <>
                  <p className="sq-meta">{r.data.rowCount} row{r.data.rowCount === 1 ? '' : 's'} returned from Oracle</p>
                  <div className="tw">
                    <table>
                      <thead><tr>{r.data.columns.map((c) => <th key={c}>{label(c)}</th>)}</tr></thead>
                      <tbody>
                        {r.data.rows.map((row, i) => (
                          <tr key={i}>{row.map((v, j) => <td key={j}>{cell(r.data.columns[j], v)}</td>)}</tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              ))}
            </div>
          </article>
        )
      })}
    </div>
  )
}
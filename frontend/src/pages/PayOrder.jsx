import { useEffect, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { CheckCircle2, Lock } from 'lucide-react'
import PageHeader from '../components/PageHeader.jsx'
import { useStore } from '../context/StoreContext.jsx'
import * as api from '../services/api.js'
import { inr, payLabel } from '../utils.js'

export default function PayOrder() {
  const { id } = useParams()
  const { state } = useLocation()
  const { payOrder, notify } = useStore()
  const [order, setOrder] = useState(state?.order?.id === id ? state.order : null)
  const [loading, setLoading] = useState(!order)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  // Opened from "Pay now" or after a refresh: load the order from the server.
  useEffect(() => {
    if (order) return
    let live = true
    ;(async () => {
      try {
        const list = await api.getMyOrders()
        if (live) setOrder(list.find((o) => o.id === id) || null)
      } catch (e) {
        if (live) setError(e.message)
      } finally {
        if (live) setLoading(false)
      }
    })()
    return () => { live = false }
  }, [id, order])

  const pay = async () => {
    setBusy(true)
    try {
      await payOrder(order.id)
      setOrder({ ...order, paymentStatus: 'Completed' })
      notify('Payment successful.')
    } catch (x) {
      notify(x.message, 'err')
    } finally {
      setBusy(false)
    }
  }

  const wrap = (children) => <div className="container section narrow">{children}</div>

  if (loading) return wrap(<p className="state" role="status">Loading…</p>)
  if (error) {
    return wrap(
      <div className="state err" role="alert">
        <p>We couldn’t load this order: {error}</p>
        <Link className="btn btn-outline" to="/orders">Back to my orders</Link>
      </div>
    )
  }
  if (!order) {
    return wrap(
      <div className="state">
        <p>We couldn’t find that order.</p>
        <Link className="btn btn-dark" to="/orders">Back to my orders</Link>
      </div>
    )
  }

  if (order.status === 'Cancelled') {
    return wrap(
      <div className="state">
        <p>Order {order.id} was cancelled, so it can’t be paid.</p>
        <Link className="btn btn-dark" to="/orders">Back to my orders</Link>
      </div>
    )
  }

  if (order.payment === 'Cash') {
    return wrap(
      <div className="card confirm">
        <CheckCircle2 size={40} />
        <h1>No online payment needed</h1>
        <p>Order <strong>{order.id}</strong> is Cash on Delivery. Please pay {inr(order.total)} in cash when it arrives.</p>
        <Link className="btn btn-dark" to="/orders">View Orders</Link>
      </div>
    )
  }

  if (order.paymentStatus === 'Completed') {
    return wrap(
      <div className="card confirm" role="status">
        <CheckCircle2 size={40} />
        <h1>Payment successful</h1>
        <p>We received <strong>{inr(order.total)}</strong> for order <strong>{order.id}</strong> via {payLabel(order.payment)}.</p>
        <div className="row-gap center-row">
          <Link className="btn btn-dark" to="/orders">View Orders</Link>
          <Link className="btn btn-outline" to="/products">Keep shopping</Link>
        </div>
      </div>
    )
  }

  return wrap(
    <>
      <PageHeader title="Complete your payment" subtitle={`Order ${order.id}`} />
      <section className="card pay-card" aria-labelledby="pay-t">
        <h2 id="pay-t">Pay with {payLabel(order.payment)}</h2>
        <div className="pay-amount">{inr(order.total)}</div>
        <ul className="pay-items">
          {(order.items || []).map((i) => (
            <li key={i.productId}><span>{i.name} × {i.qty}</span><span>{inr(i.qty * i.price)}</span></li>
          ))}
        </ul>
        <div className="pay-meta">
          <div><span>Order</span><span>{order.id}</span></div>
          <div><span>Method</span><span>{payLabel(order.payment)}</span></div>
          <div><span>Payment status</span><span>{order.paymentStatus || 'Pending'}</span></div>
        </div>
        <button className="btn btn-dark" onClick={pay} disabled={busy}>
          <Lock size={16} /> {busy ? 'Processing…' : `Pay ${inr(order.total)}`}
        </button>
        <p className="muted small">This is a simulated payment for the project. No real money is charged.</p>
        <Link className="link" to="/orders">Pay later</Link>
      </section>
    </>
  )
}
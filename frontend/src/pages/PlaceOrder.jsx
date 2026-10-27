import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Minus, Plus, Trash2, CheckCircle2 } from 'lucide-react'
import PageHeader from '../components/PageHeader.jsx'
import { useCart } from '../context/CartContext.jsx'
import { useStore } from '../context/StoreContext.jsx'
import { useCustomer } from '../context/CustomerContext.jsx'
import { isMock } from '../services/api.js'
import { inr, payLabel } from '../utils.js'

const METHODS = ['UPI', 'Card', 'Net Banking', 'Cash']

export default function PlaceOrder() {
  const { items, setQty, remove, clear, subtotal } = useCart()
  const { products, placeOrder, notify } = useStore()
  const { customer } = useCustomer()
  const navigate = useNavigate()
  const [pay, setPay] = useState('')
  const [errs, setErrs] = useState({})
  const [done, setDone] = useState(null)
  const [busy, setBusy] = useState(false)
  const stockOf = (id) => products.find((p) => p.id === id)?.stock ?? 0

  const submit = async (e) => {
    e.preventDefault()
    const er = {}
    if (!pay) er.pay = 'Choose a payment method'
    const bad = items.find((i) => i.qty < 1 || i.qty > stockOf(i.id))
    if (bad) er.cart = `${bad.name}: only ${stockOf(bad.id)} available. Reduce the quantity.`
    setErrs(er)
    if (Object.keys(er).length) return notify('Please fix the highlighted fields.', 'err')
    setBusy(true)
    try {
      const order = await placeOrder({
        payment: pay,
total: Number(Number(subtotal).toFixed(2)),
customer: { name: customer?.name || 'Guest' },
        items: items.map((i) => ({ productId: i.id, name: i.name, qty: i.qty, price: i.price }))
      })
      clear()
      // Cash on Delivery is paid later; every other method goes to the payment page.
      if (pay === 'Cash') setDone(order)
      else navigate(`/pay/${order.id}`, { state: { order } })
    } catch (x) { notify(x.message, 'err') } finally { setBusy(false) }
  }

  if (done) {
    return (
      <div className="container section narrow">
        <div className="card confirm">
          <CheckCircle2 size={40} />
          <h1>Order placed</h1>
          <p>Thank you, {done.customer}. Your order <strong>{done.id}</strong> for <strong>{inr(done.total)}</strong> is placed with Cash on Delivery. Please pay when it arrives.</p>
          {isMock && <p className="note">Demo order: it was created in the browser only and nothing was saved to a database.</p>}
          <div className="row-gap center-row">
            <Link className="btn btn-dark" to="/orders">View Orders</Link>
            <Link className="btn btn-outline" to="/products">Keep shopping</Link>
          </div>
        </div>
      </div>
    )
  }
  if (items.length === 0) {
    return (
      <div className="container section">
        <PageHeader title="Place Order" />
        <div className="state"><p>Your cart is empty. Add a few products to get started.</p><Link className="btn btn-dark" to="/products">Browse products</Link></div>
      </div>
    )
  }

  return (
    <div className="container section">
      <PageHeader title="Place Order" subtitle="Review your cart and choose how to pay." />
      <div className="checkout">
        <section aria-labelledby="cart-t">
          <h2 id="cart-t">Your cart</h2>
          {errs.cart && <p className="ferr" role="alert">{errs.cart}</p>}
          <ul className="lines">
            {items.map((i) => (
              <li key={i.id} className="line">
                <div><strong>{i.name}</strong><div className="muted small">{inr(i.price)} each</div></div>
                <div className="qty">
                  <button aria-label={`Decrease ${i.name}`} onClick={() => setQty(i.id, i.qty - 1)} disabled={i.qty <= 1}><Minus size={14} /></button>
                  <span aria-live="polite">{i.qty}</span>
                  <button aria-label={`Increase ${i.name}`} onClick={() => setQty(i.id, i.qty + 1)} disabled={i.qty >= stockOf(i.id)}><Plus size={14} /></button>
                </div>
                <strong>{inr(i.qty * i.price)}</strong>
                <button className="icon-btn" aria-label={`Remove ${i.name}`} onClick={() => remove(i.id)}><Trash2 size={16} /></button>
              </li>
            ))}
          </ul>
          <div className="totals">
            <div><span>Subtotal</span><span>{inr(subtotal)}</span></div>
            <div><span>Delivery</span><span>Free</span></div>
            <div className="grand"><span>Total</span><span>{inr(subtotal)}</span></div>
          </div>
        </section>

        <form className="card form" onSubmit={submit} noValidate>
          <h2>Delivery and payment</h2>
          {customer ? (
            <div className="deliver">
              <strong>{customer.name}</strong>
              <span>{customer.phone}</span>
              <span>{customer.address}</span>
            </div>
          ) : (
            <p className="muted small">Demo mode: no account is needed.</p>
          )}
          <fieldset>
            <legend>Payment method</legend>
            <div className="methods">
              {METHODS.map((m) => (
                <label key={m} className={pay === m ? 'on' : ''}><input type="radio" name="pay" value={m} checked={pay === m} onChange={() => setPay(m)} />{payLabel(m)}</label>
              ))}
            </div>
            {pay && (
              <p className="muted small" style={{ marginTop: '.5rem' }}>
                {pay === 'Cash' ? 'You will pay in cash when your order is delivered.' : 'You will pay on the next screen.'}
              </p>
            )}
            {errs.pay && <span className="ferr" role="alert">{errs.pay}</span>}
          </fieldset>
          <button className="btn btn-dark" type="submit" disabled={busy}>
            {busy ? 'Placing order…' : pay && pay !== 'Cash' ? 'Place Order and Pay' : 'Place Order'}
          </button>
          {isMock && <p className="muted small">This is a frontend demonstration. No real order is created.</p>}
        </form>
      </div>
    </div>
  )
}
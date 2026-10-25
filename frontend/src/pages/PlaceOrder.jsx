import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Minus, Plus, Trash2, CheckCircle2 } from 'lucide-react'
import PageHeader from '../components/PageHeader.jsx'
import Field from '../components/Field.jsx'
import { useCart } from '../context/CartContext.jsx'
import { useStore } from '../context/StoreContext.jsx'
import { inr } from '../utils.js'

const METHODS = ['UPI', 'Card', 'Net Banking', 'Cash']
const blank = { name: '', email: '', phone: '', address: '', city: '', pincode: '' }

export default function PlaceOrder() {
  const { items, setQty, remove, clear, subtotal } = useCart()
  const { products, placeOrder, notify } = useStore()
  const [f, setF] = useState(blank)
  const [pay, setPay] = useState('')
  const [errs, setErrs] = useState({})
  const [done, setDone] = useState(null)
  const [busy, setBusy] = useState(false)
  const stockOf = (id) => products.find((p) => p.id === id)?.stock ?? 0
  const on = (e) => setF({ ...f, [e.target.name]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    const er = {}
    if (f.name.trim().length < 2) er.name = 'Enter your full name'
    if (!/^\S+@\S+\.\S+$/.test(f.email)) er.email = 'Enter a valid email address'
    if (!/^[6-9]\d{9}$/.test(f.phone)) er.phone = 'Enter a 10-digit mobile number'
    if (f.address.trim().length < 5) er.address = 'Enter your delivery address'
    if (!f.city.trim()) er.city = 'Enter your city'
    if (!/^\d{6}$/.test(f.pincode)) er.pincode = 'Enter a 6-digit PIN code'
    if (!pay) er.pay = 'Choose a payment method'
    const bad = items.find((i) => i.qty < 1 || i.qty > stockOf(i.id))
    if (bad) er.cart = `${bad.name}: only ${stockOf(bad.id)} available. Reduce the quantity.`
    setErrs(er)
    if (Object.keys(er).length) return notify('Please fix the highlighted fields.', 'err')
    setBusy(true)
    try {
      const order = await placeOrder({
        customer: { ...f, name: f.name.trim() }, payment: pay, total: subtotal,
        items: items.map((i) => ({ productId: i.id, name: i.name, qty: i.qty, price: i.price }))
      })
      clear()
      setDone(order)
    } catch (x) { notify(x.message, 'err') } finally { setBusy(false) }
  }

  if (done) {
    return (
      <div className="container section narrow">
        <div className="card confirm">
          <CheckCircle2 size={40} />
          <h1>Order placed</h1>
          <p>Thank you, {done.customer}. Your order <strong>{done.id}</strong> for <strong>{inr(done.total)}</strong> ({done.payment}) is recorded as Pending.</p>
          <p className="note">Demo order: it was created in the browser only and nothing was saved to Oracle.</p>
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
      <PageHeader title="Place Order" subtitle="Review your cart and enter delivery details." />
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
          <h2>Delivery details</h2>
          <Field label="Full name" name="name" value={f.name} onChange={on} error={errs.name} autoComplete="name" />
          <Field label="Email" name="email" type="email" value={f.email} onChange={on} error={errs.email} autoComplete="email" />
          <Field label="Mobile number" name="phone" inputMode="numeric" value={f.phone} onChange={on} error={errs.phone} autoComplete="tel" />
          <Field label="Address" name="address" value={f.address} onChange={on} error={errs.address} autoComplete="street-address" />
          <div className="form-grid">
            <Field label="City" name="city" value={f.city} onChange={on} error={errs.city} />
            <Field label="PIN code" name="pincode" inputMode="numeric" value={f.pincode} onChange={on} error={errs.pincode} />
          </div>
          <fieldset>
            <legend>Payment method</legend>
            <div className="methods">
              {METHODS.map((m) => (
                <label key={m} className={pay === m ? 'on' : ''}><input type="radio" name="pay" value={m} checked={pay === m} onChange={() => setPay(m)} />{m}</label>
              ))}
            </div>
            {errs.pay && <span className="ferr" role="alert">{errs.pay}</span>}
          </fieldset>
          <button className="btn btn-dark" type="submit" disabled={busy}>{busy ? 'Placing order…' : 'Place Order'}</button>
          <p className="muted small">This is a frontend demonstration. No real order is created.</p>
        </form>
      </div>
    </div>
  )
}
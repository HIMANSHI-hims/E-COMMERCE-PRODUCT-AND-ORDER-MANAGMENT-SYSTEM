import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { ShoppingCart, Menu, X } from 'lucide-react'
import { useCart } from '../context/CartContext.jsx'
import { useCustomer } from '../context/CustomerContext.jsx'

const links = [['/', 'Home'], ['/products', 'Products'], ['/order', 'Place Order'], ['/orders', 'View Orders'], ['/inventory', 'Inventory'], ['/subqueries', 'Subqueries']]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const { count } = useCart()
  const { customer, signOut } = useCustomer()
  const close = () => setOpen(false)
  return (
    <header className="nav">
      <div className="container nav-in">
        <Link to="/" className="logo" onClick={close}>ELVORA</Link>
        <nav className={`nav-links ${open ? 'open' : ''}`} aria-label="Main">
          {links.map(([to, label]) => (
            <NavLink key={to} to={to} end={to === '/'} onClick={close}>{label}</NavLink>
          ))}
          <NavLink to="/admin" className="admin-link" onClick={close}>Admin Dashboard</NavLink>
        </nav>
        <div className="nav-actions">
          {customer && (
            <>
              <span className="who">Hi, {customer.name.split(' ')[0]}</span>
              <button className="btn btn-outline btn-sm" onClick={signOut}>Sign out</button>
            </>
          )}
          <Link to="/order" className="cart-btn" aria-label={`Cart, ${count} items`}>
            <ShoppingCart size={20} />
            {count > 0 && <span className="badge">{count}</span>}
          </Link>
          <button className="menu-btn" onClick={() => setOpen(!open)} aria-label="Toggle menu" aria-expanded={open}>
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>
    </header>
  )
}
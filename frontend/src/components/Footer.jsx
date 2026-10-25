import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="footer dark">
      <div className="container foot-in">
        <div>
          <div className="logo">ELVORA</div>
          <p>An E-Commerce Order and Management System</p>
          <p className="small">A Database Management System Project.</p>
        </div>
        <nav aria-label="Footer" className="foot-links">
          <Link to="/products">Products</Link>
          <Link to="/order">Place Order</Link>
          <Link to="/orders">View Orders</Link>
          <Link to="/inventory">Inventory</Link>
        </nav>
      </div>
      <div className="container small copy">© {new Date().getFullYear()} ELVORA. All rights reserved.</div>
    </footer>
  )
}
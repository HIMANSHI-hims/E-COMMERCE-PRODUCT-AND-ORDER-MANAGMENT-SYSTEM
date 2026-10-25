import { useEffect } from 'react'
import { Routes, Route, useLocation, Link } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import Footer from './components/Footer.jsx'
import PageHeader from './components/PageHeader.jsx'
import Home from './pages/Home.jsx'
import Products from './pages/Products.jsx'
import PlaceOrder from './pages/PlaceOrder.jsx'
import ViewOrders from './pages/ViewOrders.jsx'
import Inventory from './pages/Inventory.jsx'
import AdminDashboard from './pages/AdminDashboard.jsx'
import { useStore } from './context/StoreContext.jsx'

function ScrollTop() {
  const { pathname } = useLocation()
  useEffect(() => window.scrollTo(0, 0), [pathname])
  return null
}

function NotFound() {
  return (
    <div className="container section">
      <PageHeader title="Page not found" subtitle="That address doesn’t match any page in the store." />
      <Link className="btn btn-dark" to="/">Back to home</Link>
    </div>
  )
}

export default function App() {
  const { toast } = useStore()
  return (
    <>
      <ScrollTop />
      <a className="skip" href="#main">Skip to content</a>
      <Navbar />
      <main id="main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/order" element={<PlaceOrder />} />
          <Route path="/orders" element={<ViewOrders />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
      {toast && <div className={`toast ${toast.type}`} role="status">{toast.msg}</div>}
    </>
  )
}
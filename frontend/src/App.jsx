import { useEffect } from 'react'
import { Routes, Route, useLocation, Link } from 'react-router-dom'
import Navbar from './components/NavBar.jsx'
import Footer from './components/Footer.jsx'
import PageHeader from './components/PageHeader.jsx'
import AdminGate from './components/AdminGate.jsx'
import CustomerGate from './components/CustomerGate.jsx'
import Home from './pages/Home.jsx'
import Products from './pages/Products.jsx'
import PlaceOrder from './pages/PlaceOrder.jsx'
import PayOrder from './pages/PayOrder.jsx'
import ViewOrders from './pages/ViewOrders.jsx'
import Inventory from './pages/Inventory.jsx'
import AdminDashboard from './pages/AdminDashboard.jsx'
import { useStore } from './context/StoreContext.jsx'
import Subqueries from './pages/Subqueries.jsx'
import FormattedProducts from "./components/FormattedProducts";
import CursorSearch from './pages/cursorSearch.jsx'

function ScrollTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
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

// Shopping pages need a customer sign-in; admin pages have their own sign-in.
const shop = (page) => <CustomerGate>{page}</CustomerGate>

export default function App() {
  const { toast } = useStore()
  return (
    <>
      <ScrollTop />
      <a className="skip" href="#main">Skip to content</a>
      <Navbar />
      <main id="main">
        <Routes>
          <Route path="/" element={shop(<Home />)} />
          <Route path="/products" element={shop(<Products />)} />
          <Route path="/formatted-products" element={shop(<FormattedProducts />)} />
          <Route path="/order" element={shop(<PlaceOrder />)} />
          <Route path="/pay/:id" element={shop(<PayOrder />)} />
          <Route path="/orders" element={shop(<ViewOrders />)} />
          <Route path="/inventory" element={<AdminGate><Inventory /></AdminGate>} />
          <Route path="/admin" element={<AdminGate><AdminDashboard /></AdminGate>} />
          <Route path="/subqueries" element={<AdminGate><Subqueries /></AdminGate>} />
          <Route path="/cursor-search" element={<CursorSearch />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
      {toast && <div className={`toast ${toast.type}`} role="status">{toast.msg}</div>}
    </>
  )
}
import { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react'
import * as api from '../services/api.js'

const Ctx = createContext(null)
export const useStore = () => useContext(Ctx)

export function StoreProvider({ children }) {
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [toast, setToast] = useState(null)
  const timer = useRef()

  const notify = useCallback((msg, type = 'ok') => {
    setToast({ msg, type })
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setToast(null), 2800)
  }, [])

  // Re-read products and orders from the database.
  const sync = useCallback(async () => {
    const [p, o] = await Promise.all([api.getProducts(), api.getOrders()])
    setProducts(p)
    setOrders(o)
  }, [])

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      await sync()
    } catch (e) {
      setError(e.message || 'Could not load data.')
    } finally {
      setLoading(false)
    }
  }, [sync])
  useEffect(() => { load() }, [load])

  const loadStats = useCallback(async () => {
    const s = await api.getAdminStats()
    setStats(s)
    return s
  }, [])

  const categories = useMemo(() => [...new Set(products.map((p) => p.category))].sort(), [products])

  const saveProduct = async (p) => {
    const isNew = p.id == null
    const item = isNew ? { ...p, id: Math.max(0, ...products.map((x) => x.id)) + 1 } : p
    const saved = await api.saveProduct(item, isNew)
    setProducts((l) => (isNew ? [...l, saved] : l.map((x) => (x.id === saved.id ? saved : x))))
    return saved
  }
  const removeProduct = async (id) => {
    await api.deleteProduct(id)
    setProducts((l) => l.filter((x) => x.id !== id))
  }
  const placeOrder = async (payload) => {
    const res = await api.createOrder(payload)
    const order = {
      id: res.orderId ?? `ORD-${1000 + orders.length + 1}`,
      date: new Date().toISOString().slice(0, 10),
      customer: payload.customer.name,
      total: payload.total,
      status: 'Pending',
      payment: payload.payment,
      paymentStatus: 'Pending',
      items: payload.items
    }
    setOrders((l) => [order, ...l])
    setProducts((l) =>
      l.map((p) => {
        const i = payload.items.find((x) => x.productId === p.id)
        return i ? { ...p, stock: p.stock - i.qty } : p
      })
    )
    return order
  }

  // Admin: change order status. With the real API we re-read, so restocked quantities are exact.
  const setOrderStatus = async (id, status) => {
    await api.updateOrderStatus(id, status)
    if (api.isMock) setOrders((l) => l.map((o) => (o.id === id ? { ...o, status } : o)))
    else await sync()
  }
  const setPaymentStatus = async (id, status) => {
    await api.updatePaymentStatus(id, status)
    setOrders((l) => l.map((o) => (o.id === id ? { ...o, paymentStatus: status } : o)))
  }

  return (
    <Ctx.Provider value={{
      products, orders, categories, stats, loading, error, load, loadStats, toast, notify,
      saveProduct, removeProduct, placeOrder, setOrderStatus, setPaymentStatus
    }}>
      {children}
    </Ctx.Provider>
  )
}
import { createContext, useContext, useState, useEffect } from 'react'
import { useStore } from './StoreContext.jsx'

const Ctx = createContext(null)
export const useCart = () => useContext(Ctx)
const KEY = 'elvora-cart'
const read = () => {
  try { return JSON.parse(localStorage.getItem(KEY)) || [] } catch { return [] }
}

export function CartProvider({ children }) {
  const { notify } = useStore()
  const [items, setItems] = useState(read)
  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(items)) } catch { /* storage unavailable */ }
  }, [items])

  const add = (p) => {
    if (p.stock < 1) return notify('That product is out of stock.', 'err')
    const ex = items.find((i) => i.id === p.id)
    if (ex && ex.qty >= p.stock) return notify(`Only ${p.stock} available in stock.`, 'err')
    setItems(ex ? items.map((i) => (i.id === p.id ? { ...i, qty: i.qty + 1 } : i))
      : [...items, { id: p.id, name: p.name, price: p.price, image: p.image, qty: 1 }])
    notify(`${p.name} added to your cart.`)
  }
  const setQty = (id, qty) => setItems((l) => l.map((i) => (i.id === id ? { ...i, qty: Math.max(1, qty) } : i)))
  const remove = (id) => setItems((l) => l.filter((i) => i.id !== id))
  const clear = () => setItems([])
  const count = items.reduce((s, i) => s + i.qty, 0)
  const subtotal = items.reduce((s, i) => s + i.qty * i.price, 0)

  return <Ctx.Provider value={{ items, add, setQty, remove, clear, count, subtotal }}>{children}</Ctx.Provider>
}
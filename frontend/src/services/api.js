// All backend calls live here. With no VITE_API_BASE_URL set, mock data is used.
import { mockProducts } from '../data/mockProducts.js'
import { mockOrders } from '../data/mockOrders.js'

const BASE = import.meta.env.VITE_API_BASE_URL
const useMock = !BASE

async function request(path, options = {}) {
  const res = await fetch(BASE + path, { headers: { 'Content-Type': 'application/json' }, ...options })
  if (!res.ok) throw new Error(`Request failed (${res.status})`)
  return res.status === 204 ? null : res.json()
}
const wait = (data) => new Promise((r) => setTimeout(() => r(structuredClone(data)), 350))

export const getProducts = () => (useMock ? wait(mockProducts) : request('/products'))
export const getCategories = () =>
  useMock ? wait([...new Set(mockProducts.map((p) => p.category))]) : request('/categories')
export const getInventory = () => (useMock ? wait(mockProducts) : request('/inventory'))
export const getOrders = () => (useMock ? wait(mockOrders) : request('/orders'))
export const createOrder = (order) =>
  useMock ? wait({}) : request('/orders', { method: 'POST', body: JSON.stringify(order) })
export const saveProduct = (p, isNew) =>
  useMock
    ? wait(p)
    : request(isNew ? '/products' : `/products/${p.id}`, { method: isNew ? 'POST' : 'PUT', body: JSON.stringify(p) })
export const deleteProduct = (id) =>
  useMock ? wait({}) : request(`/products/${id}`, { method: 'DELETE' })
// All backend calls live here. With no VITE_API_BASE_URL set, mock data is used.
import { mockProducts } from '../data/mockProducts.js'
import { mockOrders } from '../data/mockOrders.js'

const BASE = import.meta.env.VITE_API_BASE_URL
const useMock = !BASE
export const isMock = useMock

// The sign-in token lives in sessionStorage, so it disappears when the tab closes.
const TOKEN_KEY = 'elvora-admin-token'
export const getToken = () => {
  try { return sessionStorage.getItem(TOKEN_KEY) || '' } catch { return '' }
}
export const setToken = (t) => {
  try { t ? sessionStorage.setItem(TOKEN_KEY, t) : sessionStorage.removeItem(TOKEN_KEY) } catch { /* storage unavailable */ }
}

async function request(path, options = {}) {
  const headers = { 'Content-Type': 'application/json' }
  const token = getToken()
  if (token) headers.Authorization = `Bearer ${token}`
  const res = await fetch(BASE + path, { ...options, headers })
  if (!res.ok) {
    if (res.status === 401 && token) {
      setToken('')
      window.dispatchEvent(new Event('elvora-auth-expired'))
    }
    let detail = ''
    try { detail = (await res.json()).detail } catch { /* no JSON body */ }
    throw new Error(typeof detail === 'string' && detail ? detail : `Request failed (${res.status})`)
  }
  return res.status === 204 ? null : res.json()
}
const wait = (data) => new Promise((r) => setTimeout(() => r(structuredClone(data)), 350))
const patch = (path, status) => request(path, { method: 'PATCH', body: JSON.stringify({ status }) })

export const login = (username, password) =>
  request('/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) })
export const me = () => request('/auth/me')

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
export const updateOrderStatus = (id, status) =>
  useMock ? wait({}) : patch(`/orders/${id}/status`, status)
export const updatePaymentStatus = (id, status) =>
  useMock ? wait({}) : patch(`/orders/${id}/payment`, status)
export const getAdminStats = () => (useMock ? wait({ customers: 42 }) : request('/admin/stats'))
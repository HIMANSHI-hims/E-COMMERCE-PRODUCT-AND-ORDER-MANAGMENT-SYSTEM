// All backend calls live here. With no VITE_API_BASE_URL set, mock data is used.
import { mockProducts } from '../data/mockProducts.js'
import { mockOrders } from '../data/mockOrders.js'

const BASE = import.meta.env.VITE_API_BASE_URL
const useMock = !BASE
export const isMock = useMock

// Sign-in tokens live in sessionStorage, so they disappear when the tab closes.
const ADMIN_KEY = 'elvora-admin-token'
const CUSTOMER_KEY = 'elvora-customer-token'
const read = (k) => {
  try { return sessionStorage.getItem(k) || '' } catch { return '' }
}
const write = (k, v) => {
  try { v ? sessionStorage.setItem(k, v) : sessionStorage.removeItem(k) } catch { /* storage unavailable */ }
}
export const getToken = () => read(ADMIN_KEY)
export const setToken = (t) => write(ADMIN_KEY, t)
export const getCustomerToken = () => read(CUSTOMER_KEY)
export const setCustomerToken = (t) => write(CUSTOMER_KEY, t)

// `who` says which sign-in the request needs: 'admin', 'customer' or 'none' (public).
async function request(path, options = {}, who = 'none') {
  const headers = { 'Content-Type': 'application/json' }
  const token = who === 'admin' ? getToken() : who === 'customer' ? getCustomerToken() : ''
  if (token) headers.Authorization = `Bearer ${token}`

  let res
  try {
    res = await fetch(BASE + path, { ...options, headers })
  } catch {
    throw new Error('Cannot reach the server. Please check that the backend is running.')
  }
  if (!res.ok) {
    if (res.status === 401 && token) {
      if (who === 'admin') setToken('')
      else setCustomerToken('')
      window.dispatchEvent(new CustomEvent('elvora-auth-expired', { detail: who }))
    }
    let detail = ''
    try { detail = (await res.json()).detail } catch { /* no JSON body */ }
    const msg = Array.isArray(detail)
      ? detail
          .map((d) => {
            const field = (d.loc || []).slice(1).join('.')
            const text = String(d.msg).replace(/^Value error, /, '')
            return field ? `${field}: ${text}` : text
          })
          .join(' ')
      : detail
    throw new Error(typeof msg === 'string' && msg ? msg : `Request failed (${res.status})`)
  }
  return res.status === 204 ? null : res.json()
}
const wait = (data) => new Promise((r) => setTimeout(() => r(structuredClone(data)), 350))
const patch = (path, status) =>
  request(path, { method: 'PATCH', body: JSON.stringify({ status }) }, 'admin')
const post = (path, body, who = 'none') =>
  request(path, { method: 'POST', body: JSON.stringify(body) }, who)

// Admin sign-in
export const login = (username, password) => post('/auth/login', { username, password })
export const me = () => request('/auth/me', {}, 'admin')

// Customer accounts
export const accountRegister = (data) => post('/account/register', data)
export const accountLogin = (email, password) => post('/account/login', { email, password })
export const accountMe = () => request('/account/me', {}, 'customer')

// Public catalogue
export const getProducts = () => (useMock ? wait(mockProducts) : request('/products'))
export const getCategories = () =>
  useMock ? wait([...new Set(mockProducts.map((p) => p.category))]) : request('/categories')
export const getInventory = () => (useMock ? wait(mockProducts) : request('/inventory'))
export const getOverview = () =>
  useMock
    ? wait({
        products: mockProducts.length,
        categories: new Set(mockProducts.map((p) => p.category)).size,
        orders: mockOrders.length,
        in_stock: mockProducts.filter((p) => p.stock > 0).length
      })
    : request('/stats/overview')

// Orders
export const getMyOrders = () => (useMock ? wait(mockOrders) : request('/orders/mine', {}, 'customer'))
export const createOrder = (order) => (useMock ? wait({}) : post('/orders', order, 'customer'))
export const getOrders = () => (useMock ? wait(mockOrders) : request('/orders', {}, 'admin'))
export const updateOrderStatus = (id, status) =>
  useMock ? wait({}) : patch(`/orders/${id}/status`, status)
export const updatePaymentStatus = (id, status) =>
  useMock ? wait({}) : patch(`/orders/${id}/payment`, status)

// Admin: products and statistics
export const saveProduct = (p, isNew) =>
  useMock
    ? wait(p)
    : request(
        isNew ? '/products' : `/products/${p.id}`,
        { method: isNew ? 'POST' : 'PUT', body: JSON.stringify(p) },
        'admin'
      )
export const deleteProduct = (id) =>
  useMock ? wait({}) : request(`/products/${id}`, { method: 'DELETE' }, 'admin')
export const getAdminStats = () => (useMock ? wait({ customers: 42 }) : request('/admin/stats', {}, 'admin'))
import { createContext, useContext, useState, useEffect } from 'react'
import * as api from '../services/api.js'
import { useCart } from './CartContext.jsx'

const Ctx = createContext(null)
export const useCustomer = () => useContext(Ctx)

export function CustomerProvider({ children }) {
  const { clear } = useCart()
  const [customer, setCustomer] = useState(null)
  const [status, setStatus] = useState(() => (api.isMock || !api.getCustomerToken() ? 'out' : 'checking'))

  // If a token from this browser tab is still valid, sign the customer back in.
  useEffect(() => {
    if (api.isMock || !api.getCustomerToken()) return
    api.accountMe()
      .then((c) => { setCustomer(c); setStatus('in') })
      .catch(() => { api.setCustomerToken(''); setStatus('out') })
  }, [])

  // If any request finds the token expired, return to the welcome screen.
  useEffect(() => {
    const onExpired = (e) => {
      if (e.detail === 'customer') { setCustomer(null); setStatus('out') }
    }
    window.addEventListener('elvora-auth-expired', onExpired)
    return () => window.removeEventListener('elvora-auth-expired', onExpired)
  }, [])

  const start = (r) => {
    api.setCustomerToken(r.token)
    setCustomer(r.customer)
    setStatus('in')
  }
  const signIn = async (email, password) => start(await api.accountLogin(email, password))
  const register = async (data) => start(await api.accountRegister(data))
  const signOut = () => {
    api.setCustomerToken('')
    setCustomer(null)
    setStatus('out')
    clear() // the cart belongs to the person who filled it
  }

  return <Ctx.Provider value={{ customer, status, signIn, register, signOut }}>{children}</Ctx.Provider>
}
import { useEffect, useState } from 'react'
import { LogOut } from 'lucide-react'
import Field from './Field.jsx'
import * as api from '../services/api.js'

export default function AdminGate({ children }) {
  const [state, setState] = useState(api.isMock ? 'in' : 'checking') // checking | out | in
  const [admin, setAdmin] = useState(null)
  const [form, setForm] = useState({ username: '', password: '' })
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)

  // On load, check whether a stored token is still valid.
  useEffect(() => {
    if (api.isMock) return
    if (!api.getToken()) { setState('out'); return }
    api.me().then((a) => { setAdmin(a); setState('in') })
      .catch(() => { api.setToken(''); setState('out') })
  }, [])

  // If any request finds the token expired, return to the sign-in screen.
  useEffect(() => {
    const onExpired = (e) => {
  if (e.detail !== 'admin') return
  setState('out')
  setErr('Your session ended. Please sign in again.')
}
    window.addEventListener('elvora-auth-expired', onExpired)
    return () => window.removeEventListener('elvora-auth-expired', onExpired)
  }, [])

  const signIn = async (e) => {
    e.preventDefault()
    setErr('')
    setBusy(true)
    try {
      const r = await api.login(form.username.trim(), form.password)
      api.setToken(r.token)
      setAdmin(r)
      setForm({ username: '', password: '' })
      setState('in')
    } catch (x) {
      setErr(x.message)
    } finally {
      setBusy(false)
    }
  }
  const signOut = () => { api.setToken(''); setAdmin(null); setState('out'); setErr('') }
  const on = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  if (state === 'checking') return <div className="container section"><p className="state" role="status">Loading…</p></div>

  if (state === 'out') {
    return (
      <div className="container section">
        <form className="card form gate" onSubmit={signIn} noValidate>
          <h1>Admin sign-in</h1>
          <p>Sign in to manage products, orders and payments.</p>
          <Field label="Username" name="username" value={form.username} onChange={on} autoComplete="username" />
          <Field label="Password" name="password" type="password" value={form.password} onChange={on} autoComplete="current-password" />
          {err && <span className="ferr" role="alert">{err}</span>}
          <button className="btn btn-dark" type="submit" disabled={busy || !form.username.trim() || !form.password}>
            {busy ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    )
  }

  return (
    <>
      {!api.isMock && (
        <div className="container admin-bar">
          <span>Signed in as <strong>{admin?.name || admin?.username}</strong></span>
          <button className="btn btn-outline btn-sm" onClick={signOut}><LogOut size={14} /> Sign out</button>
        </div>
      )}
      {children}
    </>
  )
}
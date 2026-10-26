import { useState } from 'react'
import { Link } from 'react-router-dom'
import Field from './Field.jsx'
import { useCustomer } from '../context/CustomerContext.jsx'
import * as api from '../services/api.js'

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const blank = { name: '', email: '', phone: '', address: '', password: '', confirm: '' }

function Welcome() {
  const { signIn, register } = useCustomer()
  const [mode, setMode] = useState('choose') // choose | signin | register
  const [f, setF] = useState(blank)
  const [errs, setErrs] = useState({})
  const [formErr, setFormErr] = useState('')
  const [busy, setBusy] = useState(false)

  const on = (e) => setF({ ...f, [e.target.name]: e.target.value })
  const go = (m) => { setMode(m); setF(blank); setErrs({}); setFormErr('') }

  const submit = async (e) => {
    e.preventDefault()
    const er = {}
    if (!EMAIL.test(f.email.trim())) er.email = 'Enter a valid email address'
    if (mode === 'register') {
      if (f.name.trim().length < 2) er.name = 'Enter your full name'
      if (!/^\d{10}$/.test(f.phone.trim())) er.phone = 'Enter a 10-digit mobile number'
      if (f.address.trim().length < 5) er.address = 'Enter your delivery address'
      if (f.password.length < 8) er.password = 'Use at least 8 characters'
      else if (f.password.length > 72) er.password = 'Use 72 characters or fewer'
      if (f.confirm !== f.password) er.confirm = 'The passwords do not match'
    } else if (!f.password) {
      er.password = 'Enter your password'
    }
    setErrs(er)
    setFormErr('')
    if (Object.keys(er).length) return
    setBusy(true)
    try {
      if (mode === 'register') {
  await register({ name: f.name.trim(), email: f.email.trim(), phone: f.phone.trim(), address: f.address.trim(), password: f.password })
} else {
  await signIn(f.email.trim(), f.password)
}
    } catch (x) {
      setFormErr(x.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="welcome">
      <div className="card welcome-card">
        <h1 className="wordmark">ELVORA</h1>
        <p className="muted">An E-Commerce Order and Management System</p>

        {mode === 'choose' && (
          <>
            <p>Welcome. Please sign in, or create an account to start shopping.</p>
            <div className="choices">
              <button className="btn btn-dark" onClick={() => go('signin')}>Sign in</button>
              <button className="btn btn-outline" onClick={() => go('register')}>New user</button>
            </div>
            <p className="small"><Link to="/admin" className="link">Admin sign-in</Link></p>
          </>
        )}

        {mode !== 'choose' && (
          <form className="stack" onSubmit={submit} noValidate>
            <h2>{mode === 'register' ? 'Create your account' : 'Sign in'}</h2>
            {mode === 'register' && (
              <>
                <Field label="Full name" name="name" value={f.name} onChange={on} error={errs.name} autoComplete="name" />
                <Field label="Mobile number" name="phone" inputMode="numeric" value={f.phone} onChange={on} error={errs.phone} autoComplete="tel" />
                <Field label="Delivery address (street, city, PIN code)" name="address" value={f.address} onChange={on} error={errs.address} autoComplete="street-address" />
              </>
            )}
            <Field label="Email" name="email" type="email" value={f.email} onChange={on} error={errs.email} autoComplete="email" />
            <Field label="Password" name="password" type="password" value={f.password} onChange={on} error={errs.password}
              autoComplete={mode === 'register' ? 'new-password' : 'current-password'} />
            {mode === 'register' && (
              <Field label="Confirm password" name="confirm" type="password" value={f.confirm} onChange={on} error={errs.confirm} autoComplete="new-password" />
            )}
            {formErr && <span className="ferr" role="alert">{formErr}</span>}
            <button className="btn btn-dark" type="submit" disabled={busy}>
              {busy ? 'Please wait…' : mode === 'register' ? 'Create account' : 'Sign in'}
            </button>
            <p className="small center">
              {mode === 'register' ? 'Already have an account? ' : 'New here? '}
              <button type="button" className="linkbtn" onClick={() => go(mode === 'register' ? 'signin' : 'register')}>
                {mode === 'register' ? 'Sign in' : 'Create an account'}
              </button>
              {' · '}
              <button type="button" className="linkbtn" onClick={() => go('choose')}>Back</button>
            </p>
          </form>
        )}
      </div>
    </div>
  )
}

// Wraps every shopping page. Visitors who are not signed in only see the welcome screen.
export default function CustomerGate({ children }) {
  const { status } = useCustomer()
  if (api.isMock) return children
  if (status === 'checking') {
    return <div className="container section"><p className="state" role="status">Loading…</p></div>
  }
  if (status === 'out') return <Welcome />
  return children
}
import { isMock } from '../services/api.js'
import { useState } from 'react'
import { Pencil, Trash2, Plus, Search, ShieldAlert } from 'lucide-react'
import Field from './Field.jsx'
import Status from './Status.jsx'
import { useStore } from '../context/StoreContext.jsx'
import { inr, LOW_STOCK } from '../utils.js'

const empty = { name: '', category: '', brand: '', price: '', stock: '', image: '' }

export default function ProductManager({ allowDelete = false }) {
  const { products, categories, loading, error, saveProduct, removeProduct, notify } = useStore()
  const [q, setQ] = useState('')
  const [cat, setCat] = useState('All')
  const [form, setForm] = useState(null)
  const [errs, setErrs] = useState({})

  const rows = products.filter((p) =>
    (cat === 'All' || p.category === cat) && `${p.name} ${p.brand}`.toLowerCase().includes(q.toLowerCase()))
  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    const er = {}
    if (!form.name.trim()) er.name = 'Enter a product name'
    if (!form.category.trim()) er.category = 'Enter a category'
    if (!form.brand.trim()) er.brand = 'Enter a brand'
    if (!(Number(form.price) > 0)) er.price = 'Enter a price above 0'
    if (form.stock === '' || !Number.isInteger(Number(form.stock)) || Number(form.stock) < 0) er.stock = 'Enter a whole number, 0 or more'
    setErrs(er)
    if (Object.keys(er).length) return
    try {
      await saveProduct({ ...form, name: form.name.trim(), category: form.category.trim(), brand: form.brand.trim(), price: Number(form.price), stock: Number(form.stock) })
      notify(form.id ? 'Product updated.' : 'Product added.')
      setForm(null)
    } catch (x) { notify(x.message, 'err') }
  }
  const del = async (p) => {
    if (!window.confirm(`Delete “${p.name}”?`)) return
    try { await removeProduct(p.id); notify('Product deleted.') } catch (x) { notify(x.message, 'err') }
  }

  return (
    <section aria-labelledby="pm-title" className="pm">
      <div className="page-head">
        <h2 id="pm-title">{allowDelete ? 'Product management' : 'Stock levels'}</h2>
        <button className="btn btn-dark" onClick={() => { setErrs({}); setForm(empty) }}><Plus size={16} /> Add Product</button>
      </div>
      <p className="note"><ShieldAlert size={16} /> {isMock ? 'Changes are kept in this browser session only and are not saved to a database.' : 'Changes are saved to the Oracle database.'}</p>

      {form && (
        <form className="card form" onSubmit={submit} noValidate>
          <h3>{form.id ? 'Edit product' : 'New product'}</h3>
          <div className="form-grid">
            <Field label="Name" name="name" value={form.name} onChange={change} error={errs.name} />
            <Field label="Category" name="category" value={form.category} onChange={change} error={errs.category} list="cats" />
            <datalist id="cats">{categories.map((c) => <option key={c} value={c} />)}</datalist>
            <Field label="Brand" name="brand" value={form.brand} onChange={change} error={errs.brand} />
            <Field label="Price (₹)" name="price" type="number" min="1" value={form.price} onChange={change} error={errs.price} />
            <Field label="Stock quantity" name="stock" type="number" min="0" value={form.stock} onChange={change} error={errs.stock} />
            <Field label="Image URL (optional)" name="image" value={form.image} onChange={change} />
          </div>
          <div className="row-gap">
            <button className="btn btn-dark" type="submit">Save product</button>
            <button className="btn btn-outline" type="button" onClick={() => setForm(null)}>Cancel</button>
          </div>
        </form>
      )}

      <div className="filters">
        <label className="search"><Search size={16} /><input type="search" placeholder="Search name or brand" aria-label="Search products" value={q} onChange={(e) => setQ(e.target.value)} /></label>
        <select aria-label="Filter by category" value={cat} onChange={(e) => setCat(e.target.value)}>
          <option>All</option>{categories.map((c) => <option key={c}>{c}</option>)}
        </select>
      </div>

      {loading || error ? <Status /> : rows.length === 0 ? (
        <p className="state">No products match your search.</p>
      ) : (
        <div className="tw">
          <table>
            <thead><tr><th>ID</th><th>Product</th><th>Category</th><th>Brand</th><th>Unit price</th><th>Stock</th><th>Actions</th></tr></thead>
            <tbody>
              {rows.map((p) => (
                <tr key={p.id} className={p.stock <= LOW_STOCK ? 'low' : ''}>
                  <td>{p.id}</td><td>{p.name}</td><td>{p.category}</td><td>{p.brand}</td><td>{inr(p.price)}</td>
                  <td>{p.stock}{p.stock <= LOW_STOCK && <span className="pill Pending ml">Low stock</span>}</td>
                  <td className="actions">
                    <button className="btn btn-outline btn-sm" aria-label={`Edit ${p.name}`} onClick={() => { setErrs({}); setForm(p) }}><Pencil size={14} /> Edit</button>
                    {allowDelete && <button className="btn btn-outline btn-sm" aria-label={`Delete ${p.name}`} onClick={() => del(p)}><Trash2 size={14} /> Delete</button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
import { useState } from 'react'
import { ImageOff } from 'lucide-react'
import { useCart } from '../context/CartContext.jsx'
import { inr, LOW_STOCK } from '../utils.js'

export default function ProductCard({ p }) {
  const { add } = useCart()
  const [bad, setBad] = useState(false)
  const stockClass = p.stock === 0 ? 'out' : p.stock <= LOW_STOCK ? 'low' : ''
  return (
    <article className="card product">
      <div className="pimg">
        {p.image && !bad ? <img src={p.image} alt={p.name} loading="lazy" onError={() => setBad(true)} /> : <ImageOff size={30} aria-label="No image available" />}
      </div>
      <div className="pbody">
        <span className="muted small">{p.category}, {p.brand}</span>
        <h3>{p.name}</h3>
        <div className="row">
          <strong>{inr(p.price)}</strong>
          <span className={`stock ${stockClass}`}>{p.stock === 0 ? 'Out of stock' : `${p.stock} in stock`}</span>
        </div>
        <button className="btn btn-dark" disabled={p.stock === 0} onClick={() => add(p)}>Add to Cart</button>
      </div>
    </article>
  )
}
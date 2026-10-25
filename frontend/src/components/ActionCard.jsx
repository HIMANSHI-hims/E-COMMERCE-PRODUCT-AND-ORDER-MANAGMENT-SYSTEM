import { Link } from 'react-router-dom'

export default function ActionCard({ to, icon: Icon, title, text }) {
  return (
    <Link to={to} className="card action">
      <span className="ico"><Icon size={22} /></span>
      <h3>{title}</h3>
      <p className="muted">{text}</p>
    </Link>
  )
}
export default function StatCard({ icon: Icon, label, value, note }) {
  return (
    <div className="stat">
      {Icon && <Icon size={20} />}
      <strong>{value}</strong>
      <span>{label}</span>
      {note && <em>{note}</em>}
    </div>
  )
}
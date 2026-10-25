import { useStore } from '../context/StoreContext.jsx'

export default function Status() {
  const { loading, error, load } = useStore()
  if (loading) return <p className="state" role="status">Loading…</p>
  if (error) {
    return (
      <div className="state err" role="alert">
        <p>We couldn’t load the data: {error}</p>
        <button className="btn btn-outline" onClick={load}>Try again</button>
      </div>
    )
  }
  return null
}
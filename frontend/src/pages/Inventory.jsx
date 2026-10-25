import PageHeader from '../components/PageHeader.jsx'
import ProductManager from '../components/ProductManager.jsx'

export default function Inventory() {
  return (
    <div className="container section">
      <PageHeader title="Inventory" subtitle="Track stock levels. Items at or below 10 units are highlighted." />
      <ProductManager />
    </div>
  )
}
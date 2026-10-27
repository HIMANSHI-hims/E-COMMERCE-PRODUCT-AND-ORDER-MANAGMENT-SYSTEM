import PageHeader from '../components/PageHeader.jsx'
import SubqueryInfo from '../components/SubqueryInfo.jsx'

export default function Subqueries() {
  return (
    <div className="container section">
      <PageHeader
        title="Subquery Information"
        subtitle="Subqueries are SQL queries nested inside another query. In ELVORA, they help analyze product prices, customer orders, and inventory activity using data retrieved from the Oracle database."
      />
      <SubqueryInfo />
    </div>
  )
}
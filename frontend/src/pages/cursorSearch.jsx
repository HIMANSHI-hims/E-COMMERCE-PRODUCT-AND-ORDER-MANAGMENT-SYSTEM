// frontend/src/pages/CursorSearch.jsx
import { useEffect, useState } from "react";
import "./CursorSearch.css";

// Use the same API base your other pages use (check how Products/Subqueries fetch).
   const API = 'http://localhost:8000'

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export default function CursorSearch() {
  const [term, setTerm] = useState("");
  const [limit, setLimit] = useState(50);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showCode, setShowCode] = useState(false);

  const runSearch = async (searchTerm = term) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(
        `${API}/cursor-search?q=${encodeURIComponent(searchTerm)}&limit=${limit}`
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Search failed");
      setResult(data);
    } catch (e) {
      setError(e.message);
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  // Load the first rows when the page opens
  useEffect(() => {
    runSearch("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSubmit = (e) => {
    e.preventDefault();
    runSearch();
  };

  return (
    <main className="cs-page">
      <h1>Cursor Search</h1>
      <p className="cs-sub">
        Products are fetched <strong>one row at a time</strong> by an explicit
        PL/SQL cursor running inside Oracle.
      </p>

      <form className="cs-form" onSubmit={onSubmit}>
        <input
          type="text"
          placeholder="Search product name (e.g. Acer)"
          value={term}
          onChange={(e) => setTerm(e.target.value)}
        />
        <select value={limit} onChange={(e) => setLimit(Number(e.target.value))}>
          <option value={10}>10 rows</option>
          <option value={25}>25 rows</option>
          <option value={50}>50 rows</option>
          <option value={100}>100 rows</option>
        </select>
        <button type="submit" disabled={loading}>
          {loading ? "Fetching..." : "Run cursor"}
        </button>
      </form>

      {error && <p className="cs-error">{error}</p>}

      {result && (
        <>
          <section className="cs-log">
            <h3>Cursor activity</h3>
            <ol>
              <li>
                <code>OPEN product_cursor('{result.query}')</code>
              </li>
              <li>
                <code>FETCH</code> repeated in a loop, {result.rowcount} row
                {result.rowcount === 1 ? "" : "s"} fetched
                {result.hasMore ? " (stopped at the row limit)" : ""}
              </li>
              <li>
                <code>%ROWCOUNT = {result.rowcount}</code>,{" "}
                <code>%NOTFOUND</code> ended the loop
              </li>
              <li>
                <code>CLOSE product_cursor</code>
              </li>
            </ol>
            <button
              type="button"
              className="cs-link"
              onClick={() => setShowCode((s) => !s)}
            >
              {showCode ? "Hide" : "Show"} PL/SQL code
            </button>
            {showCode && <pre>{result.plsql}</pre>}
          </section>

          {result.rows.length === 0 ? (
            <p>No products matched "{result.query}".</p>
          ) : (
            <table className="cs-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Product ID</th>
                  <th>Name</th>
                  <th>Price</th>
                  <th>Stock</th>
                </tr>
              </thead>
              <tbody>
                {result.rows.map((p, i) => (
                  <tr key={p.id}>
                    <td>{i + 1}</td>
                    <td>{p.id}</td>
                    <td>{p.name}</td>
                    <td>{inr.format(p.price)}</td>
                    <td>{p.stock}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}
    </main>
  );
}
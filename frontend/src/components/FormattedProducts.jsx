
import { useEffect, useState } from "react";

export default function FormattedProducts() {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/products/formatted")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch products");
        }
        return response.json();
      })
      .then((data) => setProducts(data))
      .catch((err) => setError(err.message));
  }, []);

  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      <h2>Formatted Products</h2>

      <table>
        <thead>
          <tr>
            <th>Product</th>
            <th>Brand</th>
            <th>Price</th>
            <th>Short Name</th>
            <th>Name Length</th>
          </tr>
        </thead>

        <tbody>
          {products.map((p) => (
            <tr key={p.product_id}>
              <td>{p.product_name}</td>
              <td>{p.brand_name}</td>
              <td>₹{p.rounded_price}</td>
              <td>{p.short_name}</td>
              <td>{p.name_length}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

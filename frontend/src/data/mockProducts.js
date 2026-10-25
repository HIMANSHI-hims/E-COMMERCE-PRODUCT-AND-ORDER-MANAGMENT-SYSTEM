const img = (id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=600&q=70`

export const mockProducts = [
  { id: 1, name: 'K8 Wireless Mechanical Keyboard', category: 'Accessories', brand: 'Keychron', price: 8499, stock: 24, image: img('photo-1587829741301-dc798b83add3') },
  { id: 2, name: 'MX Master 3S Mouse', category: 'Accessories', brand: 'Logitech', price: 9995, stock: 18, image: img('photo-1527864550417-7fd91fc51a46') },
  { id: 3, name: 'WH-1000XM5 Headphones', category: 'Audio', brand: 'Sony', price: 29990, stock: 9, image: img('photo-1505740420928-5e560c06d30e') },
  { id: 4, name: 'UltraSharp 27 Monitor', category: 'Displays', brand: 'Dell', price: 32500, stock: 6, image: img('photo-1527443224154-c4a3942d3acf') },
  { id: 5, name: 'Zenbook 14 Laptop', category: 'Computers', brand: 'ASUS', price: 74990, stock: 12, image: img('photo-1496181133206-80ce9b88a853') },
  { id: 6, name: 'C920 HD Webcam', category: 'Accessories', brand: 'Logitech', price: 6495, stock: 30, image: '' },
  { id: 7, name: '7-in-1 USB-C Hub', category: 'Accessories', brand: 'Anker', price: 3299, stock: 45, image: '' },
  { id: 8, name: 'Flip 6 Bluetooth Speaker', category: 'Audio', brand: 'JBL', price: 9999, stock: 0, image: '' }
]
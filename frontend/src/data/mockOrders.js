export const mockOrders = [
  { id: 'ORD-1004', date: '2026-10-21', customer: 'Sana Khan', total: 6495, status: 'Cancelled', payment: 'Cash',
    items: [{ productId: 6, name: 'C920 HD Webcam', qty: 1, price: 6495 }] },
  { id: 'ORD-1003', date: '2026-10-17', customer: 'Rohan Verma', total: 39098, status: 'Pending', payment: 'Net Banking',
    items: [{ productId: 4, name: 'UltraSharp 27 Monitor', qty: 1, price: 32500 }, { productId: 7, name: '7-in-1 USB-C Hub', qty: 2, price: 3299 }] },
  { id: 'ORD-1002', date: '2026-10-09', customer: 'Meera Iyer', total: 29990, status: 'Shipped', payment: 'Card',
    items: [{ productId: 3, name: 'WH-1000XM5 Headphones', qty: 1, price: 29990 }] },
  { id: 'ORD-1001', date: '2026-10-02', customer: 'Aarav Sharma', total: 18494, status: 'Delivered', payment: 'UPI',
    items: [{ productId: 1, name: 'K8 Wireless Mechanical Keyboard', qty: 1, price: 8499 }, { productId: 2, name: 'MX Master 3S Mouse', qty: 1, price: 9995 }] }
]
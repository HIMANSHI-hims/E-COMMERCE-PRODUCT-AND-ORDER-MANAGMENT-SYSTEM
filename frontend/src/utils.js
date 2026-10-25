export const LOW_STOCK = 10
export const inr = (n) => '₹' + Number(n).toLocaleString('en-IN')
export const fmtDate = (d) =>
  new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
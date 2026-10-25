export default function Field({ label, error, ...props }) {
  const id = `f-${props.name}`
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <input id={id} aria-invalid={!!error} aria-describedby={error ? `${id}-e` : undefined} {...props} />
      {error && <span className="ferr" id={`${id}-e`} role="alert">{error}</span>}
    </div>
  )
}
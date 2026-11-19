export default function Modal({ children, tone = 'default', wide }) {
  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className={`modal modal-${tone} ${wide ? 'modal-wide' : ''}`}>{children}</div>
    </div>
  )
}

export default function NotifModal({ icon = '🔔', title, message, onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card notif-modal" onClick={(e) => e.stopPropagation()}>
        <div className="notif-modal__icon">{icon}</div>
        {title && <h3 className="notif-modal__title">{title}</h3>}
        <p className="notif-modal__msg">{message}</p>
        <button className="btn-primary notif-modal__ok" onClick={onClose}>OK</button>
      </div>
    </div>
  );
}

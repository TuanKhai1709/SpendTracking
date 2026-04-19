export default function MenuItem({ icon, label, onClick }) {
  return (
    <button className="menu-item" onClick={onClick}>
      <span className="menu-item-label">{label}</span>
      <img src={icon} alt="" className="menu-item-icon" />
    </button>
  );
}

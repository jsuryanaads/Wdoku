export default function NavItem({ icon: Icon, label, active = false, onClick }) {
  return (
    <button className={`nav-item ${active ? 'active' : ''}`} onClick={onClick}>
      {Icon && <Icon size={19} />}
      <span>{label}</span>
    </button>
  );
}

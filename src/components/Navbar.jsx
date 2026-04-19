import { NavLink } from 'react-router-dom';
import homeIcon from '../../assets/home.png';
import expenseIcon from '../../assets/expense.png';
import incomeIcon from '../../assets/income.png';
import menuIcon from '../../assets/menu.png';

export default function Navbar() {
  return (
    <nav className="bottom-nav">
      <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} end>
        <img src={homeIcon} alt="" className="nav-icon-img" />
      </NavLink>
      <NavLink to="/expenses" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <img src={expenseIcon} alt="" className="nav-icon-img" />
      </NavLink>
      <NavLink to="/income" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <img src={incomeIcon} alt="" className="nav-icon-img" />
      </NavLink>
      <NavLink to="/settings" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <img src={menuIcon} alt="" className="nav-icon-img" />
      </NavLink>
    </nav>
  );
}

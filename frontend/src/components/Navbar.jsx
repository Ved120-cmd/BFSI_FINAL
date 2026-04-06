import { Link } from 'react-router-dom';

function Navbar() {
  return (
    <nav className="navbar">
      <div className="logo">🛡️ Insurance Fraud Detect</div>
      <div className="nav-links">
        <Link to="/">Home</Link>
        <Link to="/analysis">Analysis</Link>
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/login" className="nav-profile">👤</Link>
      </div>
    </nav>
  );
}

export default Navbar;
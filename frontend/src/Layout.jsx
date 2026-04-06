import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Shield, Search, Activity, Users, TrendingUp, FileText, User, LogOut, ChevronDown, Moon, Sun } from 'lucide-react';

function Layout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isDark, setIsDark] = useState(false);
  
  // --- NEW CODE: Fetch dynamic user state ---
  // Fetch dynamic user state IMMEDIATELY (Lazy Initialization)
  const [userData, setUserData] = useState(() => {
    const storedName = localStorage.getItem('userName') || 'Guest User';
    const storedEmail = localStorage.getItem('userEmail') || 'user@company.com';
    return { name: storedName, email: storedEmail };
  });

  // Only handle Dark Mode in the effect now
  useEffect(() => {
    if (isDark) {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
  }, [isDark]);

  const handleLogout = () => {
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    navigate('/login');
  };

  return (
    <div className="layout-container">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <Shield size={24} color="#3b82f6" />
          <span>ASSUREGUARD</span>
        </div>
        <nav className="sidebar-nav">
          <a onClick={() => navigate('/dashboard')} className={`nav-item ${location.pathname === '/dashboard' ? 'active' : ''}`}><Activity size={18} /> Dashboard</a>
          <a href="#customers" className="nav-item"><Users size={18} /> Customer Data</a>
          <a onClick={() => navigate('/predictions')} className={`nav-item ${location.pathname === '/predictions' ? 'active' : ''}`}><TrendingUp size={18} /> Predictions</a>
          <a href="#reports" className="nav-item"><FileText size={18} /> Reports</a>
          <a onClick={() => navigate('/profile')} className={`nav-item ${location.pathname === '/profile' ? 'active' : ''}`}><User size={18} /> Profile</a>
        </nav>
        <div className="sidebar-bottom">
          <button onClick={handleLogout} className="logout-btn"><LogOut size={18} /> Log Out</button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="main-content">
        <header className="top-header">
          <div className="search-bar">
            <Search size={18} color="var(--text-muted)" />
            <input type="text" placeholder="Search data..." />
          </div>
          
          <div className="header-actions">
            <button className="theme-toggle" onClick={() => setIsDark(!isDark)}>
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            
            <div className="user-profile" onClick={() => navigate('/profile')}>
              {/* Dynamic Avatar based on Name */}
              <img src={`https://ui-avatars.com/api/?name=${userData.name}&background=3b82f6&color=fff`} alt={userData.name} className="avatar" />
              <div className="user-info" style={{ display: 'flex', flexDirection: 'column' }}>
                {/* Dynamic User Name */}
                <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)' }}>{userData.name}</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Insurance Analyst</span>
              </div>
              <ChevronDown size={16} color="var(--text-muted)" />
            </div>
          </div>
        </header>
        
        {children}
      </main>
    </div>
  );
}

export default Layout;
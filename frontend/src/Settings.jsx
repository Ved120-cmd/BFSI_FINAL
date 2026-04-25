import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Shield, Search, Bell, Activity, Users, TrendingUp, 
  FileText, User, Settings as SettingsIcon, LogOut, ChevronDown, 
  Save, Server, Lock 
} from 'lucide-react';
import './Dashboard.css'; // Reusing your main layout styles
import './Settings.css'; // New styles specific to the settings page

function Settings() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [profileData, setProfileData] = useState({
    firstName: 'Sarah',
    lastName: 'Jenkins',
    email: 'sarah.j@company.com',
    role: 'Insurance Analyst'
  });

  const [systemConfig, setSystemConfig] = useState({
    apiUrl: 'http://localhost',
    apiPort: '8080',
    timeout: '30'
  });

  const [notifications, setNotifications] = useState({
    highChurnAlerts: true,
    fraudDetection: true,
    weeklyDigest: false
  });

  const handleSave = (e) => {
    e.preventDefault();
    alert('Settings saved successfully!');
  };

  return (
    <div className="dashboard-container">
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
          <a href="#profile" className="nav-item"><User size={18} /> Profile</a>
          <a onClick={() => navigate('/settings')} className={`nav-item ${location.pathname === '/settings' ? 'active' : ''}`}><SettingsIcon size={18} /> Settings</a>
        </nav>
        <div className="sidebar-bottom">
          <button onClick={() => navigate('/login')} className="logout-btn"><LogOut size={18} /> Log Out</button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="main-content">
        <header className="top-header">
          <div className="search-bar">
            <Search size={18} color="#94a3b8" />
            <input type="text" placeholder="Search settings..." />
          </div>
          <div className="header-actions">
            <div className="notification-icon"><Bell size={20} color="#64748b" /><span className="badge"></span></div>
            <div className="user-profile">
              <img src="https://ui-avatars.com/api/?name=Sarah+Jenkins&background=3b82f6&color=fff" alt="Sarah" className="avatar" />
              <div className="user-info">
                <span className="user-name">Sarah Jenkins</span>
                <span className="user-role">Insurance Analyst</span>
              </div>
              <ChevronDown size={16} color="#64748b" />
            </div>
          </div>
        </header>

        <div className="dashboard-body">
          <div className="page-header">
            <h2>Account Settings</h2>
            <p>Manage your profile, preferences, and system configurations.</p>
          </div>

          <div className="settings-grid">
            {/* PROFILE SETTINGS */}
            <div className="card settings-card">
              <div className="settings-header">
                <User size={20} color="#3b82f6" />
                <h3>Personal Information</h3>
              </div>
              <form className="settings-form">
                <div className="form-row half-cols">
                  <div className="input-group">
                    <label>First Name</label>
                    <input type="text" value={profileData.firstName} onChange={(e) => setProfileData({...profileData, firstName: e.target.value})} />
                  </div>
                  <div className="input-group">
                    <label>Last Name</label>
                    <input type="text" value={profileData.lastName} onChange={(e) => setProfileData({...profileData, lastName: e.target.value})} />
                  </div>
                </div>
                <div className="form-row half-cols">
                  <div className="input-group">
                    <label>Work Email</label>
                    <input type="email" value={profileData.email} onChange={(e) => setProfileData({...profileData, email: e.target.value})} />
                  </div>
                  <div className="input-group">
                    <label>Role / Title</label>
                    <input type="text" value={profileData.role} disabled className="disabled-input" />
                  </div>
                </div>
              </form>
            </div>

            {/* NOTIFICATIONS & SECURITY */}
            <div className="card settings-card">
              <div className="settings-header">
                <Bell size={20} color="#3b82f6" />
                <h3>Notification Preferences</h3>
              </div>
              <div className="toggle-group">
                <div className="toggle-row">
                  <div className="toggle-info">
                    <strong>High Churn Alerts</strong>
                    <span>Get notified instantly when a high-value policy is at risk.</span>
                  </div>
                  <label className="switch">
                    <input type="checkbox" checked={notifications.highChurnAlerts} onChange={() => setNotifications({...notifications, highChurnAlerts: !notifications.highChurnAlerts})} />
                    <span className="slider round"></span>
                  </label>
                </div>
                <div className="toggle-row">
                  <div className="toggle-info">
                    <strong>Fraud Detection Flags</strong>
                    <span>Receive alerts for anomalous claims activity.</span>
                  </div>
                  <label className="switch">
                    <input type="checkbox" checked={notifications.fraudDetection} onChange={() => setNotifications({...notifications, fraudDetection: !notifications.fraudDetection})} />
                    <span className="slider round"></span>
                  </label>
                </div>
              </div>
            </div>

            {/* SYSTEM CONFIGURATION */}
            <div className="card settings-card">
              <div className="settings-header">
                <Server size={20} color="#3b82f6" />
                <h3>System & API Configuration</h3>
              </div>
              <form className="settings-form">
                <div className="form-row three-cols">
                  <div className="input-group" style={{ flex: 2 }}>
                    <label>Backend API URL</label>
                    <input type="text" value={systemConfig.apiUrl} onChange={(e) => setSystemConfig({...systemConfig, apiUrl: e.target.value})} />
                  </div>
                  <div className="input-group">
                    <label>Port</label>
                    <input type="text" value={systemConfig.apiPort} onChange={(e) => setSystemConfig({...systemConfig, apiPort: e.target.value})} />
                  </div>
                  <div className="input-group">
                    <label>Timeout (sec)</label>
                    <input type="number" value={systemConfig.timeout} onChange={(e) => setSystemConfig({...systemConfig, timeout: e.target.value})} />
                  </div>
                </div>
              </form>
            </div>

            {/* SAVE ACTION */}
            <div className="settings-actions">
              <button type="button" className="cancel-btn">Discard Changes</button>
              <button type="button" className="save-btn" onClick={handleSave}>
                <Save size={18} /> Save Settings
              </button>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}

export default Settings;
import React, { useState, useEffect } from 'react';

function Profile() {
  const [userData, setUserData] = useState({ name: 'Loading...', email: '' });

  useEffect(() => {
    // Fetch the logged-in user's data from localStorage when the page loads
    const storedName = localStorage.getItem('userName') || 'Guest User';
    const storedEmail = localStorage.getItem('userEmail') || 'user@company.com';
    setUserData({ name: storedName, email: storedEmail });
  }, []);

  return (
    <div className="page-body">
      <h2 className="page-title">My Profile</h2>
      
      <div className="card" style={{ maxWidth: '600px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '32px', paddingBottom: '24px', borderBottom: '1px solid var(--border-color)' }}>
          {/* Dynamic Avatar */}
          <img 
            src={`https://ui-avatars.com/api/?name=${userData.name}&size=100&background=3b82f6&color=fff`} 
            alt={userData.name} 
            style={{ borderRadius: '50%' }} 
          />
          <div>
            {/* Dynamic Name Heading */}
            <h2 style={{ fontSize: '1.5rem', color: 'var(--text-main)', marginBottom: '4px' }}>{userData.name}</h2>
            <p style={{ color: 'var(--text-muted)' }}>Insurance Analyst</p>
            <span style={{ display: 'inline-block', marginTop: '10px', padding: '4px 12px', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 600 }}>Active Employee</span>
          </div>
        </div>

        <form>
          <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
            <div className="input-group" style={{ flex: 1, marginBottom: 0 }}>
              <label>Display Name</label>
              {/* Dynamic Input Value */}
              <input type="text" defaultValue={userData.name} readOnly style={{ opacity: 0.8 }} />
            </div>
          </div>
          <div className="input-group">
            <label>Work Email Address</label>
            {/* Dynamic Email Value */}
            <input type="email" defaultValue={userData.email} readOnly style={{ opacity: 0.8 }} />
          </div>
          <div className="input-group">
            <label>Department</label>
            <input type="text" defaultValue="Risk & Underwriting" disabled style={{ opacity: 0.7 }} />
          </div>
        </form>
      </div>
    </div>
  );
}

export default Profile;
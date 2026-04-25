import React from 'react';
import './Dashboard.css'; // Keep your specific dashboard chart CSS here

function Dashboard() {
  return (
    <div className="page-body">
      <h2 className="page-title">Customer Overview</h2>

      {/* KPI CARDS */}
      <div className="kpi-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '32px' }}>
        <div className="card">
          <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600, marginBottom: '10px' }}>Total Analyses</div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-main)' }}>1,245</div>
        </div>
        <div className="card">
          <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600, marginBottom: '10px' }}>Churn Risk <span style={{ background: '#fee2e2', color: '#b91c1c', padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem', marginLeft: '10px' }}>High</span></div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-main)' }}>18%</div>
        </div>
        <div className="card">
          <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600, marginBottom: '10px' }}>Fraud Flags <span style={{ background: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem', marginLeft: '10px' }}>Low</span></div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-main)' }}>5%</div>
        </div>
      </div>

      {/* RECENT ANALYSES */}
      <div className="card">
        <h3 style={{ marginBottom: '20px', color: 'var(--text-main)' }}>Recent Customer Analyses</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', border: '1px solid var(--border-color)', borderRadius: '8px', background: 'var(--bg-main)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <img src="https://ui-avatars.com/api/?name=Mark+Adams" alt="MA" style={{ borderRadius: '50%', width: '40px' }} />
              <strong style={{ color: 'var(--text-main)' }}>Mark Adams</strong>
            </div>
            <div style={{ display: 'flex', gap: '20px' }}>
              <div style={{ textAlign: 'center' }}><div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Churn</div><div style={{ color: '#ef4444', fontWeight: 'bold' }}>74%</div></div>
              <div style={{ textAlign: 'center' }}><div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Fraud</div><div style={{ color: '#22c55e', fontWeight: 'bold' }}>8%</div></div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', border: '1px solid var(--border-color)', borderRadius: '8px', background: 'var(--bg-main)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <img src="https://ui-avatars.com/api/?name=John+Smith" alt="JS" style={{ borderRadius: '50%', width: '40px' }} />
              <strong style={{ color: 'var(--text-main)' }}>John Smith</strong>
            </div>
            <div style={{ display: 'flex', gap: '20px' }}>
              <div style={{ textAlign: 'center' }}><div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Churn</div><div style={{ color: '#22c55e', fontWeight: 'bold' }}>22%</div></div>
              <div style={{ textAlign: 'center' }}><div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Fraud</div><div style={{ color: '#22c55e', fontWeight: 'bold' }}>4%</div></div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Dashboard;

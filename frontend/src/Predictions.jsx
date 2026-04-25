import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Predictions.css';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const RISK_COLOR  = { High: '#ef4444', Medium: '#f59e0b', Low: '#22c55e' };
const ALERT_COLOR = { HIGH: '#ef4444', MEDIUM: '#f59e0b', LOW: '#22c55e' };
const LOYAL_COLOR = { Champion: '#22c55e', Engaged: '#f59e0b', 'At Risk': '#ef4444' };

function GaugeBar({ value, color }) {
  return (
    <div style={{ background: '#e5e7eb', borderRadius: 6, height: 8, margin: '4px 0 14px' }}>
      <div style={{
        width: `${Math.min(value ?? 0, 100)}%`, background: color,
        height: '100%', borderRadius: 6, transition: 'width 0.6s ease',
      }} />
    </div>
  );
}

function ResultRow({ label, badge, value, color }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{label}</span>
        <span style={{ fontWeight: 700, color }}>
          {badge && (
            <span style={{
              marginRight: 6, background: color + '20', color,
              padding: '1px 7px', borderRadius: 4, fontSize: '0.75rem', fontWeight: 600,
            }}>{badge}</span>
          )}
          {value !== null ? `${value}%` : '—'}
        </span>
      </div>
      <GaugeBar value={value} color={color} />
    </div>
  );
}

export default function Predictions() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    customer_name: '', policy_number: '', policy_type: 'Auto',
    tenure_years: '', annual_premium: '', claim_count: '',
    satisfaction_score: '', age: '', gender: '', region: '',
  });
  const [loading,  setLoading]  = useState(false);
  const [results,  setResults]  = useState(null);
  const [error,    setError]    = useState(null);

  const handleChange = e =>
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true); setError(null); setResults(null);
    try {
      const payload = {
        ...form,
        age:                parseFloat(form.age)                || 35,
        tenure_years:       parseFloat(form.tenure_years)       || 0,
        annual_premium:     parseFloat(form.annual_premium)     || 0,
        claim_count:        parseFloat(form.claim_count)        || 0,
        satisfaction_score: parseFloat(form.satisfaction_score) || 5,
      };
      const res = await fetch(`${API_BASE}/api/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data = await res.json();
      // Store both form values + prediction results together
      setResults({ ...payload, ...data });
    } catch (err) {
      setError(err.message || 'Failed to connect to prediction server.');
    } finally {
      setLoading(false);
    }
  };

  // Navigate to /reports, passing all data via location state
  const handleGenerateReport = () => {
    navigate('/reports', { state: { prefill: results } });
  };

  return (
    <div className="page-body">
      <h2 className="page-title">Run Prediction Model</h2>
      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>

        {/* ── FORM ── */}
        <div className="card" style={{ flex: 2, minWidth: 320 }}>
          <h3 style={{ marginBottom: 20, color: 'var(--text-main)' }}>Input Customer Data</h3>
          <form onSubmit={handleSubmit}>

            <div style={{ display: 'flex', gap: 16 }}>
              <div className="input-group" style={{ flex: 1 }}>
                <label>Customer Name</label>
                <input type="text" name="customer_name" required
                  placeholder="Jane Doe" value={form.customer_name} onChange={handleChange} />
              </div>
              <div className="input-group" style={{ flex: 1 }}>
                <label>Policy Number</label>
                <input type="text" name="policy_number" required
                  placeholder="AG-1234" value={form.policy_number} onChange={handleChange} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 16 }}>
              <div className="input-group" style={{ flex: 1 }}>
                <label>Policy Type</label>
                <select name="policy_type" value={form.policy_type} onChange={handleChange}>
                  <option>Auto</option><option>Home</option><option>Life</option>
                </select>
              </div>
              <div className="input-group" style={{ flex: 1 }}>
                <label>Gender</label>
                <select name="gender" value={form.gender} onChange={handleChange}>
                  <option value="">Unknown</option>
                  <option>Male</option><option>Female</option><option>Other</option>
                </select>
              </div>
              <div className="input-group" style={{ flex: 1 }}>
                <label>Region</label>
                <select name="region" value={form.region} onChange={handleChange}>
                  <option value="">Unknown</option>
                  <option>North</option><option>South</option>
                  <option>East</option><option>West</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 16 }}>
              <div className="input-group" style={{ flex: 1 }}>
                <label>Age</label>
                <input type="number" name="age" min="18" max="100"
                  placeholder="35" value={form.age} onChange={handleChange} />
              </div>
              <div className="input-group" style={{ flex: 1 }}>
                <label>Tenure (Years)</label>
                <input type="number" name="tenure_years" required min="0" step="0.5"
                  placeholder="5" value={form.tenure_years} onChange={handleChange} />
              </div>
              <div className="input-group" style={{ flex: 1 }}>
                <label>Annual Premium (₹)</label>
                <input type="number" name="annual_premium" required min="0"
                  placeholder="200" value={form.annual_premium} onChange={handleChange} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 16 }}>
              <div className="input-group" style={{ flex: 1 }}>
                <label>Claim Count</label>
                <input type="number" name="claim_count" min="0" max="10"
                  placeholder="2" value={form.claim_count} onChange={handleChange} />
              </div>
              <div className="input-group" style={{ flex: 1 }}>
                <label>Satisfaction (1–10)</label>
                <input type="number" name="satisfaction_score" min="1" max="10" step="0.5"
                  placeholder="5" value={form.satisfaction_score} onChange={handleChange} />
              </div>
            </div>

            {error && (
              <p style={{ color: '#ef4444', fontSize: '0.85rem', marginTop: 8 }}>⚠ {error}</p>
            )}

            <button type="submit" className="primary-btn"
              style={{ marginTop: 10, width: '100%' }} disabled={loading}>
              {loading ? 'Analyzing…' : 'Analyze Data'}
            </button>
          </form>
        </div>

        {/* ── RESULTS ── */}
        <div className="card" style={{
          flex: 1, minWidth: 260,
          display: 'flex', flexDirection: 'column', justifyContent: 'center',
        }}>
          {!results ? (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>
              Submit customer data to view AI predictions.
            </p>
          ) : (
            <>
              <h3 style={{ color: 'var(--text-main)', marginBottom: 6, textAlign: 'center' }}>
                Analysis Complete
              </h3>
              <p style={{
                textAlign: 'center', fontSize: '0.82rem',
                color: 'var(--text-muted)', marginBottom: 20,
              }}>
                {results.customer_name} · {results.policy_number}
              </p>

              <ResultRow
                label="Churn Risk"
                badge={results.churn_risk}
                value={results.churn_prob}
                color={RISK_COLOR[results.churn_risk] ?? '#6b7280'}
              />
              <ResultRow
                label="Loyalty Score"
                badge={results.loyalty_tier}
                value={results.loyalty_prob}
                color={LOYAL_COLOR[results.loyalty_tier] ?? '#6b7280'}
              />
              <ResultRow
                label="Fraud Probability"
                badge={results.fraud_alert}
                value={results.fraud_prob}
                color={ALERT_COLOR[results.fraud_alert] ?? '#6b7280'}
              />

              {/* Generate Report button */}
              <button
                onClick={handleGenerateReport}
                style={{
                  marginTop: 8,
                  width: '100%',
                  padding: '11px',
                  background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  transition: 'opacity 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
              >
                📄 Generate Report
              </button>
            </>
          )}
        </div>

      </div>
    </div>
  );
}
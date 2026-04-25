import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/* ── Simple markdown → JSX renderer ─────────────────────────────────────── */
function renderMarkdown(text) {
  const lines = text.split('\n');
  const els = [];
  let key = 0;

  for (const line of lines) {
    if (line.startsWith('## ')) {
      els.push(
        <h3 key={key++} style={{
          fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)',
          marginTop: 24, marginBottom: 8, paddingBottom: 4,
          borderBottom: '1px solid var(--border-color)',
        }}>
          {line.slice(3)}
        </h3>
      );
    } else if (line.startsWith('# ')) {
      els.push(
        <h2 key={key++} style={{
          fontSize: '1.15rem', fontWeight: 700,
          color: 'var(--text-main)', marginTop: 20, marginBottom: 10,
        }}>
          {line.slice(2)}
        </h2>
      );
    } else if (/^\d+\./.test(line)) {
      els.push(
        <p key={key++} style={{
          margin: '4px 0 4px 18px', color: 'var(--text-main)',
          fontSize: '0.9rem', lineHeight: 1.75,
        }}>{line}</p>
      );
    } else if (/^[-•]/.test(line)) {
      els.push(
        <p key={key++} style={{
          margin: '4px 0 4px 18px', color: 'var(--text-main)',
          fontSize: '0.9rem', lineHeight: 1.75,
        }}>
          {'• ' + line.replace(/^[-•]\s*/, '')}
        </p>
      );
    } else if (line.includes('Overall Risk')) {
      const risk = line.replace(/\*\*/g, '').replace('Overall Risk:', '').trim();
      const riskColor = { CRITICAL:'#dc2626', HIGH:'#ef4444', MEDIUM:'#f59e0b', LOW:'#22c55e' }[risk] ?? '#6b7280';
      els.push(
        <div key={key++} style={{
          marginTop: 20, padding: '12px 20px',
          background: riskColor + '15', border: `2px solid ${riskColor}`,
          borderRadius: 10, display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            Overall Risk
          </span>
          <span style={{ fontSize: '1.1rem', fontWeight: 800, color: riskColor, letterSpacing: 1 }}>
            {risk}
          </span>
        </div>
      );
    } else if (line.trim() === '') {
      els.push(<div key={key++} style={{ height: 6 }} />);
    } else {
      const parts = line.split(/(\*\*[^*]+\*\*)/g);
      els.push(
        <p key={key++} style={{
          margin: '3px 0', color: 'var(--text-main)',
          fontSize: '0.9rem', lineHeight: 1.75,
        }}>
          {parts.map((p, pi) =>
            p.startsWith('**') && p.endsWith('**')
              ? <strong key={pi}>{p.slice(2, -2)}</strong>
              : p
          )}
        </p>
      );
    }
  }
  return els;
}

const BADGE_STYLE = {
  High: '#ef4444', Medium: '#f59e0b', Low: '#22c55e',
  HIGH: '#ef4444', MEDIUM: '#f59e0b', LOW: '#22c55e',
  Champion: '#22c55e', Engaged: '#f59e0b', 'At Risk': '#ef4444',
};

function Badge({ label }) {
  const color = BADGE_STYLE[label] ?? '#6b7280';
  return (
    <span style={{
      background: color + '20', color, padding: '2px 10px',
      borderRadius: 5, fontSize: '0.75rem', fontWeight: 700,
    }}>{label}</span>
  );
}

const inputStyle = {
  width: '100%', padding: '9px 12px', borderRadius: 8,
  border: '1px solid var(--border-color)',
  background: 'var(--bg-main)', color: 'var(--text-main)',
  fontSize: '0.9rem', boxSizing: 'border-box',
};
const labelStyle = {
  fontSize: '0.8rem', fontWeight: 600,
  color: 'var(--text-muted)', marginBottom: 4, display: 'block',
};

/* ── Main component ─────────────────────────────────────────────────────── */
export default function Reports() {
  const location = useLocation();
  const prefill  = location.state?.prefill ?? null;  // data passed from Predictions page

  const [form, setForm] = useState({
    customer_name: '', policy_number: '', policy_type: 'Auto',
    age: '', gender: '', region: '', tenure_years: '',
    annual_premium: '', claim_count: '', satisfaction_score: '',
  });

  // prediction scores (may come pre-filled from Predictions page)
  const [scores,  setScores]  = useState(null);
  const [step,    setStep]    = useState('form'); // form|predicting|reporting|done|error
  const [report,  setReport]  = useState('');
  const [error,   setError]   = useState('');

  /* ── On mount: if came from Predictions page, auto-fill + auto-generate ── */
  useEffect(() => {
    if (prefill) {
      setForm({
        customer_name:     prefill.customer_name     ?? '',
        policy_number:     prefill.policy_number     ?? '',
        policy_type:       prefill.policy_type       ?? 'Auto',
        age:               prefill.age               ?? '',
        gender:            prefill.gender            ?? '',
        region:            prefill.region            ?? '',
        tenure_years:      prefill.tenure_years      ?? '',
        annual_premium:    prefill.annual_premium     ?? '',
        claim_count:       prefill.claim_count        ?? '',
        satisfaction_score:prefill.satisfaction_score ?? '',
      });

      // If prediction scores already available (came from Predictions page)
      if (prefill.churn_risk) {
        const s = {
          churn_risk:   prefill.churn_risk,
          churn_prob:   prefill.churn_prob,
          loyalty_tier: prefill.loyalty_tier,
          loyalty_prob: prefill.loyalty_prob,
          fraud_alert:  prefill.fraud_alert,
          fraud_prob:   prefill.fraud_prob,
        };
        setScores(s);
        // Auto-generate report immediately
        generateReport(prefill, s);
      }
    }
  }, []);

  const handleChange = e =>
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  /* Run predictions first, then generate report */
  const runAndGenerate = async () => {
    setStep('predicting'); setError('');
    try {
      const payload = {
        ...form,
        age:                parseFloat(form.age)                || 35,
        tenure_years:       parseFloat(form.tenure_years)       || 0,
        annual_premium:     parseFloat(form.annual_premium)     || 0,
        claim_count:        parseFloat(form.claim_count)        || 0,
        satisfaction_score: parseFloat(form.satisfaction_score) || 5,
      };
      const res  = await fetch(`${API_BASE}/api/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`Prediction error: ${res.status}`);
      const pred = await res.json();
      setScores(pred);
      await generateReport(payload, pred);
    } catch (e) {
      setError(e.message); setStep('error');
    }
  };

  /* Call /api/report with customer data + scores */
  const generateReport = async (customerData, predScores) => {
    setStep('reporting');
    try {
      const payload = {
        ...customerData,
        age:                parseFloat(customerData.age)                || 35,
        tenure_years:       parseFloat(customerData.tenure_years)       || 0,
        annual_premium:     parseFloat(customerData.annual_premium)     || 0,
        claim_count:        parseFloat(customerData.claim_count)        || 0,
        satisfaction_score: parseFloat(customerData.satisfaction_score) || 5,
        ...predScores,
      };
      const res = await fetch(`${API_BASE}/api/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`Report error: ${res.status}`);
      const data = await res.json();
      setReport(data.report);
      setStep('done');
    } catch (e) {
      setError(e.message); setStep('error');
    }
  };

  const downloadReport = () => {
    const blob = new Blob([
      `ASSUREGUARD CUSTOMER REPORT\n`,
      `Customer : ${form.customer_name}\n`,
      `Policy   : ${form.policy_number}\n`,
      `\n${'─'.repeat(60)}\n\n`,
      report,
    ], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a   = document.createElement('a');
    a.href     = url;
    a.download = `report_${form.policy_number || 'customer'}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const busy = step === 'predicting' || step === 'reporting';

  return (
    <div className="page-body">
      <h2 className="page-title">AI Analysis Report</h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: 28, fontSize: '0.9rem' }}>
        Customer-level AI report explaining churn risk, loyalty, and fraud probability.
      </p>

      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'flex-start' }}>

        {/* ── LEFT: FORM ── */}
        <div className="card" style={{ flex: '0 0 400px', minWidth: 300 }}>
          <h3 style={{ marginBottom: 18, color: 'var(--text-main)', fontSize: '1rem' }}>
            Customer Details
          </h3>

          <div style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Customer Name</label>
              <input style={inputStyle} name="customer_name" placeholder="Priya Sharma"
                value={form.customer_name} onChange={handleChange} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Policy Number</label>
              <input style={inputStyle} name="policy_number" placeholder="MH-4521"
                value={form.policy_number} onChange={handleChange} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Policy Type</label>
              <select style={inputStyle} name="policy_type" value={form.policy_type} onChange={handleChange}>
                <option>Auto</option><option>Home</option><option>Life</option>
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Gender</label>
              <select style={inputStyle} name="gender" value={form.gender} onChange={handleChange}>
                <option value="">Unknown</option>
                <option>Male</option><option>Female</option><option>Other</option>
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Region</label>
              <select style={inputStyle} name="region" value={form.region} onChange={handleChange}>
                <option value="">Unknown</option>
                <option>North</option><option>South</option>
                <option>East</option><option>West</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Age</label>
              <input style={inputStyle} type="number" name="age"
                placeholder="28" value={form.age} onChange={handleChange} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Tenure (Years)</label>
              <input style={inputStyle} type="number" name="tenure_years"
                placeholder="3" value={form.tenure_years} onChange={handleChange} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Annual Premium (₹)</label>
              <input style={inputStyle} type="number" name="annual_premium"
                placeholder="186" value={form.annual_premium} onChange={handleChange} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Claim Count</label>
              <input style={inputStyle} type="number" name="claim_count"
                placeholder="2" value={form.claim_count} onChange={handleChange} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Satisfaction (1–10)</label>
              <input style={inputStyle} type="number" name="satisfaction_score"
                min="1" max="10" placeholder="5"
                value={form.satisfaction_score} onChange={handleChange} />
            </div>
          </div>

          <button className="primary-btn" style={{ width: '100%' }}
            disabled={busy} onClick={runAndGenerate}>
            {step === 'predicting' ? '⏳ Running Models…'
              : step === 'reporting' ? '✍️ Writing Report…'
              : '📄 Generate Report'}
          </button>

          {/* Score badges shown after prediction */}
          {scores && (
            <div style={{
              marginTop: 18, padding: 14,
              background: 'var(--bg-main)', borderRadius: 10,
              border: '1px solid var(--border-color)',
            }}>
              <p style={{
                fontSize: '0.7rem', fontWeight: 700, letterSpacing: 1,
                color: 'var(--text-muted)', marginBottom: 10,
              }}>MODEL SCORES</p>
              {[
                ['Churn Risk',  scores.churn_risk,   scores.churn_prob],
                ['Loyalty',     scores.loyalty_tier, scores.loyalty_prob],
                ['Fraud Alert', scores.fraud_alert,  scores.fraud_prob],
              ].map(([label, badge, prob]) => (
                <div key={label} style={{
                  display: 'flex', justifyContent: 'space-between',
                  alignItems: 'center', marginBottom: 8,
                }}>
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{label}</span>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <Badge label={badge} />
                    <span style={{ fontSize: '0.82rem', fontWeight: 700,
                      color: 'var(--text-main)', minWidth: 40, textAlign: 'right' }}>
                      {prob}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── RIGHT: REPORT ── */}
        <div className="card" style={{ flex: 1, minWidth: 320 }}>

          {step === 'form' && (
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <div style={{ fontSize: '3rem', marginBottom: 16 }}>📊</div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                Fill in customer details and click<br />
                <strong style={{ color: 'var(--text-main)' }}>Generate Report</strong> to get a full AI analysis.
              </p>
            </div>
          )}

          {busy && (
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <div style={{
                width: 44, height: 44,
                border: '4px solid var(--border-color)',
                borderTopColor: '#6366f1', borderRadius: '50%',
                animation: 'spin 0.9s linear infinite',
                margin: '0 auto 20px',
              }} />
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                {step === 'predicting' ? 'Running prediction models…' : 'Claude is writing your report…'}
              </p>
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          )}

          {step === 'error' && (
            <div style={{
              padding: 20, background: '#fee2e2',
              borderRadius: 10, border: '1px solid #fca5a5',
            }}>
              <p style={{ color: '#b91c1c', fontWeight: 600, marginBottom: 6 }}>⚠ Error</p>
              <p style={{ color: '#7f1d1d', fontSize: '0.85rem' }}>{error}</p>
            </div>
          )}

          {step === 'done' && report && (
            <>
              <div style={{
                display: 'flex', justifyContent: 'space-between',
                alignItems: 'flex-start', marginBottom: 20,
              }}>
                <div>
                  <h3 style={{ color: 'var(--text-main)', marginBottom: 4, fontSize: '1rem' }}>
                    {form.customer_name} · {form.policy_number}
                  </h3>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    AI-generated · Powered by Claude
                  </p>
                </div>
                <button onClick={downloadReport} style={{
                  background: 'var(--bg-main)', border: '1px solid var(--border-color)',
                  borderRadius: 8, padding: '6px 14px', cursor: 'pointer',
                  fontSize: '0.8rem', color: 'var(--text-main)',
                }}>
                  ⬇ Download
                </button>
              </div>

              <div style={{
                background: 'var(--bg-main)', borderRadius: 10,
                padding: '20px 22px', border: '1px solid var(--border-color)',
                maxHeight: 580, overflowY: 'auto',
              }}>
                {renderMarkdown(report)}
              </div>

              <button onClick={() => generateReport(form, scores)} style={{
                marginTop: 14, width: '100%', padding: '9px',
                background: 'transparent', border: '1px solid var(--border-color)',
                borderRadius: 8, cursor: 'pointer',
                fontSize: '0.85rem', color: 'var(--text-muted)',
              }}>
                ↺ Regenerate Report
              </button>
            </>
          )}

        </div>
      </div>
    </div>
  );
}
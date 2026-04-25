import React, { useEffect, useState } from 'react';
import './Dashboard.css';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// ── 10 Hardcoded sample customers ─────────────────────────────────────────
const SAMPLE_CUSTOMERS = [
  { name: 'Priya Sharma',   policy: 'MH-4521', policy_type: 'Auto',  age: 28, gender: 'Female', region: 'West',  tenure_years: 1.5, annual_premium: 186,  claim_count: 3, satisfaction_score: 3 },
  { name: 'Rahul Mehta',    policy: 'DL-1102', policy_type: 'Home',  age: 45, gender: 'Male',   region: 'North', tenure_years: 8,   annual_premium: 420,  claim_count: 1, satisfaction_score: 8 },
  { name: 'Anita Desai',    policy: 'KA-3378', policy_type: 'Life',  age: 33, gender: 'Female', region: 'South', tenure_years: 4,   annual_premium: 310,  claim_count: 0, satisfaction_score: 9 },
  { name: 'Vikram Nair',    policy: 'TN-8801', policy_type: 'Auto',  age: 52, gender: 'Male',   region: 'South', tenure_years: 2,   annual_premium: 95,   claim_count: 4, satisfaction_score: 2 },
  { name: 'Sneha Kulkarni', policy: 'MH-6643', policy_type: 'Home',  age: 38, gender: 'Female', region: 'West',  tenure_years: 6,   annual_premium: 390,  claim_count: 1, satisfaction_score: 7 },
  { name: 'Arjun Patel',    policy: 'GJ-2290', policy_type: 'Auto',  age: 24, gender: 'Male',   region: 'West',  tenure_years: 0.5, annual_premium: 120,  claim_count: 2, satisfaction_score: 4 },
  { name: 'Meena Iyer',     policy: 'KL-5512', policy_type: 'Life',  age: 61, gender: 'Female', region: 'South', tenure_years: 10,  annual_premium: 498,  claim_count: 0, satisfaction_score: 10 },
  { name: 'Rohan Gupta',    policy: 'UP-9934', policy_type: 'Auto',  age: 29, gender: 'Male',   region: 'North', tenure_years: 1,   annual_premium: 150,  claim_count: 3, satisfaction_score: 3 },
  { name: 'Divya Joshi',    policy: 'RJ-4417', policy_type: 'Home',  age: 41, gender: 'Female', region: 'North', tenure_years: 5,   annual_premium: 275,  claim_count: 2, satisfaction_score: 6 },
  { name: 'Karan Singh',    policy: 'PB-7723', policy_type: 'Life',  age: 36, gender: 'Male',   region: 'North', tenure_years: 3,   annual_premium: 220,  claim_count: 1, satisfaction_score: 7 },
];

const CHURN_COLOR  = (pct) => pct >= 60 ? '#ef4444' : pct >= 40 ? '#f59e0b' : '#22c55e';
const LOYAL_COLOR  = { Champion: '#22c55e', Engaged: '#f59e0b', 'At Risk': '#ef4444' };
const FRAUD_COLOR  = { HIGH: '#ef4444', MEDIUM: '#f59e0b', LOW: '#22c55e' };

function KpiCard({ label, value, badge, badgeStyle, sub }) {
  return (
    <div className="card">
      <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600, marginBottom: 10 }}>
        {label}
        {badge && (
          <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: '0.7rem', marginLeft: 10, ...badgeStyle }}>
            {badge}
          </span>
        )}
      </div>
      <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-main)' }}>{value}</div>
      {sub && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

function StatusDot({ color }) {
  return <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: color, marginRight: 6 }} />;
}

export default function Dashboard() {
  const [customers, setCustomers] = useState([]);   // enriched with predictions
  const [loading,   setLoading]   = useState(true);
  const [progress,  setProgress]  = useState(0);
  const [error,     setError]     = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function runAll() {
      const results = [];
      for (let i = 0; i < SAMPLE_CUSTOMERS.length; i++) {
        const c = SAMPLE_CUSTOMERS[i];
        try {
          const res = await fetch(`${API_BASE}/api/predict`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              customer_name:     c.name,
              policy_number:     c.policy,
              policy_type:       c.policy_type,
              age:               c.age,
              gender:            c.gender,
              region:            c.region,
              tenure_years:      c.tenure_years,
              annual_premium:    c.annual_premium,
              claim_count:       c.claim_count,
              satisfaction_score:c.satisfaction_score,
            }),
          });
          const pred = res.ok ? await res.json() : {};
          results.push({ ...c, ...pred });
        } catch {
          results.push({ ...c });
        }
        if (!cancelled) setProgress(i + 1);
      }
      if (!cancelled) {
        setCustomers(results);
        setLoading(false);
      }
    }

    runAll().catch(e => { setError(e.message); setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  // ── Derived KPIs from real prediction results ──────────────────────────
  const totalAnalyses = customers.length;
  const avgChurn      = customers.length
    ? Math.round(customers.reduce((s, c) => s + (c.churn_prob ?? 0), 0) / customers.length)
    : 0;
  const avgFraud      = customers.length
    ? Math.round(customers.reduce((s, c) => s + (c.fraud_prob ?? 0), 0) / customers.length)
    : 0;
  const highRisk      = customers.filter(c => c.churn_risk === 'High').length;
  const champions     = customers.filter(c => c.loyalty_tier === 'Champion').length;
  const fraudFlags    = customers.filter(c => c.fraud_alert === 'HIGH' || c.fraud_alert === 'MEDIUM').length;

  if (error) return (
    <div className="page-body">
      <h2 className="page-title">Customer Overview</h2>
      <p style={{ color: '#ef4444' }}>⚠ {error}</p>
    </div>
  );

  return (
    <div className="page-body">
      <h2 className="page-title">Customer Overview</h2>

      {/* Loading progress bar */}
      {loading && (
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Running predictions… ({progress}/{SAMPLE_CUSTOMERS.length})
            </span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              {Math.round((progress / SAMPLE_CUSTOMERS.length) * 100)}%
            </span>
          </div>
          <div style={{ background: 'var(--border-color)', borderRadius: 6, height: 6 }}>
            <div style={{
              width: `${(progress / SAMPLE_CUSTOMERS.length) * 100}%`,
              background: 'linear-gradient(90deg, #6366f1, #4f46e5)',
              height: '100%', borderRadius: 6, transition: 'width 0.4s ease',
            }} />
          </div>
        </div>
      )}

      {/* ── KPI CARDS ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 28 }}>
        <KpiCard
          label="Total Analyses"
          value={totalAnalyses}
          sub="Sample customers analysed"
        />
        <KpiCard
          label="Avg Churn Risk"
          value={`${avgChurn}%`}
          badge={avgChurn >= 60 ? 'High' : avgChurn >= 40 ? 'Medium' : 'Low'}
          badgeStyle={avgChurn >= 60 ? { background: '#fee2e2', color: '#b91c1c' } : avgChurn >= 40 ? { background: '#fef3c7', color: '#92400e' } : { background: '#dcfce7', color: '#15803d' }}
          sub={`${highRisk} customers at high risk`}
        />
        <KpiCard
          label="Avg Fraud Probability"
          value={`${avgFraud}%`}
          badge={fraudFlags >= 5 ? 'High' : fraudFlags >= 2 ? 'Medium' : 'Low'}
          badgeStyle={fraudFlags >= 5 ? { background: '#fee2e2', color: '#b91c1c' } : fraudFlags >= 2 ? { background: '#fef3c7', color: '#92400e' } : { background: '#dcfce7', color: '#15803d' }}
          sub={`${fraudFlags} flagged for review`}
        />
      </div>

      {/* ── LOYALTY SUMMARY PILLS ── */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 28, flexWrap: 'wrap' }}>
        {[
          { label: '🏆 Champions',  count: champions,                                      color: '#22c55e' },
          { label: '✅ Engaged',    count: customers.filter(c => c.loyalty_tier === 'Engaged').length, color: '#f59e0b' },
          { label: '⚠ At Risk',    count: customers.filter(c => c.loyalty_tier === 'At Risk').length, color: '#ef4444' },
        ].map(({ label, count, color }) => (
          <div key={label} style={{
            background: 'var(--bg-main)', border: `1px solid ${color}40`,
            borderRadius: 8, padding: '8px 18px', fontSize: '0.85rem',
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <StatusDot color={color} />
            {label}: <strong style={{ color }}>{count}</strong>
          </div>
        ))}
      </div>

      {/* ── CUSTOMER TABLE ── */}
      <div className="card" style={{ overflowX: 'auto' }}>
        <h3 style={{ marginBottom: 20, color: 'var(--text-main)' }}>
          Customer Risk Analysis
          {loading && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: 10, fontWeight: 400 }}>Loading…</span>}
        </h3>

        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
              {['Customer', 'Policy', 'Type', 'Age', 'Tenure', 'Premium', 'Claims', 'Sat.', 'Churn Risk', 'Loyalty', 'Fraud'].map(h => (
                <th key={h} style={{
                  padding: '10px 12px', textAlign: 'left',
                  color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.78rem',
                  whiteSpace: 'nowrap',
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(loading ? SAMPLE_CUSTOMERS : customers).map((row, i) => (
              <tr key={i} style={{
                borderBottom: '1px solid var(--border-color)',
                transition: 'background 0.15s',
              }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-main)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                {/* Avatar + Name */}
                <td style={{ padding: '12px 12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <img
                      src={`https://ui-avatars.com/api/?name=${encodeURIComponent(row.name)}&size=32&rounded=true&background=6366f1&color=fff`}
                      alt={row.name}
                      style={{ width: 32, height: 32, borderRadius: '50%' }}
                    />
                    <span style={{ fontWeight: 600, color: 'var(--text-main)', whiteSpace: 'nowrap' }}>{row.name}</span>
                  </div>
                </td>
                <td style={{ padding: '12px 12px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{row.policy}</td>
                <td style={{ padding: '12px 12px', color: 'var(--text-muted)' }}>{row.policy_type}</td>
                <td style={{ padding: '12px 12px', color: 'var(--text-main)' }}>{row.age}</td>
                <td style={{ padding: '12px 12px', color: 'var(--text-main)' }}>{row.tenure_years}y</td>
                <td style={{ padding: '12px 12px', color: 'var(--text-main)', whiteSpace: 'nowrap' }}>₹{row.annual_premium}</td>
                <td style={{ padding: '12px 12px', color: 'var(--text-main)' }}>{row.claim_count}</td>
                <td style={{ padding: '12px 12px', color: 'var(--text-main)' }}>{row.satisfaction_score}/10</td>

                {/* Churn Risk */}
                <td style={{ padding: '12px 12px' }}>
                  {loading || !row.churn_risk ? (
                    <div style={{ width: 60, height: 10, background: 'var(--border-color)', borderRadius: 4 }} />
                  ) : (
                    <div>
                      <span style={{
                        background: CHURN_COLOR(row.churn_prob ?? 0) + '20',
                        color: CHURN_COLOR(row.churn_prob ?? 0),
                        padding: '2px 8px', borderRadius: 4,
                        fontSize: '0.75rem', fontWeight: 700,
                      }}>{row.churn_risk}</span>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>{row.churn_prob}%</div>
                    </div>
                  )}
                </td>

                {/* Loyalty */}
                <td style={{ padding: '12px 12px' }}>
                  {loading || !row.loyalty_tier ? (
                    <div style={{ width: 60, height: 10, background: 'var(--border-color)', borderRadius: 4 }} />
                  ) : (
                    <div>
                      <span style={{
                        background: (LOYAL_COLOR[row.loyalty_tier] ?? '#6b7280') + '20',
                        color: LOYAL_COLOR[row.loyalty_tier] ?? '#6b7280',
                        padding: '2px 8px', borderRadius: 4,
                        fontSize: '0.75rem', fontWeight: 700,
                      }}>{row.loyalty_tier}</span>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>{row.loyalty_prob}%</div>
                    </div>
                  )}
                </td>

                {/* Fraud */}
                <td style={{ padding: '12px 12px' }}>
                  {loading || !row.fraud_alert ? (
                    <div style={{ width: 60, height: 10, background: 'var(--border-color)', borderRadius: 4 }} />
                  ) : (
                    <div>
                      <span style={{
                        background: (FRAUD_COLOR[row.fraud_alert] ?? '#6b7280') + '20',
                        color: FRAUD_COLOR[row.fraud_alert] ?? '#6b7280',
                        padding: '2px 8px', borderRadius: 4,
                        fontSize: '0.75rem', fontWeight: 700,
                      }}>{row.fraud_alert}</span>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>{row.fraud_prob}%</div>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
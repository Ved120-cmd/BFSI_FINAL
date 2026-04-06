import React, { useState } from 'react';

function Predictions() {
  const [isPredicting, setIsPredicting] = useState(false);
  const [results, setResults] = useState(null);

  const runPrediction = (e) => {
    e.preventDefault();
    setIsPredicting(true);
    setTimeout(() => {
      setIsPredicting(false);
      setResults({ churn: 82, fraud: 14 });
    }, 1500);
  };

  return (
    <div className="page-body">
      <h2 className="page-title">Run Prediction Model</h2>
      
      <div style={{ display: 'flex', gap: '24px' }}>
        {/* INPUT FORM */}
        <div className="card" style={{ flex: 2 }}>
          <h3 style={{ marginBottom: '20px', color: 'var(--text-main)' }}>Input Customer Data</h3>
          <form onSubmit={runPrediction}>
            <div style={{ display: 'flex', gap: '16px' }}>
              <div className="input-group" style={{ flex: 1 }}><label>Customer Name</label><input type="text" required placeholder="Jane Doe" /></div>
              <div className="input-group" style={{ flex: 1 }}><label>Policy Number</label><input type="text" required placeholder="AG-1234" /></div>
            </div>
            <div style={{ display: 'flex', gap: '16px' }}>
              <div className="input-group" style={{ flex: 1 }}><label>Policy Type</label><select><option>Auto</option><option>Home</option></select></div>
              <div className="input-group" style={{ flex: 1 }}><label>Tenure (Years)</label><input type="number" required placeholder="5" /></div>
              <div className="input-group" style={{ flex: 1 }}><label>Annual Premium ($)</label><input type="number" required placeholder="1200" /></div>
            </div>
            <button type="submit" className="primary-btn" style={{ marginTop: '10px', width: '100%' }}>
              {isPredicting ? 'Analyzing...' : 'Analyze Data'}
            </button>
          </form>
        </div>

        {/* RESULTS PANEL */}
        <div className="card" style={{ flex: 1, textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          {!results ? (
            <p style={{ color: 'var(--text-muted)' }}>Submit data to view AI predictions.</p>
          ) : (
            <div>
              <h3 style={{ color: 'var(--text-main)', marginBottom: '20px' }}>Analysis Complete</h3>
              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Churn Risk</div>
                <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#ef4444' }}>{results.churn}%</div>
              </div>
              <div>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Fraud Probability</div>
                <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#22c55e' }}>{results.fraud}%</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Predictions;
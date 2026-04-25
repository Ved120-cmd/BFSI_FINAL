function Analysis() {
  return (
    <div className="page-container split-layout">
      <div className="left-panel">
        <h2>Fraud & Churn Analysis</h2>
        <form className="analysis-form">
          <div className="form-group">
            <label>Age</label>
            <select><option>Select Age</option></select>
          </div>
          <div className="form-group">
            <label>Claim Amount</label>
            <select><option>Select Amount</option></select>
          </div>
          <div className="form-group">
            <label>Policy Duration</label>
            <select><option>Select Duration</option></select>
          </div>
          <div className="form-group">
            <label>Payment Method</label>
            <select><option>Credit Card</option></select>
          </div>
          <div className="form-group">
            <label>Previous Claims</label>
            <select><option>8</option></select>
          </div>
          <button type="button" className="btn btn-primary full-width">Analyze</button>
        </form>
      </div>

      <div className="right-panel status-panel">
        <div className="status-card alert">⚠️ Fraud Alert! <small>High Risk of Fraud</small></div>
        <div className="status-card warning">⏺️ At Risk of Policy Lapse</div>
        <div className="status-card safe">✅ Loyal Customer <small>No Risk Detected</small></div>
      </div>
    </div>
  );
}

export default Analysis;
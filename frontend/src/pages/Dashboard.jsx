function Dashboard() {
  return (
    <div className="page-container dashboard-page">
      <h2>Reports & Insights</h2>
      <div className="dashboard-grid">
        <div className="dash-card">
          <h3>💼 Fraud Cases</h3>
          <p>125 Suspicious Cases</p>
        </div>
        <div className="dash-card">
          <h3>📄 Policy Lapses</h3>
          <p>78 Potential Churns</p>
        </div>
        <div className="dash-card">
          <h3>👤 Loyal Customers</h3>
          <p>342 Retained Clients</p>
        </div>
        <div className="dash-card activity-card">
          <h3>Recent Activity</h3>
          <ul>
            <li><strong>5</strong> New Claims Submitted</li>
            <li><strong>3</strong> Fraud Alerts</li>
            <li><strong>2</strong> Churn Warnings</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
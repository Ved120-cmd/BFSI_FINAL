import { Link } from 'react-router-dom';

function Home() {
  return (
    <div className="page-container home-page">
      <div className="hero-section">
        <h1>Identify Fraud or Loyal Customers</h1>
        <p>Analyze customer data to detect potential fraud risks and ensure policy loyalty.</p>
        <div className="hero-buttons">
          <Link to="/analysis" className="btn btn-primary">Get Started</Link>
          <button className="btn btn-secondary">Learn More</button>
        </div>
      </div>
      
      <div className="features-row">
        <div className="feature-card">🔍 Fraud Detection</div>
        <div className="feature-card">📊 Churn Prediction</div>
        <div className="feature-card">📈 Data Analytics</div>
      </div>
    </div>
  );
}

export default Home;
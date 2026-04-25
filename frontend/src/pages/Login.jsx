import { useState } from 'react';
import { Link } from 'react-router-dom';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    // Here you will add your fetch() call to your Node.js backend
    console.log('Logging in with:', email, password);
  };

  return (
    <div className="page-container split-layout">
      <div className="left-panel">
        <h2>Welcome Back!</h2>
        <form onSubmit={handleLogin} className="auth-form">
          <input 
            type="email" 
            placeholder="Email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
          />
          <input 
            type="password" 
            placeholder="Password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
          />
          <div className="remember-me">
            <input type="checkbox" id="remember" />
            <label htmlFor="remember">Remember Me</label>
          </div>
          <button type="submit" className="btn btn-primary full-width">Log In</button>
        </form>
        <p className="auth-links">Forgot Password?</p>
        <p className="auth-links">Don't have an account? <Link to="/register">Sign Up</Link></p>
      </div>

      <div className="right-panel status-panel">
        <div className="status-card alert">⚠️ Fraud Alert! <small>High Risk of Fraud</small></div>
        <div className="status-card warning">⏺️ At Risk of Policy Lapse</div>
        <div className="status-card safe">✅ Loyal Customer <small>No Risk Detected</small></div>
      </div>
    </div>
  );
}

export default Login;
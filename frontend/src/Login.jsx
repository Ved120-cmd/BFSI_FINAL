import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Shield, Eye, EyeOff, Activity, Users, PieChart, AlertTriangle, Search } from 'lucide-react';
import './Login.css'; 

function Login() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [message, setMessage] = useState('');

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    const endpoint = isLogin ? '/api/login' : '/api/signup';

    // Logic: Create payload based on mode. 
    // If signing up, we generate a name from the email prefix.
    const nameFromEmail = formData.email.split('@');
    const payload = isLogin 
      ? { email: formData.email, password: formData.password }
      : { name: nameFromEmail, email: formData.email, password: formData.password };

    try {
      // Connect to your Node.js backend on port 8080
      const response = await axios.post(`http://localhost:8080${endpoint}`, payload);

      if (isLogin) {
        // --- DYNAMIC USER DATA HANDLING ---
        const userEmail = formData.email;
        // Get name from backend response, or fallback to email prefix
        const userName = response.data.user?.name || userEmail.split('@');
        
        localStorage.setItem('userEmail', userEmail);
        localStorage.setItem('userName', userName.charAt(0).toUpperCase() + userName.slice(1));

        // Redirect to the Dashboard
        navigate('/dashboard');
      } else {
        // Success message for Signup
        setMessage({ type: 'success', text: response.data.message });
        setIsLogin(true); // Switch to login view
        setFormData({ email: '', password: '' }); 
      }
    } catch (error) {
      // Handle "Invalid credentials" or "Server offline"
      const errorMsg = error.response?.data?.error || 'Connection failed. Ensure backend is running.';
      setMessage({ type: 'error', text: errorMsg });
    }
  };

  return (
    <div className="app-container">
      {/* BACKGROUND: Blurred UI Visual */}
      <div className="blurred-dashboard-bg" aria-hidden="true">
        <div className="mock-sidebar">
          <div className="mock-logo">
            <Shield size={24} color="#3b82f6" /> 
            <span>ASSUREGUARD</span>
          </div>
          <div className="mock-nav-menu">
            <div className="mock-nav-item active"><Activity size={18} /> Dashboard</div>
            <div className="mock-nav-item"><Users size={18} /> Customers</div>
            <div className="mock-nav-item"><PieChart size={18} /> Predictions</div>
          </div>
        </div>
        
        <div className="mock-main">
          <div className="mock-topbar">
            <div className="mock-search"><Search size={16} /> Search policies...</div>
            <div className="mock-profile">SJ</div>
          </div>
          <div className="mock-content">
            <div className="mock-card stat-card"></div>
            <div className="mock-grid">
              <div className="mock-card"></div>
              <div className="mock-card"></div>
            </div>
          </div>
        </div>
      </div>

      {/* FOREGROUND: Interactive Login Modal */}
      <div className="auth-overlay">
        <div className="auth-modal">
          <div className="modal-header">
            <div className="brand">
              <Shield size={28} className="brand-icon" />
              <h2>ASSUREGUARD</h2>
            </div>
            <h3>{isLogin ? 'Welcome to AssureGuard' : 'Create an Account'}</h3>
          </div>

          {message && (
            <div className={`alert ${message.type}`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="form-content">
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input 
                id="email"
                type="email" 
                name="email"
                placeholder="name@company.com" 
                value={formData.email}
                onChange={handleInputChange}
                required 
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="password-input-wrapper">
                <input 
                  id="password"
                  type={showPassword ? "text" : "password"} 
                  name="password"
                  placeholder="••••••••" 
                  value={formData.password}
                  onChange={handleInputChange}
                  required 
                  minLength="6"
                />
                <button 
                  type="button" 
                  className="eye-btn" 
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {isLogin && (
              <div className="form-options">
                <label className="remember-me">
                  <input type="checkbox" /> Remember me
                </label>
                <a href="#forgot" className="forgot-link">Forgot password?</a>
              </div>
            )}

            <button type="submit" className="submit-btn">
              {isLogin ? 'LOG IN' : 'SIGN UP'}
            </button>
          </form>

          <div className="modal-footer">
            <button 
              className="switch-mode-btn" 
              onClick={() => { 
                setIsLogin(!isLogin); 
                setMessage(''); 
                setFormData({ email: '', password: '' });
              }}
            >
              {isLogin ? 'New here? Sign Up' : 'Already have an account? Log In'}
            </button>
            <span className="divider">|</span>
            <a href="#help" className="help-link">Need help?</a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
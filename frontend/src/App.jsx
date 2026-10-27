import React, { useState } from 'react';
import './App.css';

const API_BASE_URL = 'http://localhost:5000/api';

function App() {
  // Authentication state stored in React memory
  const [token, setToken] = useState('');
  const [currentUser, setCurrentUser] = useState('');

  // UI state: 'login' or 'register'
  const [isLoginTab, setIsLoginTab] = useState(true);

  // Form input states
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // Status and feedback messages
  const [message, setMessage] = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(false);

  // Dashboard protected data state
  const [protectedData, setProtectedData] = useState(null);
  const [fetchError, setFetchError] = useState('');

  // Helper to show temporary alert messages
  const showAlert = (text, type = 'info') => {
    setMessage({ text, type });
  };

  // Switch between Login and Register tabs
  const handleTabSwitch = (loginSelected) => {
    setIsLoginTab(loginSelected);
    setMessage({ text: '', type: '' });
    setPassword('');
  };

  // 1. User Registration Handler
  const handleRegister = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      showAlert('Please enter both username and password.', 'error');
      return;
    }

    setLoading(true);
    setMessage({ text: '', type: '' });

    try {
      const response = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (response.ok) {
        // Display registration success message and switch to login tab
        showAlert(data.message || 'Registration successful! Please log in.', 'success');
        setIsLoginTab(true);
        setPassword('');
      } else {
        showAlert(data.message || 'Registration failed.', 'error');
      }
    } catch (err) {
      showAlert('Cannot connect to backend server. Is Node.js running on port 5000?', 'error');
    } finally {
      setLoading(false);
    }
  };

  // 2. User Login Handler
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      showAlert('Please enter both username and password.', 'error');
      return;
    }

    setLoading(true);
    setMessage({ text: '', type: '' });

    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (response.ok) {
        // Store JWT token in React state/memory
        setToken(data.token);
        setCurrentUser(data.username);
        showAlert(data.message || 'Login successful!', 'success');
        setPassword('');

        // Automatically fetch protected dashboard info
        fetchProtectedDashboard(data.token);
      } else {
        // Display error message for invalid credentials
        showAlert(data.message || 'Invalid username or password.', 'error');
      }
    } catch (err) {
      showAlert('Cannot connect to backend server. Is Node.js running on port 5000?', 'error');
    } finally {
      setLoading(false);
    }
  };

  // 3. Fetch Protected Resource using JWT
  const fetchProtectedDashboard = async (authToken = token) => {
    setFetchError('');
    try {
      const response = await fetch(`${API_BASE_URL}/dashboard`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}` // Sending JWT in Authorization header
        }
      });

      const data = await response.json();

      if (response.ok) {
        setProtectedData(data);
      } else {
        setFetchError(data.message || 'Failed to fetch protected data.');
      }
    } catch (err) {
      setFetchError('Error connecting to protected API endpoint.');
    }
  };

  // 4. Logout Handler
  const handleLogout = () => {
    // Clear token and user from React memory
    setToken('');
    setCurrentUser('');
    setProtectedData(null);
    setFetchError('');
    setIsLoginTab(true);
    showAlert('Logged out successfully. Token cleared from memory.', 'info');
  };

  return (
    <div className="app-container">
      {/* College Lab Header */}
      <header className="lab-header">
        <span className="lab-badge">Modern Web Programming Lab</span>
        <h1>Experiment No: 8</h1>
        <p className="lab-subtitle">User Authentication using JWT and Form-Based Login</p>
      </header>

      {/* Main Content Area */}
      <main className="content-card">
        {/* If user is logged in, show Protected Dashboard */}
        {token ? (
          <div className="dashboard-section">
            <div className="dashboard-header">
              <div className="welcome-box">
                <span className="status-dot"></span>
                <h2>Welcome, <span className="highlight-user">{currentUser}</span>!</h2>
              </div>
              <button className="btn btn-logout" onClick={handleLogout} id="logout-btn">
                Logout
              </button>
            </div>

            <div className="card-body">
              <div className="alert alert-success">
                <strong>Authentication Success:</strong> JWT token is active in React memory.
              </div>

              {/* Protected Resource Section */}
              <div className="protected-box">
                <div className="box-title-row">
                  <h3>🔒 Protected Dashboard Resource</h3>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => fetchProtectedDashboard()}
                    id="refresh-btn"
                  >
                    Re-verify Token API
                  </button>
                </div>

                {protectedData ? (
                  <div className="protected-details">
                    <p><strong>Server Message:</strong> {protectedData.message}</p>
                    <p><strong>Data:</strong> {protectedData.secretData}</p>
                    <p><strong>Accessed At:</strong> {protectedData.timestamp}</p>
                  </div>
                ) : fetchError ? (
                  <div className="alert alert-error">{fetchError}</div>
                ) : (
                  <p className="loading-text">Loading protected data from backend...</p>
                )}
              </div>

              {/* JWT Token Viewer for Viva & Demo */}
              <div className="token-box">
                <h4>🔑 Active JWT Token (Authorization Header Bearer):</h4>
                <div className="token-display">
                  <code>Bearer {token}</code>
                </div>
                <small className="token-note">
                  This token was generated by Express.js (jsonwebtoken) and is sent in the <code>Authorization</code> header for protected API requests.
                </small>
              </div>
            </div>
          </div>
        ) : (
          /* If not logged in, show Registration / Login Forms */
          <div className="auth-section">
            {/* Tab Switcher */}
            <div className="tab-container">
              <button
                className={`tab-btn ${isLoginTab ? 'active' : ''}`}
                onClick={() => handleTabSwitch(true)}
                type="button"
                id="tab-login"
              >
                Login
              </button>
              <button
                className={`tab-btn ${!isLoginTab ? 'active' : ''}`}
                onClick={() => handleTabSwitch(false)}
                type="button"
                id="tab-register"
              >
                Register
              </button>
            </div>

            {/* Notification Message */}
            {message.text && (
              <div className={`alert alert-${message.type}`} role="alert" id="auth-alert">
                {message.text}
              </div>
            )}

            {/* Form */}
            <form onSubmit={isLoginTab ? handleLogin : handleRegister} className="auth-form">
              <h2 className="form-title">
                {isLoginTab ? 'Sign In to Your Account' : 'Create a New Account'}
              </h2>

              <div className="form-group">
                <label htmlFor="username">Username</label>
                <input
                  id="username"
                  type="text"
                  placeholder="Enter username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  autoComplete="username"
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete={isLoginTab ? 'current-password' : 'new-password'}
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
                id="submit-auth-btn"
              >
                {loading
                  ? 'Please wait...'
                  : isLoginTab
                  ? 'Login with JWT'
                  : 'Register Account'}
              </button>
            </form>

            <div className="auth-footer">
              {isLoginTab ? (
                <p>
                  Don't have an account?{' '}
                  <span className="link-text" onClick={() => handleTabSwitch(false)}>
                    Register here
                  </span>
                </p>
              ) : (
                <p>
                  Already registered?{' '}
                  <span className="link-text" onClick={() => handleTabSwitch(true)}>
                    Login here
                  </span>
                </p>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Footer Info for College Practical */}
      <footer className="lab-footer">
        <p>B.Tech / MCA / BCA Practical Examination • Department of Computer Science & Engineering</p>
      </footer>
    </div>
  );
}

export default App;

import React, { useState } from 'react';
import axios from 'axios';
import { Lock, LogIn } from 'lucide-react';

const Login = ({ onLoginSuccess }) => {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', formData);
      localStorage.setItem('adminToken', res.data.token);
      onLoginSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container animate-enter" style={{ maxWidth: '400px', marginTop: '2rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div style={{ background: 'var(--primary)', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', color: 'white' }}>
          <Lock size={30} />
        </div>
        <h2>Admin Login</h2>
        <p style={{ color: 'var(--text-light)' }}>Sign in to add new records</p>
      </div>

      {error && <div style={{ color: 'red', marginBottom: '1rem', textAlign: 'center', padding: '0.8rem', background: '#ffebee', borderRadius: '8px' }}>{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Username</label>
          <input 
            type="text" 
            className="form-control" 
            value={formData.username}
            onChange={(e) => setFormData({...formData, username: e.target.value})}
            required 
          />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input 
            type="password" 
            className="form-control" 
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            required 
          />
        </div>
        <button type="submit" className="btn" disabled={loading} style={{ marginTop: '1rem' }}>
          {loading ? 'Authenticating...' : <><LogIn size={20} /> Login</>}
        </button>
      </form>
    </div>
  );
};

export default Login;

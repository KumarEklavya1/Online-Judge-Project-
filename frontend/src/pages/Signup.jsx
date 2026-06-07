import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../services/api';

export default function Signup() {
  const [formData, setFormData] = useState({
    Username: '',
    FullName: '',
    Email: '',
    Password: '',
    DOB: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await API.post('/auth/signup', formData);
      alert('Signup successful! Please login.');
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to sign up');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', fontFamily: 'sans-serif' }}>
      <h2>Create an Account</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <input type="text" name="FullName" placeholder="Full Name" onChange={handleChange} required style={{ padding: '10px' }} />
        <input type="text" name="Username" placeholder="Unique Username" onChange={handleChange} required style={{ padding: '10px' }} />
        <input type="email" name="Email" placeholder="Email Address" onChange={handleChange} required style={{ padding: '10px' }} />
        <input type="password" name="Password" placeholder="Password" onChange={handleChange} required style={{ padding: '10px' }} />
        <input type="date" name="DOB" onChange={handleChange} required style={{ padding: '10px' }} />
        
        <button type="submit" disabled={loading} style={{ padding: '10px', background: '#28a745', color: 'white', border: 'none', cursor: 'pointer' }}>
          {loading ? 'Creating Account...' : 'Sign Up'}
        </button>
      </form>
      <p style={{ marginTop: '20px' }}>
        Already have an account? <Link to="/login">Login here</Link>
      </p>
    </div>
  );
}
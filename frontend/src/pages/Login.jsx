import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../services/api'; // Ensure this path matches your project
import { AuthContext } from '../context/AuthContext';

export default function Login() {
  const [formData, setFormData] = useState({ identifier: '', Password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await API.post('/auth/login', formData);
      login(response.data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="font-mono font-bold text-xl text-judge-bright flex items-center justify-center gap-2 mb-1">
            <span className="text-judge-green">&gt;</span> judge0x
          </div>
          <p className="font-mono text-xs text-judge-dim">authenticate to continue</p>
        </div>

        <div className="card-judge p-6">
          <h2 className="font-mono text-sm text-judge-bright mb-5 flex items-center gap-2">
            <span className="text-judge-green">$</span> login --session
          </h2>

          {error && (
            <div className="font-mono text-xs text-judge-red bg-judge-red-bg border border-judge-red/30 rounded-sm px-3 py-2 mb-4">
              error: {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="font-mono text-[11px] text-judge-dim block mb-1.5">username or email</label>
              <input type="text" name="identifier" placeholder="kumar_dev" onChange={handleChange} required className="input-judge" />
            </div>
            <div>
              <label className="font-mono text-[11px] text-judge-dim block mb-1.5">password</label>
              <input type="password" name="Password" placeholder="••••••••" onChange={handleChange} required className="input-judge" />
            </div>
            <button type="submit" disabled={loading} className="btn-judge btn-judge-primary mt-2">
              {loading ? 'authenticating...' : 'login ⏎'}
            </button>
          </form>
        </div>

        <p className="text-center font-mono text-xs text-judge-dim mt-5">
          no account?{' '}
          <Link to="/signup" className="text-judge-green hover:underline">sign up here</Link>
        </p>
      </div>
    </div>
  );
}
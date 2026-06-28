import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../services/api';

export default function Signup() {
  const [formData, setFormData] = useState({ Username: '', FullName: '', Email: '', Password: '', DOB: '' });
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
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to sign up');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="font-mono font-bold text-xl text-judge-bright flex items-center justify-center gap-2 mb-1">
            <span className="text-judge-green">&gt;</span> judge0x
          </div>
          <p className="font-mono text-xs text-judge-dim">create a new account</p>
        </div>

        <div className="card-judge p-6">
          <h2 className="font-mono text-sm text-judge-bright mb-5 flex items-center gap-2">
            <span className="text-judge-green">$</span> useradd --new
          </h2>

          {error && (
            <div className="font-mono text-xs text-judge-red bg-judge-red-bg border border-judge-red/30 rounded-sm px-3 py-2 mb-4">
              error: {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div><label className="font-mono text-[11px] text-judge-dim block mb-1.5">full name</label><input type="text" name="FullName" placeholder="Kumar Sharma" onChange={handleChange} required className="input-judge" /></div>
            <div><label className="font-mono text-[11px] text-judge-dim block mb-1.5">username</label><input type="text" name="Username" placeholder="kumar_dev" onChange={handleChange} required className="input-judge" /></div>
            <div><label className="font-mono text-[11px] text-judge-dim block mb-1.5">email</label><input type="email" name="Email" placeholder="kumar@example.com" onChange={handleChange} required className="input-judge" /></div>
            <div><label className="font-mono text-[11px] text-judge-dim block mb-1.5">password</label><input type="password" name="Password" placeholder="••••••••" onChange={handleChange} required className="input-judge" /></div>
            <div><label className="font-mono text-[11px] text-judge-dim block mb-1.5">date of birth</label><input type="date" name="DOB" onChange={handleChange} required className="input-judge" /></div>

            <button type="submit" disabled={loading} className="btn-judge btn-judge-primary mt-2">
              {loading ? 'creating account...' : 'create account ⏎'}
            </button>
          </form>
        </div>

        <p className="text-center font-mono text-xs text-judge-dim mt-5">
          already registered?{' '}
          <Link to="/login" className="text-judge-green hover:underline">login here</Link>
        </p>
      </div>
    </div>
  );
}
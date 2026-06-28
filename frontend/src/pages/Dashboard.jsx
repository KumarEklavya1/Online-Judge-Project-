import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import axios from 'axios';

// 1. Define the base URL using an environment variable
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function Dashboard() {
  const { logout, token } = useContext(AuthContext);
  const navigate = useNavigate();

  const [profileData, setProfileData] = useState(null);
  const [solvedProblems, setSolvedProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!token) return;

      try {
        setLoading(true);

        const profileRes = await API.get('/profile');
        setProfileData(profileRes.data);

        // 2. Use the dynamic API_BASE_URL
        const [problemsRes, statusRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/problems`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`${API_BASE_URL}/api/submissions/user-status`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        const allProblems = problemsRes.data;
        const uniqueSolvedIds = [...new Set(statusRes.data)];
        const solved = allProblems.filter(p => uniqueSolvedIds.includes(p._id));
        setSolvedProblems(solved);

      } catch (err) {
        console.error("Dashboard fetch error:", err);
        setError('Failed to fetch protected data. Your token might be expired.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [token]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="font-mono text-lg text-judge-bright mb-1 flex items-center gap-2">
        <span className="text-judge-green">$</span> whoami
      </h1>
      <p className="font-mono text-xs text-judge-dim mb-6">your judge0x profile</p>

      {error && (
        <div className="font-mono text-xs text-judge-red bg-judge-red-bg border border-judge-red/30 rounded-sm px-3 py-2 mb-5">
          error: {error}
        </div>
      )}

      <div className="card-judge p-6 mb-6">
        {profileData ? (
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-sm bg-judge-green-dim text-judge-green flex items-center justify-center font-mono font-bold text-lg">
              {profileData.user.username?.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <p className="font-mono text-sm text-judge-bright">{profileData.user.username}</p>
              <p className="font-mono text-xs text-judge-dim">{profileData.user.email}</p>
            </div>
          </div>
        ) : (
          <p className="font-mono text-xs text-judge-dim">loading profile...</p>
        )}
      </div>

      <div className="card-judge p-6">
        <div className="flex items-center justify-between border-b border-judge-border pb-3 mb-4">
          <h2 className="font-mono text-xs uppercase tracking-wide text-judge-dim">
            # coding problems
          </h2>
          {!loading && (
            <span className="font-mono text-[10px] font-bold text-judge-green bg-judge-green-bg border border-judge-green/30 px-2 py-1 rounded-sm">
              {solvedProblems.length} SOLVED
            </span>
          )}
        </div>

        {loading ? (
          <p className="font-mono text-xs text-judge-dim">loading stats...</p>
        ) : solvedProblems.length > 0 ? (
          <ul className="flex flex-col gap-2 m-0 p-0 list-none">
            {solvedProblems.map((prob) => (
              <li 
                key={prob._id} 
                className="flex items-center justify-between font-mono text-sm border border-judge-border bg-judge-input px-4 py-3 rounded-sm hover:border-judge-border-bright transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-judge-green">✓</span>
                  <span className="text-judge-bright">{prob.title}</span>
                </div>
                <button 
                  onClick={() => navigate(`/problems/${prob._id}`)} 
                  className="text-[11px] text-judge-dim hover:text-judge-text bg-transparent border-none cursor-pointer"
                >
                  review →
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center py-6">
            <p className="font-mono text-xs text-judge-dim mb-3">no problems solved yet.</p>
            <button 
              onClick={() => navigate('/problems')}
              className="btn-judge btn-judge-primary text-[11px] py-1.5 px-3"
            >
              go solve some bugs ⏎
            </button>
          </div>
        )}
      </div>

      <button
        onClick={logout}
        className="btn-judge mt-6 border-judge-red text-judge-red hover:bg-judge-red-bg"
      >
        logout
      </button>
    </div>
  );
}
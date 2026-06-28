import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.jsx';
import axios from 'axios';

function difficultyBadgeClass(difficulty) {
  if (difficulty === 'Easy') return 'badge-difficulty badge-easy';
  if (difficulty === 'Medium') return 'badge-difficulty badge-medium';
  return 'badge-difficulty badge-hard';
}

export default function ProblemList() {
  const [problems, setProblems] = useState([]);
  const [solvedIds, setSolvedIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const navigate = useNavigate();
  const { token } = useContext(AuthContext);
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';


  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // const probRes = await axios.get('${API_BASE_URL}/api/problems');
        const probRes = await axios.get(`${API_BASE_URL}/api/problems`);
        setProblems(probRes.data);

        // Fetch solved problem IDs for the current user
        // const statusRes = await axios.get('${API_BASE_URL}/api/submissions/user-status', {
        //     headers: { Authorization: `Bearer ${token}` }
        // });
        const statusRes = await axios.get(`${API_BASE_URL}/api/submissions/user-status`, {
    headers: {
        Authorization: `Bearer ${token}`
    }
});
        setSolvedIds(statusRes.data);
      } catch (err) {
        setError('Cannot connect to the backend server.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="flex items-baseline justify-between mb-6 pb-3 border-b border-judge-border">
        <h1 className="font-mono text-lg text-judge-bright flex items-center gap-2">
          <span className="text-judge-green">$</span> ls ./problems
        </h1>
        <span className="font-mono text-xs text-judge-dim">{problems.length} total</span>
      </div>

      {loading && <p className="font-mono text-xs text-judge-dim">loading problems...</p>}
      {error && (
        <div className="font-mono text-xs text-judge-red bg-judge-red-bg border border-judge-red/30 rounded-sm px-3 py-2">
          error: {error}
        </div>
      )}

      {!loading && !error && problems.length > 0 && (
        <div className="card-judge overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-judge-raised border-b border-judge-border">
                <th className="font-mono text-[11px] uppercase tracking-wide text-judge-dim px-4 py-3 w-12 text-center">status</th>
                <th className="font-mono text-[11px] uppercase tracking-wide text-judge-dim px-4 py-3">title</th>
                <th className="font-mono text-[11px] uppercase tracking-wide text-judge-dim px-4 py-3">difficulty</th>
                <th className="font-mono text-[11px] uppercase tracking-wide text-judge-dim px-4 py-3 text-center">action</th>
              </tr>
            </thead>
            <tbody>
              {problems.map((prob) => (
                <tr key={prob._id} className="border-b border-judge-border last:border-0 hover:bg-judge-raised/50 transition-colors">
                  <td className="px-4 py-3 text-center font-mono text-sm">
                    {solvedIds.includes(prob._id) ? (
                      <span className="text-judge-green">✓</span>
                    ) : (
                      <span className="text-judge-dim">·</span>
                    )}
                  </td>
                  <td className="px-4 py-3 font-mono text-sm text-judge-bright">{prob.title}</td>
                  <td className="px-4 py-3">
                    <span className={difficultyBadgeClass(prob.difficulty)}>{prob.difficulty}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => navigate(`/problems/${prob._id}`)}
                      className="btn-judge btn-judge-primary py-1.5 px-3 text-[11px]"
                    >
                      solve →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && !error && problems.length === 0 && (
        <p className="font-mono text-xs text-judge-dim">no problems found.</p>
      )}
    </div>
  );
}
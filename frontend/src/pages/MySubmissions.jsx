import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.jsx';
import axios from 'axios';

export default function MySubmissions() {
  const { id } = useParams(); // Gets problemId from the URL
  const navigate = useNavigate();
  const { token } = useContext(AuthContext);
  
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    const fetchSubmissions = async () => {
      if (!token) {
        setError("You must be logged in to view submissions.");
        setLoading(false);
        return;
      }

      try {
        const { data } = await axios.get(`${API_BASE_URL}/api/submissions/history/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSubmissions(data);
      } catch (err) {
        console.error("Error fetching submissions:", err);
        setError(err.response?.data?.error || "Failed to load submissions from the server.");
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, [id, token]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="flex items-baseline justify-between mb-6 pb-3 border-b border-judge-border">
        <div>
          <h1 className="font-mono text-lg text-judge-bright mb-1 flex items-center gap-2">
            <span className="text-judge-green">$</span> submissions --history
          </h1>
          <p className="font-mono text-xs text-judge-dim">problem id: {id}</p>
        </div>
        <button 
          onClick={() => navigate(`/problems/${id}`)}
          className="btn-judge text-[11px] py-1.5 px-3"
        >
          ← back to problem
        </button>
      </div>

      {loading ? (
        <p className="font-mono text-xs text-judge-dim">fetching logs...</p>
      ) : error ? (
        <div className="font-mono text-xs text-judge-red bg-judge-red-bg border border-judge-red/30 rounded-sm px-3 py-2">
          error: {error}
        </div>
      ) : submissions.length === 0 ? (
        <div className="card-judge p-6 text-center">
          <p className="font-mono text-xs text-judge-dim">no previous submissions found for this problem.</p>
        </div>
      ) : (
        <div className="card-judge overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-judge-raised border-b border-judge-border">
                <th className="font-mono text-[11px] uppercase tracking-wide text-judge-dim px-4 py-3">verdict</th>
                <th className="font-mono text-[11px] uppercase tracking-wide text-judge-dim px-4 py-3">language</th>
                <th className="font-mono text-[11px] uppercase tracking-wide text-judge-dim px-4 py-3">time</th>
                <th className="font-mono text-[11px] uppercase tracking-wide text-judge-dim px-4 py-3">memory</th>
                <th className="font-mono text-[11px] uppercase tracking-wide text-judge-dim px-4 py-3 text-right">timestamp</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((sub) => (
                <tr key={sub._id} className="border-b border-judge-border last:border-0 hover:bg-judge-raised/50 transition-colors">
                  <td className="px-4 py-3 font-mono text-sm font-bold">
                    <span className={sub.verdict === 'Accepted' ? 'text-judge-green' : 'text-judge-red'}>
                      {sub.verdict}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-judge-text uppercase">
                    C++
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-judge-text">
                    {sub.timeTaken} ms
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-judge-text">
                    {sub.memoryTaken} mb
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-judge-dim text-right">
                    {new Date(sub.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
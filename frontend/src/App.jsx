import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from './context/AuthContext.jsx';

import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import Dashboard from './pages/Dashboard.jsx';
import ProblemList from './pages/ProblemList.jsx';
import ProblemSetter from './pages/ProblemSetter.jsx';
import ProblemSolve from './pages/ProblemSolve.jsx';
import MySubmissions from './pages/MySubmissions.jsx';

function NavLink({ to, children }) {
  const location = useLocation();
  const isActive = location.pathname === to || location.pathname.startsWith(to + '/');
  return (
    <Link
      to={to}
      className={`font-mono text-[13px] px-3 py-2 rounded-sm transition-colors ${
        isActive ? 'text-judge-green bg-judge-green-dim' : 'text-judge-dim hover:text-judge-text'
      }`}
    >
      {children}
    </Link>
  );
}

function Navbar() {
  const { token, logout } = useContext(AuthContext);

  return (
    <nav className="flex items-center justify-between h-[52px] px-6 border-b border-judge-border bg-judge-raised">
      <div className="flex items-center gap-7">
        <Link to="/" className="font-mono font-bold text-[15px] text-judge-bright flex items-center gap-2">
          <span className="text-judge-green">&gt;</span> judge0x
        </Link>
        <div className="flex gap-1">
          <NavLink to="/problems">problems</NavLink>
          {/* Only show profile if logged in */}
          {token && <NavLink to="/dashboard">profile</NavLink>} 
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        {token ? (
          <button onClick={logout} className="font-mono text-[12px] font-bold px-3 py-1.5 rounded-sm border border-judge-red text-judge-red hover:bg-judge-red-bg transition-colors">
            logout
          </button>
        ) : (
          <>
            <Link to="/login" className="font-mono text-[12px] text-judge-dim hover:text-judge-bright">login</Link>
            <Link to="/signup" className="font-mono text-[12px] font-bold px-3 py-1.5 rounded-sm border border-judge-green text-judge-green hover:bg-judge-green-bg transition-colors">
              sign up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default function App() {
  const { token } = useContext(AuthContext);

  return (
    <Router>
      <div className="min-h-screen bg-judge-bg flex flex-col">
        {/* Navbar is ALWAYS visible now */}
        <Navbar />

        <div className="flex-1">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/problems" element={<ProblemList />} />
            <Route path="/problems/:id" element={<ProblemSolve />} />
            
            <Route path="/login" element={!token ? <Login /> : <Navigate to="/problems" />} />
            <Route path="/signup" element={!token ? <Signup /> : <Navigate to="/problems" />} />

            {/* Protected Routes (Requires Login) */}
            <Route path="/dashboard" element={token ? <Dashboard /> : <Navigate to="/login" />} />
            <Route path="/admin/create" element={token ? <ProblemSetter /> : <Navigate to="/login" />} />
            <Route path="/submissions/:id" element={token ? <MySubmissions /> : <Navigate to="/login" />} />

            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}
import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import API from '../services/api';

export default function Dashboard() {
  const { logout } = useContext(AuthContext);
  const [profileData, setProfileData] = useState(null);
  const [error, setError] = useState('');

  // Let's fetch the protected profile data to prove the token works!
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await API.get('/profile');
        setProfileData(response.data);
      } catch (err) {
        setError('Failed to fetch protected data. Your token might be expired.');
      }
    };
    
    fetchProfile();
  }, []);

  return (
    <div style={{ maxWidth: '600px', margin: '50px auto', fontFamily: 'sans-serif', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h2>Online Judge Dashboard</h2>
      
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {profileData ? (
        <div style={{ background: '#e1f5fe', padding: '15px', borderRadius: '5px', margin: '20px 0' }}>
          <p><strong>Message from server:</strong> {profileData.message}</p>
          <p><strong>Your Username:</strong> {profileData.user.username}</p>
          <p><strong>Your Email:</strong> {profileData.user.email}</p>
        </div>
      ) : (
        <p>Loading your profile...</p>
      )}

      <div style={{ marginTop: '30px' }}>
        <h3>Coding Problems</h3>
        <p>This is where you will list the algorithm challenges later!</p>
      </div>

      <button onClick={logout} style={{ marginTop: '30px', padding: '10px 20px', background: '#dc3545', color: 'white', border: 'none', cursor: 'pointer' }}>
        Logout
      </button>
    </div>
  );
}
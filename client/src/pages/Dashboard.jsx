import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Dashboard() {
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // 1. Check if they have a VIP pass (token). If not, kick them back to login.
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    // 2. Fetch their interview history from our perfect backend
    const fetchHistory = async () => {
      try {
        const response = await fetch('https://grwi.onrender.com/api/answers/my', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) throw new Error('Failed to fetch history');
        
        const data = await response.json();
        setAnswers(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };
return (
    <div>
      {/* Top Header Row with Title and Logout */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h2>My Interview Dashboard</h2>
        <button 
          onClick={handleLogout}
          style={{ padding: '8px 16px', backgroundColor: '#dc2626', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Logout
        </button>
      </div>

      {/* The Single Start Interview Button */}
      <div style={{ marginBottom: '30px' }}>
        <button 
          onClick={() => navigate('/interview')} 
          style={{ padding: '12px 24px', backgroundColor: '#16a34a', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold' }}
        >
          + Start New Interview
        </button>
      </div>

      <h3>Past Interviews</h3>
      {/* ... the rest of your code stays exactly the same ... */}
  

      
      {loading ? (
        <p>Loading your history...</p>
      ) : answers.length === 0 ? (
        <p style={{ color: '#666' }}>You haven't completed any interviews yet. Click the button above to start!</p>
      ) : (
        <div style={{ display: 'grid', gap: '20px' }}>
          {answers.map((ans) => (
            <div key={ans._id} style={{ border: '1px solid #e5e7eb', padding: '20px', borderRadius: '8px', backgroundColor: '#f9fafb' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <h4 style={{ margin: '0 0 10px 0' }}>{ans.questionId?.title || 'Unknown Question'}</h4>
                <span style={{ backgroundColor: '#0070f3', color: 'white', padding: '4px 12px', borderRadius: '20px', fontWeight: 'bold' }}>
                  Score: {ans.feedback?.overallScore}/10
                </span>
              </div>
              <p style={{ fontStyle: 'italic', color: '#4b5563', margin: '10px 0' }}>"{ans.answerText}"</p>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '15px' }}>
                <div>
                  <strong style={{ color: '#16a34a' }}>Strengths:</strong>
                  <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '14px' }}>
                    {ans.feedback?.strengths?.map((s, i) => <li key={i}>{s}</li>)}
                  </ul>
                </div>
                <div>
                  <strong style={{ color: '#dc2626' }}>To Improve:</strong>
                  <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '14px' }}>
                    {ans.feedback?.weaknesses?.map((w, i) => <li key={i}>{w}</li>)}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Dashboard;
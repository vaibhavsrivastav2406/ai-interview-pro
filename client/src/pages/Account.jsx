import React, { useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';

function Account() {
  const { user } = useOutletContext();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    total: 0,
    average: 0,
    dsaCount: 0,
    sysCount: 0,
    behCount: 0,
    highestScore: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const response = await fetch('http://localhost:5000/api/answers/my', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          if (data.length > 0) {
            const total = data.length;
            const validScores = data.filter(item => item.feedback && typeof item.feedback.overallScore === 'number');
            const average = validScores.length > 0
              ? (validScores.reduce((acc, item) => acc + item.feedback.overallScore, 0) / validScores.length).toFixed(1)
              : 0;

            const highestScore = validScores.length > 0
              ? Math.max(...validScores.map(item => item.feedback.overallScore))
              : 0;

            const dsaCount = data.filter(item => item.questionId?.category === 'DSA').length;
            const sysCount = data.filter(item => item.questionId?.category === 'System Design').length;
            const behCount = data.filter(item => item.questionId?.category === 'Behavioral').length;

            setStats({ total, average, dsaCount, sysCount, behCount, highestScore });
          }
        }
      } catch (err) {
        console.error("Error loading account stats:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="transition-fade" style={{ maxWidth: '800px', margin: '0 auto' }}>
      {/* Title */}
      <div className="mb-6">
        <h1 style={{ fontSize: '32px', margin: '0 0 6px 0', fontWeight: '800' }}>
          Account <span className="text-gradient">Settings</span>
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '15px', margin: 0 }}>
          Manage your personal profile settings, practice analytics, and account security.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Profile Card */}
        <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
          {/* Large user avatar sphere */}
          <div style={{ 
            width: '80px', 
            height: '80px', 
            borderRadius: '50%', 
            background: 'var(--primary-gradient)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            fontSize: '36px',
            fontWeight: '800',
            color: 'white',
            boxShadow: '0 0 25px rgba(99, 102, 241, 0.3)'
          }}>
            {user?.name ? user.name[0].toUpperCase() : 'C'}
          </div>

          <div style={{ flex: 1, minWidth: '200px' }}>
            <h3 style={{ fontSize: '20px', margin: '0 0 4px 0', color: 'white' }}>{user?.name || 'Candidate Profile'}</h3>
            <p style={{ margin: '0 0 6px 0', color: 'var(--text-muted)', fontSize: '14px' }}>{user?.email || 'email@company.com'}</p>
            {user?.createdAt && (
              <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '12px' }}>
                Account active since {new Date(user.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
              </p>
            )}
          </div>

          <div>
            <span className="badge badge-easy" style={{ fontSize: '12px', padding: '6px 12px' }}>
              Standard Tier
            </span>
          </div>
        </div>

        {/* Practice Analytics Card */}
        <div className="glass-panel">
          <h3 style={{ fontSize: '18px', margin: '0 0 16px 0', color: 'white' }}>Practice Metrics Overview</h3>
          
          {loading ? (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>Loading metrics...</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* Stats grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '10px', border: '1px solid var(--glass-border)', textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', fontWeight: '800', color: 'white' }}>{stats.total}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>Total Submissions</div>
                </div>

                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '10px', border: '1px solid var(--glass-border)', textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', fontWeight: '800', color: '#34d399' }}>{stats.average}/10</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>Avg AI Rating</div>
                </div>

                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '10px', border: '1px solid var(--glass-border)', textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', fontWeight: '800', color: '#c084fc' }}>{stats.highestScore}/10</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>Highest Grade</div>
                </div>
              </div>

              {/* Progress bars by track */}
              <div style={{ marginTop: '10px' }}>
                <h4 style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '0 0 12px 0' }}>SESSIONS BY TOPIC TRACK</h4>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {/* DSA Progress */}
                  <div>
                    <div className="flex-between" style={{ fontSize: '13px', marginBottom: '4px' }}>
                      <span>Data Structures & Algorithms</span>
                      <span style={{ fontWeight: '600' }}>{stats.dsaCount} Sessions</span>
                    </div>
                    <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${stats.total > 0 ? (stats.dsaCount / stats.total) * 100 : 0}%`, height: '100%', background: 'var(--primary-gradient)' }}></div>
                    </div>
                  </div>

                  {/* System Design Progress */}
                  <div>
                    <div className="flex-between" style={{ fontSize: '13px', marginBottom: '4px' }}>
                      <span>System Design Architectures</span>
                      <span style={{ fontWeight: '600' }}>{stats.sysCount} Sessions</span>
                    </div>
                    <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${stats.total > 0 ? (stats.sysCount / stats.total) * 100 : 0}%`, height: '100%', background: 'linear-gradient(90deg, #a855f7 0%, #6366f1 100%)' }}></div>
                    </div>
                  </div>

                  {/* Behavioral Progress */}
                  <div>
                    <div className="flex-between" style={{ fontSize: '13px', marginBottom: '4px' }}>
                      <span>Behavioral STAR Competency</span>
                      <span style={{ fontWeight: '600' }}>{stats.behCount} Sessions</span>
                    </div>
                    <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${stats.total > 0 ? (stats.behCount / stats.total) * 100 : 0}%`, height: '100%', background: 'linear-gradient(90deg, #fbbf24 0%, #f59e0b 100%)' }}></div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}
        </div>

        {/* Security & System settings */}
        <div className="glass-panel">
          <h3 style={{ fontSize: '18px', margin: '0 0 16px 0', color: 'white' }}>Security & Actions</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="flex-between" style={{ borderBottom: '1px solid var(--glass-border)', paddingBottom: '14px' }}>
              <div>
                <h4 style={{ margin: '0 0 4px 0', fontSize: '14px', color: 'white' }}>API Connection</h4>
                <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)' }}>Status of the local Node / Gemini AI background service.</p>
              </div>
              <span className="badge badge-easy" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
                ONLINE
              </span>
            </div>

            <div className="flex-between">
              <div>
                <h4 style={{ margin: '0 0 4px 0', fontSize: '14px', color: 'white' }}>Terminate Session</h4>
                <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)' }}>Log out from this client application and clear browser keys.</p>
              </div>
              
              <button 
                onClick={handleLogout} 
                className="btn-danger"
                style={{ padding: '8px 20px', fontSize: '13px' }}
              >
                Log Out Securely
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Account;

import React, { useState, useEffect } from 'react';
import { useOutletContext, useNavigate, Link } from 'react-router-dom';

const Dashboard = () => {
  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const { user } = useOutletContext();
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    average: 0,
    topCategory: 'N/A'
  });
  const [loading, setLoading] = useState(true);

  // Difficulties for each category
  const [selectedDifficulty, setSelectedDifficulty] = useState({
    DSA: 'Medium',
    'System Design': 'Medium',
    Behavioral: 'Medium'
  });

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const response = await fetch(`${API_BASE}/api/answers/my`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          setHistory(data);
          
          // Compute stats
          if (data.length > 0) {
            const total = data.length;
            const validScores = data.filter(item => item.feedback && typeof item.feedback.overallScore === 'number');
            const average = validScores.length > 0
              ? (validScores.reduce((acc, item) => acc + item.feedback.overallScore, 0) / validScores.length).toFixed(1)
              : 0;

            // Find top category
            const categories = data.map(item => item.questionId?.category).filter(Boolean);
            const categoryCounts = categories.reduce((acc, cat) => {
              acc[cat] = (acc[cat] || 0) + 1;
              return acc;
            }, {});
            let topCategory = 'N/A';
            let maxCount = 0;
            Object.entries(categoryCounts).forEach(([cat, count]) => {
              if (count > maxCount) {
                maxCount = count;
                topCategory = cat;
              }
            });

            setStats({ total, average, topCategory });
          }
        }
      } catch (err) {
        console.error("Error fetching stats:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const handleDifficultyChange = (category, value) => {
    setSelectedDifficulty(prev => ({
      ...prev,
      [category]: value
    }));
  };

  const startSession = (category) => {
    const difficulty = selectedDifficulty[category];
    navigate(`/app/interview?category=${encodeURIComponent(category)}&difficulty=${encodeURIComponent(difficulty)}`);
  };

  const categories = [
    {
      name: 'DSA',
      icon: '💻',
      desc: 'Algorithm design, data structures, complexity analysis, and problem-solving optimization.',
      color: 'primary'
    },
    {
      name: 'System Design',
      icon: '🏗️',
      desc: 'High-level architectures, scalability, distributed databases, load balancers, and caching structures.',
      color: 'success'
    },
    {
      name: 'Behavioral',
      icon: '🤝',
      desc: 'STAR framework competency, conflict resolution, leadership principles, and cultural fit evaluation.',
      color: 'warning'
    }
  ];

  return (
    <div className="transition-fade">
      {/* Welcome Heading */}
      <div className="mb-6">
        <h1 style={{ fontSize: '32px', margin: '0 0 6px 0', fontWeight: '800' }}>
          Welcome back, <span className="text-gradient">{user?.name || 'Candidate'}</span>!
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '15px', margin: 0 }}>
          Your dashboard is ready. Select an interview track below to start a simulated practice session.
        </p>
      </div>

      {/* Stats row */}
      <div className="grid-cols-3 mb-6" style={{ display: 'grid', gap: '20px' }}>
        <div className="glass-panel stat-card">
          <div className="stat-icon primary">🏁</div>
          <div>
            <div className="stat-val">{stats.total}</div>
            <div className="stat-lbl">Interviews Completed</div>
          </div>
        </div>

        <div className="glass-panel stat-card">
          <div className="stat-icon success">📊</div>
          <div>
            <div className="stat-val">{stats.average}/10</div>
            <div className="stat-lbl">Average Evaluation Score</div>
          </div>
        </div>

        <div className="glass-panel stat-card">
          <div className="stat-icon warning">🔥</div>
          <div>
            <div className="stat-val">{stats.topCategory}</div>
            <div className="stat-lbl">Favorite Track</div>
          </div>
        </div>
      </div>

      {/* Categories Section */}
      <h2 style={{ fontSize: '20px', marginBottom: '16px', fontWeight: '700' }}>Choose Your Practice Category</h2>
      <div className="grid-cols-3 mb-6" style={{ display: 'grid', gap: '20px' }}>
        {categories.map((cat) => (
          <div key={cat.name} className="glass-panel glass-panel-hover category-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <span style={{ fontSize: '28px' }}>{cat.icon}</span>
              <span className={`badge badge-${cat.name.toLowerCase().split(' ')[0]}`}>{cat.name}</span>
            </div>
            <h3 className="category-title">{cat.name} Practice</h3>
            <p className="category-desc">{cat.desc}</p>
            
            <div style={{ marginTop: 'auto' }}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '12px' }}>SELECT DIFFICULTY</label>
                <select 
                  value={selectedDifficulty[cat.name]}
                  onChange={(e) => handleDifficultyChange(cat.name, e.target.value)}
                  style={{ fontSize: '13px', padding: '8px 12px' }}
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>
              
              <button 
                onClick={() => startSession(cat.name)}
                className="btn-primary"
                style={{ width: '100%', textTransform: 'none', padding: '10px' }}
              >
                Launch Simulator
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Recent History quick view */}
      <div className="glass-panel">
        <div className="flex-between mb-4">
          <h2 style={{ fontSize: '18px', margin: 0, fontWeight: '700' }}>Recent Practice Sessions</h2>
          <Link to="/app/history" style={{ color: 'var(--primary-glow)', textDecoration: 'none', fontSize: '13px', fontWeight: '600' }}>
            View Full Log &rarr;
          </Link>
        </div>

        {loading ? (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Loading recent sessions...</p>
        ) : history.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-muted)' }}>
            <p style={{ margin: '0 0 10px 0' }}>No interview attempts recorded yet.</p>
            <button className="btn-secondary" style={{ padding: '8px 16px' }} onClick={() => navigate('/app/interview')}>
              Start First Practice
            </button>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th>Question Title</th>
                  <th>Category</th>
                  <th>Difficulty</th>
                  <th>Score</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {history.slice(0, 3).map((item) => (
                  <tr 
                    key={item._id} 
                    className="interactive-row"
                    onClick={() => navigate('/app/history')}
                  >
                    <td style={{ fontWeight: '600' }}>{item.questionId?.title || 'Unknown Question'}</td>
                    <td>
                      <span className={`badge badge-${item.questionId?.category?.toLowerCase().split(' ')[0]}`}>
                        {item.questionId?.category}
                      </span>
                    </td>
                    <td>
                      <span className={`badge badge-${item.questionId?.difficulty?.toLowerCase()}`}>
                        {item.questionId?.difficulty}
                      </span>
                    </td>
                    <td style={{ fontWeight: '700' }} className={item.feedback?.overallScore >= 7 ? 'text-success' : 'text-danger'}>
                      {item.feedback?.overallScore ?? 'N/A'}/10
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                      {new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
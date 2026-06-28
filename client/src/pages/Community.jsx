import React, { useState, useEffect } from 'react';

const avatarColors = ['#dc2626', '#b91c1c', '#991b1b', '#ef4444', '#f87171', '#ffffff', '#e5e7eb', '#9ca3af', '#4b5563'];

function Community() {
  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState('All');
  const [expandedPost, setExpandedPost] = useState(null);

  const fetchPublicAnswers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/api/answers/public`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setPosts(data);
      }
    } catch (err) {
      console.error("Failed to load community feed", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPublicAnswers();
  }, []);

  const handleLike = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/api/answers/${id}/like`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json(); // returns { likesCount, hasLiked }
        setPosts(prev => prev.map(post => {
          if (post._id === id) {
            return {
              ...post,
              likesCount: data.likesCount,
              hasLiked: data.hasLiked
            };
          }
          return post;
        }));
      }
    } catch (err) {
      console.error("Error liking shared answer", err);
    }
  };

  const filteredPosts = posts.filter(post => {
    if (filterCategory === 'All') return true;
    return post.category.toLowerCase() === filterCategory.toLowerCase();
  });

  return (
    <div className="transition-fade">
      {/* Title */}
      <div className="mb-6">
        <h1 style={{ fontSize: '32px', margin: '0 0 6px 0', fontWeight: '800' }}>
          Community <span className="text-gradient">Showcase Feed</span>
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '15px', margin: 0 }}>
          Explore top-performing interview answers shared by other candidates and study their AI feedback reports.
        </p>
      </div>

      {/* Category filter tags */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '24px' }}>
        {['All', 'DSA', 'System Design', 'Behavioral'].map((cat) => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            className={filterCategory === cat ? 'btn-primary' : 'btn-secondary'}
            style={{ 
              padding: '6px 16px', 
              fontSize: '13px', 
              borderRadius: '20px',
              textTransform: 'none'
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Loading state */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
          <span>Loading public solutions feed...</span>
        </div>
      )}

      {/* Empty state */}
      {!loading && filteredPosts.length === 0 && (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
          <span style={{ fontSize: '32px', display: 'block', marginBottom: '10px' }}>📢</span>
          <span style={{ fontSize: '14px', fontWeight: '600' }}>No public submissions found under this track. Be the first to share one!</span>
        </div>
      )}

      {/* Posts Feed list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {filteredPosts.map((post) => {
          const colorIndex = post.userName.charCodeAt(0) % avatarColors.length;
          const avatarColor = avatarColors[colorIndex];
          const textContrast = avatarColor === '#ffffff' || avatarColor === '#e5e7eb' ? '#000000' : '#ffffff';

          return (
            <div key={post._id} className="glass-panel" style={{ padding: '24px' }}>
              
              {/* Header info */}
              <div className="flex-between mb-4">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {/* Custom Avatar Letter */}
                  <div style={{ 
                    width: '40px', 
                    height: '40px', 
                    borderRadius: '50%', 
                    backgroundColor: avatarColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: '800',
                    color: textContrast,
                    fontSize: '16px',
                    boxShadow: `0 0 12px ${avatarColor}40`
                  }}>
                    {post.userName[0]}
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '14px', color: 'white' }}>{post.userName}</h4>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      {new Date(post.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <span className={`badge badge-${post.category.toLowerCase().split(' ')[0]}`}>{post.category}</span>
                  <span className={`badge badge-${post.difficulty.toLowerCase()}`}>{post.difficulty}</span>
                  <span className="badge badge-easy" style={{ background: 'rgba(255, 255, 255, 0.08)', color: '#ffffff', border: '1px solid rgba(255, 255, 255, 0.15)' }}>
                    Score: {post.feedback?.overallScore || 0}/10
                  </span>
                </div>
              </div>

              {/* Question description */}
              <div style={{ marginBottom: '16px' }}>
                <p style={{ margin: 0, fontSize: '15px', fontWeight: '600', color: 'white', lineHeight: '1.4' }}>
                  Q: {post.questionTitle}
                </p>
              </div>

              {/* Expand / Collapse Button */}
              <div className="flex-between" style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '14px', marginTop: '14px' }}>
                <button 
                  onClick={() => handleLike(post._id)}
                  className="btn-secondary"
                  style={{ 
                    padding: '6px 12px', 
                    fontSize: '12px', 
                    color: post.hasLiked ? '#ef4444' : 'var(--text-muted)',
                    borderColor: post.hasLiked ? 'rgba(239, 68, 68, 0.2)' : 'var(--glass-border)',
                    background: post.hasLiked ? 'rgba(239, 68, 68, 0.05)' : 'transparent'
                  }}
                >
                  ❤️ {post.likesCount} Likes
                </button>

                <button
                  onClick={() => setExpandedPost(expandedPost === post._id ? null : post._id)}
                  className="btn-primary"
                  style={{ padding: '6px 16px', fontSize: '12px', textTransform: 'none' }}
                >
                  {expandedPost === post._id ? 'Hide Solution' : 'View Solution & AI Report'}
                </button>
              </div>

              {/* Expanded section */}
              {expandedPost === post._id && (
                <div className="transition-fade" style={{ marginTop: '20px', borderTop: '1px solid var(--glass-border)', paddingTop: '20px' }}>
                  
                  {/* Candidate Answer */}
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ fontSize: '11px' }}>SUBMITTED RESPONSE</label>
                    <pre style={{ 
                      margin: 0, 
                      padding: '16px', 
                      background: 'rgba(0, 0, 0, 0.4)', 
                      borderRadius: '8px', 
                      border: '1px solid var(--glass-border)',
                      fontFamily: 'monospace', 
                      fontSize: '13px', 
                      lineHeight: '1.6', 
                      overflowX: 'auto',
                      whiteSpace: 'pre-wrap',
                      color: '#e5e7eb'
                    }}>
                      {post.answerText}
                    </pre>
                  </div>

                  {/* AI feedback strengths & weaknesses */}
                  {post.feedback && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '16px' }}>
                      <div>
                        <label style={{ fontSize: '11px' }}>💪 STRENGTHS</label>
                        <div className="pill-list" style={{ marginTop: '4px' }}>
                          {post.feedback.strengths?.map((s, i) => (
                            <span key={i} className="pill-item pill-item-strength" style={{ width: '100%', display: 'block', fontSize: '12px' }}>
                              ✅ {s}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label style={{ fontSize: '11px' }}>⚠️ WEAKNESSES</label>
                        <div className="pill-list" style={{ marginTop: '4px' }}>
                          {post.feedback.weaknesses?.map((w, i) => (
                            <span key={i} className="pill-item pill-item-weakness" style={{ width: '100%', display: 'block', fontSize: '12px' }}>
                              ❌ {w}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* AI feedback suggestions */}
                  {post.feedback?.improvementSuggestions && post.feedback.improvementSuggestions.length > 0 && (
                    <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '16px', marginTop: '16px' }}>
                      <label style={{ fontSize: '11px' }}>💡 SUGGESTED IMPROVEMENTS</label>
                      <ul style={{ paddingLeft: '20px', margin: '6px 0 0 0', color: 'var(--text-muted)', fontSize: '13px', lineHeight: '1.6' }}>
                        {post.feedback.improvementSuggestions.map((s, i) => (
                          <li key={i} style={{ marginBottom: '6px' }}>{s}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                </div>
              )}

            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Community;

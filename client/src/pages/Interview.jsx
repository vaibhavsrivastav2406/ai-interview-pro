import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

function Interview() {
  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const [questions, setQuestions] = useState([]);
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [selectedQuestionId, setSelectedQuestionId] = useState('');
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [answerText, setAnswerText] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [submittedAnswerId, setSubmittedAnswerId] = useState('');
  const [isPublished, setIsPublished] = useState(false);
  const [publishing, setPublishing] = useState(false);

  const handlePublish = async () => {
    if (!submittedAnswerId || publishing) return;
    setPublishing(true);
    try {
      const response = await fetch(`${API_BASE}/api/answers/${submittedAnswerId}/publish`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        setIsPublished(true);
      } else {
        alert("Failed to share answer with community.");
      }
    } catch (err) {
      console.error(err);
      alert("Error connecting to server.");
    } finally {
      setPublishing(false);
    }
  };
  
  // Microphone & Speech-to-Text State
  const [isRecording, setIsRecording] = useState(false);
  const [micVolume, setMicVolume] = useState([10, 10, 10, 10, 10]);
  const recognitionRef = useRef(null);
  const audioIntervalRef = useRef(null);

  // Camera State
  const [isCameraOn, setIsCameraOn] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  
  const navigate = useNavigate();
  const location = useLocation();

  // Parse URL search parameters on load
  const queryParams = new URLSearchParams(location.search);
  const initialCategory = queryParams.get('category');
  const initialDifficulty = queryParams.get('difficulty');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchQuestions = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/questions`);
        const data = await response.json();
        setQuestions(data);
      } catch (error) {
        console.error("Failed to load questions from database, trying fallback", error);
      }
    };

    fetchQuestions();

    // Set up Speech Recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event) => {
        let transcript = '';
        for (let i = 0; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setAnswerText(transcript);
      };

      recognitionRef.current.onerror = (event) => {
        console.error("Microphone error:", event.error);
        setIsRecording(false);
      };

      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };
    }

    // Cleanup camera and mic visualizers on unmount
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (audioIntervalRef.current) {
        clearInterval(audioIntervalRef.current);
      }
    };
  }, [navigate]);

  // Filter questions whenever category/difficulty or full bank changes
  useEffect(() => {
    if (questions.length === 0) return;

    let filtered = [...questions];
    if (initialCategory) {
      filtered = filtered.filter(q => q.category.toLowerCase() === initialCategory.toLowerCase());
    }
    if (initialDifficulty) {
      filtered = filtered.filter(q => q.difficulty.toLowerCase() === initialDifficulty.toLowerCase());
    }

    // Fallback if no exact filters match
    if (filtered.length === 0) {
      filtered = questions;
    }

    setFilteredQuestions(filtered);
    
    // Auto select first question in the list
    if (filtered.length > 0) {
      setSelectedQuestionId(filtered[0]._id);
      setSelectedQuestion(filtered[0]);
    }
  }, [questions, initialCategory, initialDifficulty]);

  // Update selected question details on dropdown changes
  const handleQuestionChange = (id) => {
    setSelectedQuestionId(id);
    const q = questions.find(item => item._id === id);
    setSelectedQuestion(q);
    setFeedback(null); // Clear previous feedback
    setAnswerText(''); // Clear previous answer
  };

  // TTS Voice Reader
  const speakQuestion = () => {
    if (!selectedQuestion) return;
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // Stop current speech
      const text = `${selectedQuestion.title}. ${selectedQuestion.description}`;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.05;
      window.speechSynthesis.speak(utterance);
    } else {
      alert("Text-to-speech is not supported in this browser.");
    }
  };

  // --- CAMERA LOGIC ---
  const toggleCamera = async () => {
    if (isCameraOn) {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (videoRef.current) videoRef.current.srcObject = null;
      setIsCameraOn(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        if (videoRef.current) videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsCameraOn(true);
      } catch (err) {
        console.error("Camera access denied:", err);
        alert("Could not access the camera. Please check your browser site settings and webcam connection.");
      }
    }
  };

  // --- MICROPHONE LOGIC ---
  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
      if (audioIntervalRef.current) {
        clearInterval(audioIntervalRef.current);
        setMicVolume([10, 10, 10, 10, 10]);
      }
    } else {
      if (!recognitionRef.current) {
        alert("Speech recognition is not fully supported in this browser configuration. We suggest Google Chrome.");
        return;
      }
      setAnswerText(''); 
      recognitionRef.current.start();
      setIsRecording(true);

      // Simulate mic audio indicator movement
      audioIntervalRef.current = setInterval(() => {
        setMicVolume([
          Math.floor(Math.random() * 25) + 6,
          Math.floor(Math.random() * 25) + 6,
          Math.floor(Math.random() * 25) + 6,
          Math.floor(Math.random() * 25) + 6,
          Math.floor(Math.random() * 25) + 6
        ]);
      }, 100);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedQuestionId || !answerText.trim()) return;

    setLoading(true);
    setFeedback(null);

    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
      if (audioIntervalRef.current) {
        clearInterval(audioIntervalRef.current);
      }
    }

    try {
      const response = await fetch(`${API_BASE}/api/answers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          questionId: selectedQuestionId,
          answerText: answerText
        }),
      });

      if (!response.ok) throw new Error('Failed to submit answer');

      const data = await response.json();
      setFeedback(data.feedback);
      setSubmittedAnswerId(data._id);
      setIsPublished(false);
    } catch (error) {
      alert(error.message || "An error occurred while grading your response.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="transition-fade" style={{ maxWidth: '1000px', margin: '0 auto' }}>
      {/* Upper Navigation & Metadata */}
      <div className="flex-between mb-4">
        <button className="btn-secondary" style={{ padding: '8px 16px' }} onClick={() => navigate('/app/dashboard')}>
          &larr; Exit Simulator
        </button>
        {selectedQuestion && (
          <div style={{ display: 'flex', gap: '8px' }}>
            <span className={`badge badge-${selectedQuestion.category?.toLowerCase().split(' ')[0]}`}>
              {selectedQuestion.category}
            </span>
            <span className={`badge badge-${selectedQuestion.difficulty?.toLowerCase()}`}>
              {selectedQuestion.difficulty}
            </span>
          </div>
        )}
      </div>

      {/* Main Workspace Split Grid */}
      <div className="grid-cols-2 mb-6" style={{ display: 'grid', gap: '24px' }}>
        
        {/* Left Side: AI Interviewer Console */}
        <div className="glass-panel interviewer-box" style={{ justifyContent: 'center' }}>
          <div className={`avatar-sphere ${isRecording ? 'avatar-listening' : loading ? 'avatar-grading' : ''}`}>
            {loading ? '🤖' : isRecording ? '🎙️' : '👨‍💼'}
          </div>

          <div>
            <h3 style={{ fontSize: '18px', margin: '0 0 6px 0' }}>AI Interviewer</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: 0 }}>
              {loading ? 'Grading your answer...' : isRecording ? 'Listening closely...' : 'Select a question to practice'}
            </p>
          </div>

          <div style={{ width: '100%', borderTop: '1px solid var(--glass-border)', paddingTop: '20px', marginTop: '10px', textAlign: 'left' }}>
            <label style={{ fontSize: '12px' }}>CHOOSE QUESTION</label>
            <select 
              value={selectedQuestionId} 
              onChange={(e) => handleQuestionChange(e.target.value)}
              style={{ marginBottom: '20px' }}
            >
              {filteredQuestions.map((q) => (
                <option key={q._id} value={q._id}>
                  {q.title}
                </option>
              ))}
            </select>

            {selectedQuestion && (
              <div className="glass-panel" style={{ padding: '20px', background: 'rgba(0, 0, 0, 0.2)' }}>
                <h4 style={{ margin: '0 0 10px 0', fontSize: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  {selectedQuestion.title}
                  <button 
                    onClick={speakQuestion}
                    className="btn-secondary" 
                    style={{ padding: '4px 10px', fontSize: '12px', gap: '4px' }}
                    title="Read question aloud"
                  >
                    🔊 Listen
                  </button>
                </h4>
                <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                  {selectedQuestion.description}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Candidate Control Center */}
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Webcam view */}
          <div className={`video-feed-card ${isRecording ? 'recording' : ''}`}>
            {!isCameraOn && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
                <span style={{ fontSize: '42px', marginBottom: '8px' }}>📷</span>
                <span style={{ fontSize: '14px', fontWeight: '600' }}>Camera Stream Offline</span>
              </div>
            )}
            <video ref={videoRef} autoPlay playsInline muted style={{ display: isCameraOn ? 'block' : 'none' }} />
            
            {isRecording && (
              <div className="video-overlay-status">
                <span className="record-dot"></span>
                <span>REC</span>
              </div>
            )}
          </div>

          {/* Video Toggle & Audio levels */}
          <div className="flex-between">
            <button type="button" onClick={toggleCamera} className="btn-secondary" style={{ padding: '8px 16px', fontSize: '13px' }}>
              {isCameraOn ? '📷 Turn Camera Off' : '📷 Turn Camera On'}
            </button>

            {isRecording && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600' }}>MIC INPUT:</span>
                <div className="audio-visualizer">
                  {micVolume.map((height, i) => (
                    <div key={i} className="audio-bar" style={{ height: `${height}px` }} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Response Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px', flexGrow: 1 }}>
            <div>
              <div className="flex-between" style={{ marginBottom: '8px' }}>
                <label style={{ margin: 0 }}>Candidate Response</label>
                <button
                  type="button"
                  onClick={toggleRecording}
                  style={{ padding: '4px 12px', fontSize: '12px' }}
                  className={isRecording ? 'btn-danger' : 'btn-secondary'}
                >
                  {isRecording ? '⏹ Stop' : '🎙️ Speak Answer'}
                </button>
              </div>

              <textarea 
                rows="6"
                placeholder="Click 'Speak Answer' to speak using speech recognition, or type your response here..."
                value={answerText}
                onChange={(e) => setAnswerText(e.target.value)}
                required
                style={{ resize: 'vertical', minHeight: '120px' }}
              />
            </div>

            <button 
              type="submit" 
              className="btn-primary"
              disabled={loading || !answerText.trim()}
              style={{ width: '100%', marginTop: 'auto' }}
            >
              {loading ? 'AI Interviewer is grading...' : 'Submit Response'}
            </button>
          </form>

        </div>
      </div>

      {/* Bottom Panel: AI Feedback Dashboard */}
      {feedback && (
        <div className="glass-panel transition-fade" style={{ 
          borderLeft: '4px solid var(--primary-glow)', 
          background: 'radial-gradient(circle at 100% 0%, rgba(220, 38, 38, 0.05), transparent 30%), var(--glass-bg)'
        }}>
          
          <div className="flex-between" style={{ borderBottom: '1px solid var(--glass-border)', paddingBottom: '20px', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
            <div>
              <h3 style={{ fontSize: '20px', margin: '0 0 4px 0', color: 'white' }}>Performance Report</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: 0 }}>Instant AI grading based on accuracy, clarity, and structural response.</p>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
              {submittedAnswerId && (
                <div>
                  {isPublished ? (
                    <span className="badge badge-easy" style={{ padding: '8px 14px', border: '1px solid #ffffff', color: '#ffffff', background: 'rgba(255, 255, 255, 0.08)' }}>
                      ✓ Shared to Community
                    </span>
                  ) : (
                    <button 
                      onClick={handlePublish} 
                      disabled={publishing} 
                      className="btn-secondary" 
                      style={{ padding: '8px 14px', fontSize: '13px', textShadow: 'none' }}
                    >
                      {publishing ? 'Sharing...' : '📢 Share to Community'}
                    </button>
                  )}
                </div>
              )}

              {/* SVG Progress Gauge */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <div className="score-gauge-ring">
                  <svg width="80" height="80" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
                    <circle cx="50" cy="50" r="42" stroke="rgba(255,255,255,0.04)" strokeWidth="10" fill="transparent" />
                    <circle 
                      cx="50" 
                      cy="50" 
                      r="42" 
                      stroke="url(#grad)" 
                      strokeWidth="10" 
                      fill="transparent"
                      strokeDasharray="263.89" 
                      strokeDashoffset={263.89 - (263.89 * feedback.overallScore) / 10}
                      strokeLinecap="round" 
                    />
                    <defs>
                      <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#ef4444" />
                        <stop offset="100%" stopColor="#7f1d1d" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="score-gauge-val" style={{ color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: '22px', fontWeight: '800', lineHeight: 1 }}>{feedback.overallScore}</span>
                    <span style={{ fontSize: '9px', color: 'var(--text-muted)', fontWeight: '600' }}>/10</span>
                  </div>
                </div>
                <div>
                  <span className="badge badge-easy" style={{ fontSize: '14px', padding: '6px 12px' }}>
                    Score: {feedback.overallScore >= 7.5 ? 'Excellent' : feedback.overallScore >= 5.5 ? 'Good' : 'Needs Work'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <div>
              <h4 style={{ fontSize: '14px', color: '#ffffff', margin: '0 0 10px 0' }}>💪 STRENGTHS DETECTED</h4>
              <div className="pill-list">
                {feedback.strengths?.map((s, i) => (
                  <span key={i} className="pill-item pill-item-strength" style={{ width: '100%', display: 'block' }}>
                    ✅ {s}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h4 style={{ fontSize: '14px', color: '#f87171', margin: '0 0 10px 0' }}>⚠️ WEAKNESSES / GAPS</h4>
              <div className="pill-list">
                {feedback.weaknesses?.map((w, i) => (
                  <span key={i} className="pill-item pill-item-weakness" style={{ width: '100%', display: 'block' }}>
                    ❌ {w}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {feedback.improvementSuggestions && feedback.improvementSuggestions.length > 0 && (
            <div style={{ marginTop: '24px', borderTop: '1px solid var(--glass-border)', paddingTop: '20px' }}>
              <h4 style={{ fontSize: '14px', color: '#ffffff', margin: '0 0 10px 0' }}>💡 IMPROVEMENT SUGGESTIONS</h4>
              <ul style={{ paddingLeft: '20px', margin: 0, color: 'var(--text-muted)', fontSize: '14px', lineHeight: '1.6' }}>
                {feedback.improvementSuggestions.map((s, i) => (
                  <li key={i} style={{ marginBottom: '8px' }}>{s}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Interview;
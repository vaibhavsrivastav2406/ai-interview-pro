import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

function Interview() {
  const [questions, setQuestions] = useState([]);
  const [selectedQuestion, setSelectedQuestion] = useState('');
  const [answerText, setAnswerText] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);
  
  // Microphone State
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef(null);

  // Camera State
  const [isCameraOn, setIsCameraOn] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null); // Keeps track of the active camera stream
  
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchQuestions = async () => {
      try {
        const response = await fetch('https://grwi.onrender.com/api/questions');
        const data = await response.json();
        setQuestions(data);
        if (data.length > 0) setSelectedQuestion(data[0]._id);
      } catch (error) {
        console.error("Failed to load questions", error);
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

    // Cleanup: Turn off camera if the user leaves the page
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [navigate]);

  // --- CAMERA LOGIC ---
  const toggleCamera = async () => {
    if (isCameraOn) {
      // Turn it off
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      videoRef.current.srcObject = null;
      setIsCameraOn(false);
    } else {
      // Turn it on
      try {
        // We only request video. Audio is handled by the speech-to-text API.
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsCameraOn(true);
      } catch (err) {
        console.error("Camera access denied:", err);
        alert("Could not access the camera. Please check your browser permissions.");
      }
    }
  };

  // --- MICROPHONE LOGIC ---
  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
    } else {
      if (!recognitionRef.current) {
        alert("Your browser does not support speech recognition. Please use Google Chrome.");
        return;
      }
      setAnswerText(''); 
      recognitionRef.current.start();
      setIsRecording(true);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFeedback(null);

    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
    }

    try {
      const response = await fetch('http://localhost:5000/api/answers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          questionId: selectedQuestion,
          answerText: answerText
        }),
      });

      if (!response.ok) throw new Error('Failed to submit answer');

      const data = await response.json();
      setFeedback(data.feedback);
      setAnswerText('');
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '40px auto', fontFamily: 'sans-serif' }}>
      <button 
        onClick={() => navigate('/dashboard')}
        style={{ marginBottom: '20px', padding: '8px 12px', cursor: 'pointer', backgroundColor: '#e5e7eb', border: 'none', borderRadius: '4px' }}
      >
        &larr; Back to Dashboard
      </button>

      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Mock Interview Practice</h2>

      {/* --- NEW VIDEO FEED SECTION --- */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '30px' }}>
        <video 
          ref={videoRef}
          autoPlay 
          playsInline 
          muted 
          style={{ 
            width: '100%', 
            maxWidth: '500px', 
            height: '300px', 
            backgroundColor: '#000', 
            borderRadius: '12px',
            objectFit: 'cover',
            marginBottom: '15px',
            border: isRecording ? '4px solid #ef4444' : '4px solid #10b981', // Turns red when recording!
            transition: 'border 0.3s ease'
          }}
        />
        <button 
          type="button" 
          onClick={toggleCamera}
          style={{ padding: '10px 20px', backgroundColor: isCameraOn ? '#4b5563' : '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          {isCameraOn ? '📷 Turn Camera Off' : '📷 Turn Camera On'}
        </button>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px', backgroundColor: '#f9fafb', padding: '30px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
        
        <div>
          <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '10px' }}>Select a Question:</label>
          <select 
            value={selectedQuestion} 
            onChange={(e) => setSelectedQuestion(e.target.value)}
            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '16px' }}
          >
            {questions.map((q) => (
              <option key={q._id} value={q._id}>
                [{q.category}] {q.title}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '10px' }}>Your Answer:</label>
          <button
            type="button"
            onClick={toggleRecording}
            style={{ 
              display: 'block', 
              marginBottom: '10px', 
              padding: '8px 16px', 
              backgroundColor: isRecording ? '#fee2e2' : '#f3f4f6', 
              color: isRecording ? '#dc2626' : '#374151', 
              border: `1px solid ${isRecording ? '#ef4444' : '#d1d5db'}`, 
              borderRadius: '4px', 
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            {isRecording ? '⏹ Stop Recording' : '🎙️ Start Recording'}
          </button>

          <textarea 
            rows="5"
            placeholder="Click 'Start Recording' to speak, or type your response here..."
            value={answerText}
            onChange={(e) => setAnswerText(e.target.value)}
            required
            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '16px', boxSizing: 'border-box', resize: 'vertical' }}
          />
        </div>

        <button 
          type="submit" 
          disabled={loading || !answerText.trim()}
          style={{ padding: '12px', backgroundColor: '#0070f3', color: 'white', border: 'none', borderRadius: '4px', fontSize: '16px', fontWeight: 'bold', cursor: loading ? 'not-allowed' : 'pointer' }}
        >
          {loading ? 'AI is grading your answer...' : 'Submit Answer'}
        </button>
      </form>

      {/* AI Feedback Display */}
      {feedback && (
        <div style={{ marginTop: '30px', padding: '25px', backgroundColor: '#ecfdf5', borderRadius: '8px', border: '1px solid #10b981' }}>
          <h3 style={{ margin: '0 0 15px 0', color: '#047857' }}>Feedback Received! (Score: {feedback.overallScore}/10)</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div>
              <strong style={{ color: '#15803d' }}>Strengths:</strong>
              <ul style={{ paddingLeft: '20px', margin: '5px 0' }}>{feedback.strengths?.map((s, i) => <li key={i}>{s}</li>)}</ul>
            </div>
            <div>
              <strong style={{ color: '#b91c1c' }}>To Improve:</strong>
              <ul style={{ paddingLeft: '20px', margin: '5px 0' }}>{feedback.weaknesses?.map((w, i) => <li key={i}>{w}</li>)}</ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Interview;
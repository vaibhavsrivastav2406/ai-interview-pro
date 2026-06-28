import React, { useState, useEffect, useRef } from 'react';

const ChatWidget = () => {
  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'model',
      text: "Hello! I am **AIPro Coach**, your personal career mentor. Ask me anything about coding algorithms, system design architectures, STAR behavioral responses, or resume tips!"
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  
  const chatEndRef = useRef(null);

  // Scroll to bottom whenever messages list or open state updates
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || loading) return;

    const userMessage = { role: 'user', text: inputValue };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          message: userMessage.text,
          chatHistory: messages
        })
      });

      if (!response.ok) throw new Error("Failed to reach AI Coach");

      const data = await response.json();
      setMessages(prev => [...prev, { role: 'model', text: data.reply }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { 
        role: 'model', 
        text: "⚠️ *System Timeout: Could not connect to the coaching server. Please ensure the backend is running and try again.*" 
      }]);
    } finally {
      setLoading(false);
    }
  };

  // Basic markdown-like renderer (covers bold, bullet lists, code blocks simply)
  const renderMessageText = (text) => {
    // Escape HTML to prevent XSS
    let escaped = text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    // Replace bold formatting (**text**)
    escaped = escaped.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    
    // Replace italic / bullet bold formatting (* text)
    escaped = escaped.replace(/^\*\s(.*)$/gm, "<li>$1</li>");
    
    // Wrap lists in ul
    if (escaped.includes("<li>")) {
      const lines = escaped.split("\n");
      let inList = false;
      const formattedLines = lines.map(line => {
        if (line.startsWith("<li>")) {
          if (!inList) {
            inList = true;
            return "<ul>" + line;
          }
          return line;
        } else {
          if (inList) {
            inList = false;
            return "</ul>" + line;
          }
          return line;
        }
      });
      if (inList) {
        formattedLines.push("</ul>");
      }
      escaped = formattedLines.join("\n");
    }

    // Replace code snippets (`code`)
    escaped = escaped.replace(/`(.*?)`/g, "<code style='background: rgba(0,0,0,0.45); padding: 2px 6px; border-radius: 4px; font-family: monospace; color: #f87171;'>$1</code>");

    return <div dangerouslySetInnerHTML={{ __html: escaped.replace(/\n/g, "<br/>") }} />;
  };

  return (
    <>
      {/* Floating Action Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="btn-primary"
        style={{
          position: 'fixed',
          bottom: '30px',
          right: '30px',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          padding: 0,
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '24px',
          boxShadow: isOpen 
            ? '0 0px 0 #550000, 0 2px 4px rgba(0, 0, 0, 0.6)' 
            : '0 4px 0 #550000, 0 8px 16px rgba(239, 68, 68, 0.3)',
          transform: isOpen ? 'translateY(4px)' : 'none'
        }}
        title="Toggle AI Career Coach"
      >
        {isOpen ? '❌' : '💬'}
      </button>

      {/* Expanded Chat Drawer */}
      {isOpen && (
        <div 
          className="glass-panel transition-fade" 
          style={{
            position: 'fixed',
            bottom: '105px',
            right: '30px',
            width: '380px',
            height: '520px',
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            padding: '20px',
            background: 'rgba(10, 10, 14, 0.92)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 20px 50px rgba(0,0,0,0.8)'
          }}
        >
          {/* Header */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid var(--glass-border)',
            paddingBottom: '12px',
            marginBottom: '12px'
          }}>
            <div>
              <h3 style={{ fontSize: '16px', margin: '0 0 2px 0', color: 'white', display: 'flex', alignItems: 'center', gap: '6px' }}>
                AIPro Coach 🤖
                <span style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: '#10b981',
                  boxShadow: '0 0 8px #10b981',
                  display: 'inline-block'
                }}></span>
              </h3>
              <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-muted)' }}>Career & Technical Prep Assistant</p>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                fontSize: '20px',
                cursor: 'pointer',
                padding: '4px'
              }}
            >
              &times;
            </button>
          </div>

          {/* Messages Logs Area */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            paddingRight: '4px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            marginBottom: '12px'
          }}>
            {messages.map((msg, i) => (
              <div 
                key={i} 
                style={{
                  alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '82%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start'
                }}
              >
                <div style={{
                  padding: '10px 14px',
                  borderRadius: '12px',
                  fontSize: '13.5px',
                  lineHeight: '1.45',
                  background: msg.role === 'user' ? 'linear-gradient(135deg, #ef4444 0%, #991b1b 100%)' : 'rgba(255, 255, 255, 0.04)',
                  color: 'white',
                  border: msg.role === 'user' ? '1px solid #b30000' : '1px solid var(--glass-border)',
                  borderTopRightRadius: msg.role === 'user' ? '2px' : '12px',
                  borderTopLeftRadius: msg.role === 'user' ? '12px' : '2px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                }}>
                  {renderMessageText(msg.text)}
                </div>
              </div>
            ))}

            {/* Loading/Typing dots */}
            {loading && (
              <div style={{ alignSelf: 'flex-start', maxWidth: '82%' }}>
                <div style={{
                  padding: '12px 16px',
                  borderRadius: '12px',
                  borderTopLeftRadius: '2px',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid var(--glass-border)',
                  display: 'flex',
                  gap: '5px',
                  alignItems: 'center'
                }}>
                  <span className="record-dot" style={{ animationDelay: '0s', width: '6px', height: '6px', backgroundColor: 'white' }}></span>
                  <span className="record-dot" style={{ animationDelay: '0.2s', width: '6px', height: '6px', backgroundColor: 'white' }}></span>
                  <span className="record-dot" style={{ animationDelay: '0.4s', width: '6px', height: '6px', backgroundColor: 'white' }}></span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Message input form */}
          <form onSubmit={handleSend} style={{ display: 'flex', gap: '8px' }}>
            <input 
              type="text" 
              placeholder="Ask for hints or coding tips..." 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={loading}
              style={{
                fontSize: '13px',
                padding: '10px 14px',
                flexGrow: 1
              }}
            />
            <button 
              type="submit" 
              className="btn-primary" 
              disabled={loading || !inputValue.trim()}
              style={{
                padding: '10px 16px',
                fontSize: '13px',
                flexShrink: 0
              }}
            >
              Send
            </button>
          </form>

        </div>
      )}
    </>
  );
};

export default ChatWidget;

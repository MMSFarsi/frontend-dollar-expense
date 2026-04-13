import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { MessageCircle, X, Send, Bot, User } from 'lucide-react';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'ai', text: "Hello Admin! I am the Kidsland Financial AI. Ask me any math or history question about your records!" }
  ]);
  const [inputStr, setInputStr] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputStr.trim()) return;

    const userMessage = inputStr.trim();
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setInputStr('');
    setLoading(true);

    try {
      const token = localStorage.getItem('adminToken');
      const res = await axios.post(
        'https://backend-kidsland-dollar.vercel.app/api/chat',
        { message: userMessage },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setMessages(prev => [...prev, { role: 'ai', text: res.data.reply }]);
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || "Failed to contact AI.";
      setMessages(prev => [...prev, { role: 'ai', text: `⚠️ Error: ${errorMsg}` }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          style={{
            position: 'fixed', bottom: '30px', right: '30px',
            width: '60px', height: '60px', borderRadius: '50%',
            backgroundColor: 'var(--primary)', color: 'white',
            border: 'none', boxShadow: '0 8px 25px rgba(255, 90, 95, 0.4)',
            cursor: 'pointer', zIndex: 1000,
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            transition: 'transform 0.3s'
          }}
          onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
          onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          <MessageCircle size={30} />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div style={{
          position: 'fixed', bottom: '30px', right: '30px',
          width: '350px', height: '500px',
          backgroundColor: 'var(--card-bg)', borderRadius: '24px',
          boxShadow: '0 15px 40px rgba(0,0,0,0.2)', zIndex: 1000,
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
          border: '1px solid var(--input-border)'
        }}>
          {/* Header */}
          <div style={{
            padding: '1rem', backgroundColor: 'var(--primary)', color: 'white',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            fontWeight: 'bold'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Bot size={20} />
              Kidsland AI Accountant
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages */}
          <div style={{
            flex: 1, padding: '1rem', overflowY: 'auto',
            display: 'flex', flexDirection: 'column', gap: '1rem',
            backgroundColor: 'var(--bg-color)'
          }}>
            {messages.map((msg, idx) => (
              <div key={idx} style={{
                display: 'flex', flexDirection: 'column',
                alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start',
              }}>
                <div style={{
                  maxWidth: '85%', padding: '0.8rem 1rem', borderRadius: '16px',
                  backgroundColor: msg.role === 'user' ? 'var(--primary)' : 'var(--card-bg)',
                  color: msg.role === 'user' ? 'white' : 'var(--text-dark)',
                  boxShadow: msg.role === 'user' ? 'none' : '0 2px 10px rgba(0,0,0,0.05)',
                  border: msg.role === 'ai' ? '1px solid var(--input-border)' : 'none',
                  fontSize: '0.9rem', lineHeight: '1.4'
                }}>
                  {msg.text}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ alignSelf: 'flex-start', color: 'var(--text-light)', fontSize: '0.8rem', paddingLeft: '1rem' }}>
                AI is thinking...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Box */}
          <form onSubmit={handleSend} style={{
            padding: '1rem', backgroundColor: 'var(--card-bg)',
            borderTop: '1px solid var(--input-border)',
            display: 'flex', gap: '10px'
          }}>
            <input 
              type="text" 
              value={inputStr}
              onChange={(e) => setInputStr(e.target.value)}
              placeholder="Ask about your math..."
              style={{
                flex: 1, padding: '0.8rem', borderRadius: '12px',
                border: '1px solid var(--input-border)', outline: 'none',
                backgroundColor: 'var(--bg-color)', color: 'var(--text-dark)'
              }}
              disabled={loading}
            />
            <button 
              type="submit" 
              disabled={loading}
              style={{
                backgroundColor: 'var(--secondary)', color: 'white',
                border: 'none', borderRadius: '12px', padding: '0 1rem',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default Chatbot;

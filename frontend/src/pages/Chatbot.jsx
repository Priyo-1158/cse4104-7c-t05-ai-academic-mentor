import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { DataStore } from '../services/localStore';
import { GeminiAPI } from '../services/aiApi';
import { formatMarkdown, timeAgo } from '../utils/helpers';
import './Chatbot.css';

const SUGGESTIONS = [
  'Explain recursion with examples',
  'What is Big O notation?',
  'Explain database normalization',
  'How does JWT authentication work?',
  'Explain the OSI model'
];

export default function Chatbot() {
  const { user, initials } = useAuth();
  const [sessions, setSessions] = useState(() => DataStore.get('chat_sessions') || []);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [typing, setTyping] = useState(false);
  const [sending, setSending] = useState(false);
  const [sessionTopic, setSessionTopic] = useState('Powered by Gemini AI');
  const inputRef = useRef(null);
  const areaRef = useRef(null);

  function newSession() {
    const id = 'sess_' + Date.now();
    const updated = [{ id, topic: 'New Conversation', date: new Date().toISOString(), messages: [] }, ...sessions];
    setSessions(updated);
    DataStore.set('chat_sessions', updated);
    setCurrentSessionId(id);
    setMessages([]);
    setSessionTopic('Powered by Live AI Engine');
    setShowSuggestions(true);
  }

  function loadSession(id) {
    const sess = sessions.find(s => s.id === id);
    if (!sess) return;
    setCurrentSessionId(id);
    setMessages(sess.messages || []);
    setSessionTopic(sess.topic || 'AI Conversation');
    setShowSuggestions(!(sess.messages || []).length);
  }

  useEffect(() => {
    if (sessions.length) loadSession(sessions[0].id);
    else newSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (areaRef.current) areaRef.current.scrollTop = areaRef.current.scrollHeight;
  }, [messages, typing]);

  function persistMessages(newMsgs, userText) {
    const updated = sessions.map(s => {
      if (s.id !== currentSessionId) return s;
      let topic = s.topic;
      if (userText && (topic === 'New Conversation' || topic === '')) {
        topic = userText.slice(0, 35) + (userText.length > 35 ? '...' : '');
        setSessionTopic(topic);
      }
      return { ...s, messages: newMsgs, topic };
    });
    setSessions(updated);
    DataStore.set('chat_sessions', updated);
  }

  async function sendMessage(text) {
    const value = (text ?? inputRef.current.value).trim();
    if (!value) return;

    let sessId = currentSessionId;
    let workingSessions = sessions;
    if (!sessId) {
      sessId = 'sess_' + Date.now();
      workingSessions = [{ id: sessId, topic: value.slice(0, 50), date: new Date().toISOString(), messages: [] }, ...sessions];
      setSessions(workingSessions);
      setCurrentSessionId(sessId);
    }

    inputRef.current.value = '';
    autoResize(inputRef.current);
    setShowSuggestions(false);
    setSending(true);

    const afterUser = [...messages, { role: 'user', content: value }];
    setMessages(afterUser);
    persistMessages(afterUser, value);
    setTyping(true);

    try {
      const apiMessages = afterUser.map(m => ({
        role: m.role === 'ai' ? 'model' : 'user',
        content: m.content
      }));
      const reply = await GeminiAPI.chat(apiMessages);
      setTyping(false);
      const afterAi = [...afterUser, { role: 'ai', content: reply }];
      setMessages(afterAi);
      persistMessages(afterAi, null);
      DataStore.push('chat_history', { topic: value.slice(0, 60), date: new Date().toISOString() });
    } catch (err) {
      setTyping(false);
      const errMsg = '🔌 Could not reach the backend: ' + (err.message || 'unknown error') + '. Make sure the server is running and VITE_API_BASE points to it.';
      const afterAi = [...afterUser, { role: 'ai', content: errMsg }];
      setMessages(afterAi);
      persistMessages(afterAi, null);
    }

    setSending(false);
  }

  function autoResize(el) {
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 140) + 'px';
  }

  function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  }

  function clearChat() {
    if (!confirm('Clear this conversation?')) return;
    const updated = sessions.filter(s => s.id !== currentSessionId);
    setSessions(updated);
    DataStore.set('chat_sessions', updated);
    setCurrentSessionId(null);
    setMessages([]);
    setTimeout(newSession, 0);
  }

  return (
    <div className="chat-page">
      <div className="chat-sidebar">
        <div className="chat-sidebar-header">
          <h3>Conversations</h3>
          <button className="btn-primary" style={{ width: '100%', justifyContent: 'center', fontSize: '0.82rem' }} onClick={newSession}>+ New Chat</button>
        </div>
        <div className="session-list">
          {!sessions.length ? (
            <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-3)', fontSize: '0.8rem' }}>No conversations yet</div>
          ) : sessions.map(s => (
            <div key={s.id} className={`session-item${s.id === currentSessionId ? ' active' : ''}`} onClick={() => loadSession(s.id)}>
              <strong>{s.topic || 'New Conversation'}</strong>
              <span>{timeAgo(s.date)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="chat-main">
        <div className="chat-topbar">
          <Link to="/dashboard" className="back">← Dashboard</Link>
          <span style={{ color: 'var(--border)', margin: '0 4px' }}>|</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text)' }}>🤖 AI Academic Chatbot</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-3)' }}>{sessionTopic}</div>
          </div>
          <button className="btn-ghost" onClick={clearChat} style={{ fontSize: '0.8rem' }}>Clear</button>
        </div>

        <div className="chat-area" ref={areaRef}>
          {messages.length === 0 && (
            <div className="msg ai fade-up">
              <div className="msg-avatar">AI</div>
              <div className="msg-bubble">
                <strong>Hello! I'm your AI Academic Mentor 👋</strong>
                <p style={{ marginTop: 8 }}>I'm powered by Gemini AI and I'm here to help you with any academic questions. You can ask me to:</p>
                <ul style={{ margin: '8px 0 0 16px', fontSize: '0.88rem', color: 'var(--text-2)' }}>
                  <li>Explain complex concepts clearly</li>
                  <li>Help with assignments and problems</li>
                  <li>Summarize topics for quick revision</li>
                  <li>Answer subject-specific questions</li>
                </ul>
                <p style={{ marginTop: 10, fontSize: '0.82rem', color: 'var(--text-3)' }}>What would you like to learn today?</p>
              </div>
            </div>
          )}

          {messages.map((m, i) => (
            <div key={i} className={`msg ${m.role} fade-up`}>
              <div className="msg-avatar">{m.role === 'ai' ? 'AI' : initials(user.name)}</div>
              {m.role === 'ai'
                ? <div className="msg-bubble" dangerouslySetInnerHTML={{ __html: formatMarkdown(m.content) }} />
                : <div className="msg-bubble">{m.content}</div>}
            </div>
          ))}

          {typing && (
            <div className="msg ai">
              <div className="msg-avatar">AI</div>
              <div className="msg-bubble"><div className="typing-dots"><span></span><span></span><span></span></div></div>
            </div>
          )}
        </div>

        {showSuggestions && (
          <div className="chat-suggestions">
            {SUGGESTIONS.map(s => (
              <button key={s} className="suggestion-chip" onClick={() => sendMessage(s)}>{s}</button>
            ))}
          </div>
        )}

        <div className="chat-input-area">
          <textarea
            className="chat-input"
            ref={inputRef}
            placeholder="Ask any academic question..."
            rows={1}
            onKeyDown={handleKey}
            onInput={(e) => autoResize(e.target)}
          />
          <button className="chat-send" disabled={sending} onClick={() => sendMessage()}>➤</button>
        </div>
      </div>
    </div>
  );
}

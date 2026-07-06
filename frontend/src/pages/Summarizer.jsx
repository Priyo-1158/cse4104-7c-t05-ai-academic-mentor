import { useState } from 'react';
import AppLayout from '../layouts/AppLayout';
import { DataStore, Notifications } from '../services/localStore';
import { GeminiAPI, BackendAPI } from '../services/aiApi';
import { formatMarkdown, timeAgo } from '../utils/helpers';
import './Summarizer.css';

const TYPE_INSTRUCTIONS = {
  concise: 'Create a concise summary highlighting the most important points. Keep it brief and memorable.',
  detailed: 'Create a comprehensive, detailed summary covering all key concepts, definitions, and important points with clear structure.',
  bullets: 'Create a well-organized bullet-point summary with main headings and sub-points. Use hierarchical structure.',
  exam: 'Create an exam-ready summary with: Key Concepts, Important Definitions, Common Exam Topics, and Quick Review Points.'
};

const SUM_TYPES = [
  { key: 'concise', label: '📌 Concise' },
  { key: 'detailed', label: '📋 Detailed' },
  { key: 'bullets', label: '• Bullet Points' },
  { key: 'exam', label: '🎯 Exam Ready' }
];

export default function Summarizer() {
  const [sumType, setSumType] = useState('concise');
  const [subject, setSubject] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState(null); // html string
  const [outputError, setOutputError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState(() => DataStore.get('summaries') || []);

  function loadSummary(i) {
    const s = history[i];
    if (!s) return;
    setOutput(formatMarkdown(s.content));
    setOutputError(null);
  }

  async function summarize() {
    const trimmed = notes.trim();
    if (!trimmed) { alert('Please paste your notes first.'); return; }
    if (trimmed.length < 50) { alert('Notes are too short to summarize. Please add more content.'); return; }

    setLoading(true);
    setOutputError(null);
    setOutput('__LOADING__');

    const prompt = `You are an expert academic summarizer for university students.

${subject ? `Subject/Topic: ${subject}` : ''}
Summary style: ${TYPE_INSTRUCTIONS[sumType]}

Notes to summarize:
"""
${trimmed}
"""

Create a clear, structured, easy-to-study summary. Use proper headings, bullet points where appropriate. Make it suitable for university-level exam preparation. Format it nicely with markdown (bold for key terms, headers for sections).`;

    try {
      const result = await GeminiAPI.call(prompt);
      setOutput(formatMarkdown(result));

      const updated = DataStore.push('summaries', {
        subject: subject || 'Untitled',
        preview: trimmed.slice(0, 60) + '...',
        content: result,
        type: sumType,
        date: new Date().toISOString()
      });
      setHistory(updated);
      Notifications.add(`Summary created: ${subject || 'Notes'} 📝`, 'info');

      BackendAPI.saveSummary({
        title: subject || 'Untitled Note',
        originalText: trimmed,
        summary: result,
        subject: subject || null,
        style: sumType
      }).then(res => {
        if (res.demoMode) console.warn('Summary saved in DEMO MODE — MongoDB not connected.');
        else console.log('✅ Summary saved to MongoDB.');
      }).catch(err => console.error('Failed to save summary to backend:', err.message));
    } catch (err) {
      setOutput(null);
      setOutputError(err.message);
    }
    setLoading(false);
  }

  function copySummary() {
    const el = document.getElementById('outputBox');
    const text = el ? el.innerText : '';
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <AppLayout title="📝 AI Note Summarizer" subtitle="Compress dense notes into clear, memorable summaries" bodyClassName="wide" bodyStyle={{ padding: 28, maxWidth: 1100 }}>
        <div className="sum-layout">

          <div>
            <div className="card" style={{ marginBottom: 16 }}>
              <div className="card-title" style={{ marginBottom: 12 }}>Paste Your Notes</div>
              <div className="sum-options">
                {SUM_TYPES.map(t => (
                  <button key={t.key} className={`sum-opt-btn${sumType === t.key ? ' active' : ''}`} onClick={() => setSumType(t.key)}>{t.label}</button>
                ))}
              </div>
              <div className="form-group" style={{ marginBottom: 8 }}>
                <label>Subject / Topic (optional)</label>
                <input type="text" className="form-input" placeholder="e.g. Operating Systems, Data Structures..." value={subject} onChange={e => setSubject(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Your Notes</label>
                <textarea className="form-input" style={{ minHeight: 280, resize: 'vertical' }} placeholder="Paste your lecture notes, textbook content, or any study material here..."
                  value={notes} onChange={e => setNotes(e.target.value)} />
                <div className="char-count">{notes.length.toLocaleString()} characters</div>
              </div>
              <button className="btn-primary" disabled={loading} onClick={summarize} style={{ width: '100%', justifyContent: 'center', marginTop: 4 }}>
                {loading ? <><span className="spinner" /> Summarizing...</> : '📝 Summarize Notes'}
              </button>
            </div>

            <div className="card">
              <div className="card-title" style={{ marginBottom: 12 }}>Previous Summaries</div>
              <div>
                {!history.length ? (
                  <div style={{ color: 'var(--text-3)', fontSize: '0.82rem' }}>No summaries yet</div>
                ) : history.slice(0, 4).map((s, i) => (
                  <div className="history-card" key={i} onClick={() => loadSummary(i)}>
                    <strong>{s.subject || s.preview}</strong>
                    <span>{s.type} · {timeAgo(s.date)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="sum-output">
            <div className="card" style={{ height: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <div className="card-title">AI Summary</div>
                {output && output !== '__LOADING__' && (
                  <button className="btn-ghost" onClick={copySummary} style={{ fontSize: '0.8rem' }}>{copied ? '✓ Copied!' : '📋 Copy'}</button>
                )}
              </div>
              <div className="output-box" id="outputBox">
                {!output && !outputError && (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: 250, textAlign: 'center', color: 'var(--text-3)' }}>
                    <div style={{ fontSize: '3rem', marginBottom: 16 }}>📝</div>
                    <p style={{ maxWidth: 280 }}>Your AI-generated summary will appear here. Paste your notes and click Summarize.</p>
                  </div>
                )}
                {output === '__LOADING__' && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 200 }}>
                    <div className="typing-dots"><span></span><span></span><span></span></div>
                  </div>
                )}
                {output && output !== '__LOADING__' && <div dangerouslySetInnerHTML={{ __html: output }} />}
                {outputError && <div className="alert alert-error">Error: {outputError}</div>}
              </div>
            </div>
          </div>

        </div>
    </AppLayout>
  );
}

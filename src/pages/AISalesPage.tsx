// ─────────────────────────────────────────────────────────────
//  AMML — AI Sales Suite Page (RAG-powered)
// ─────────────────────────────────────────────────────────────

import React, { useState, useRef, useEffect } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  sources?: number;
}

const RAG_ENDPOINT = 'https://jedi.zo.space/api/amml-rag';

// Example questions users might ask
const SUGGESTIONS = [
  "What is the late penalty per occurrence?",
  "How is bi-weekly payroll calculated?",
  "What is the attendance rate target per market?",
  "Who is the manager of Gudu Market?",
  "Can a Supervisor delete attendance records?",
];

export default function AISalesPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `👋 I'm AMML Assistant — I can answer questions about attendance policy, payroll, leave, market operations, HR compliance, and disciplinary procedures.

Ask me anything about how AMML works.`,
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [apiConfigured, setApiConfigured] = useState<boolean | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Check if API is configured on mount
  useEffect(() => {
    fetch(RAG_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: 'test' }),
    })
      .then(r => r.json())
      .then(data => setApiConfigured(!data.error || data.error !== 'RAG is not configured'))
      .catch(() => setApiConfigured(false));
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function handleSend(text?: string) {
    const question = (text ?? input).trim();
    if (!question || loading) return;
    setInput('');
    setMessages(m => [...m, { role: 'user', content: question }]);
    setLoading(true);

    try {
      const res = await fetch(RAG_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: question }),
      });
      const data = await res.json();
      setMessages(m => [
        ...m,
        {
          role: 'assistant',
          content: data.answer ?? 'No answer received.',
          sources: data.sources,
        },
      ]);
    } catch {
      setMessages(m => [
        ...m,
        { role: 'assistant', content: '❌ Could not reach the knowledge base. Please try again.' },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="page active">
      {/* Header */}
      <div className="ph">
        <div className="ph-l">
          <h2>🤖 AMML Assistant</h2>
          <p>RAG-powered knowledge base · {messages.length - 1} questions asked</p>
        </div>
        <div className="ph-r">
          <span
            style={{
              fontSize: 12,
              padding: '5px 14px',
              borderRadius: 99,
              fontWeight: 700,
              background: apiConfigured === false ? 'rgba(192,57,43,.1)' : apiConfigured === true ? 'rgba(40,140,40,.1)' : 'var(--surface3)',
              color: apiConfigured === false ? '#C0392B' : apiConfigured === true ? 'var(--green-logo)' : 'var(--text3)',
            }}
          >
            {apiConfigured === null ? '⏳ Checking...' : apiConfigured ? '⚡ RAG Active' : '⚙️ Not Configured'}
          </span>
        </div>
      </div>

      {/* Chat area */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: 0,
          minHeight: 0,
        }}
      >
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            padding: '16px 0',
          }}
        >
          {messages.map((msg, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start',
                gap: 4,
              }}
            >
              <div
                style={{
                  maxWidth: '75%',
                  padding: '10px 14px',
                  borderRadius: msg.role === 'user'
                    ? '14px 14px 2px 14px'
                    : '14px 14px 14px 2px',
                  background: msg.role === 'user'
                    ? 'var(--blue)'
                    : 'var(--surface2)',
                  color: msg.role === 'user' ? '#fff' : 'var(--text)',
                  fontSize: 13,
                  lineHeight: 1.5,
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                }}
              >
                {msg.content}
                {msg.sources !== undefined && msg.sources > 0 && (
                  <div
                    style={{
                      marginTop: 6,
                      fontSize: 10,
                      opacity: 0.6,
                      fontStyle: 'italic',
                    }}
                  >
                    📚 {msg.sources} source{msg.sources > 1 ? 's' : ''} retrieved
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text3)', fontSize: 13 }}>
              <div
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: 'var(--text3)',
                  animation: 'pulse 1s ease-in-out infinite',
                }}
              />
              Thinking...
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Suggestions (shown before first question) */}
        {messages.length === 1 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, padding: '8px 0 12px' }}>
            {SUGGESTIONS.map((s, i) => (
              <button
                key={i}
                onClick={() => handleSend(s)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 99,
                  border: '1.5px solid var(--border)',
                  background: 'var(--surface)',
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: 'pointer',
                  color: 'var(--text2)',
                  fontFamily: 'inherit',
                }}
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div
          style={{
            display: 'flex',
            gap: 8,
            alignItems: 'flex-end',
            padding: '12px 0 0',
            borderTop: '1px solid var(--border)',
          }}
        >
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about AMML policies, payroll, attendance, HR…"
            rows={1}
            style={{
              flex: 1,
              padding: '10px 14px',
              borderRadius: 'var(--r)',
              border: '1.5px solid var(--border)',
              fontSize: 13,
              fontFamily: 'inherit',
              background: 'var(--surface)',
              color: 'var(--text)',
              resize: 'none',
              outline: 'none',
              minHeight: 44,
              maxHeight: 120,
              overflowY: 'auto',
            }}
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || loading}
            style={{
              padding: '10px 20px',
              borderRadius: 'var(--r)',
              border: 'none',
              background: input.trim() && !loading ? 'var(--blue)' : 'var(--surface3)',
              color: input.trim() && !loading ? '#fff' : 'var(--text3)',
              fontWeight: 700,
              fontSize: 13,
              cursor: input.trim() && !loading ? 'pointer' : 'default',
              fontFamily: 'inherit',
              transition: 'background 0.15s',
            }}
          >
            {loading ? '...' : 'Send'}
          </button>
        </div>

        {apiConfigured === false && (
          <div
            style={{
              marginTop: 10,
              padding: '10px 14px',
              borderRadius: 'var(--r-sm)',
              background: 'rgba(192,57,43,.08)',
              border: '1px solid rgba(192,57,43,.2)',
              fontSize: 12,
              color: '#C0392B',
            }}
          >
            ⚠️ RAG is not configured. Set <code>OPENAI_API_KEY</code> in Settings &gt; Advanced to enable the knowledge base.
          </div>
        )}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}

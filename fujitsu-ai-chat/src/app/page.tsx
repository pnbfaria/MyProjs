'use client';

import { useState, useRef, useEffect, useCallback, FormEvent, KeyboardEvent } from 'react';
import { renderMarkdown } from '@/lib/markdown';

/* ─── Types ─── */
interface Source {
  title: string;
  url?: string;
  snippet: string;
  relevance?: number;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: Source[];
  timestamp: Date;
}

interface Thread {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
}

/* ─── Icons (inline SVG) ─── */
const PlusIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
);
const SendIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
);
const ChevronIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg>
);
const MenuIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
);
const DocIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{width:14,height:14}}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
);

/* ─── Suggested Prompts ─── */
const SUGGESTED = [
  { icon: '📋', text: 'What is the EU AI Act and how does it affect us?' },
  { icon: '🤖', text: 'Tell me about IBM watsonx Orchestrate' },
  { icon: '🏢', text: 'What does Fujitsu do?' },
  { icon: '💡', text: 'How can AI improve business operations?' },
];

/* ─── Main Component ─── */
export default function Home() {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [openSources, setOpenSources] = useState<Set<string>>(new Set());

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const activeThread = threads.find(t => t.id === activeThreadId) || null;
  const messages = activeThread?.messages || [];

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, isLoading]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [input]);

  const createThread = useCallback((firstMessage?: string): string => {
    const id = `thread-${Date.now()}`;
    const title = firstMessage
      ? firstMessage.slice(0, 50) + (firstMessage.length > 50 ? '...' : '')
      : 'New conversation';
    const thread: Thread = { id, title, messages: [], createdAt: new Date() };
    setThreads(prev => [thread, ...prev]);
    setActiveThreadId(id);
    setSidebarOpen(false);
    return id;
  }, []);

  const toggleSources = useCallback((msgId: string) => {
    setOpenSources(prev => {
      const next = new Set(prev);
      if (next.has(msgId)) next.delete(msgId);
      else next.add(msgId);
      return next;
    });
  }, []);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isLoading) return;

    const threadId = activeThreadId || createThread(content);

    const userMsg: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
    };

    setThreads(prev =>
      prev.map(t =>
        t.id === threadId
          ? { ...t, messages: [...t.messages, userMsg], title: t.messages.length === 0 ? content.trim().slice(0, 50) : t.title }
          : t
      )
    );
    setInput('');
    setIsLoading(true);

    try {
      const currentThread = threads.find(t => t.id === threadId);
      const allMessages = [...(currentThread?.messages || []), userMsg];

      const resp = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: allMessages.map(m => ({ role: m.role, content: m.content })),
        }),
      });

      if (!resp.ok) throw new Error('Failed to get response');

      const data = await resp.json();

      const assistantMsg: Message = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: data.content,
        sources: data.sources,
        timestamp: new Date(),
      };

      setThreads(prev =>
        prev.map(t =>
          t.id === threadId
            ? { ...t, messages: [...t.messages.filter(m => m.id !== assistantMsg.id), assistantMsg] }
            : t
        )
      );

      // Auto-open sources if present
      if (data.sources?.length > 0) {
        setOpenSources(prev => new Set(prev).add(assistantMsg.id));
      }
    } catch (err) {
      console.error('Chat error:', err);
      const errorMsg: Message = {
        id: `msg-err-${Date.now()}`,
        role: 'assistant',
        content: 'Sorry, I encountered an error processing your request. Please try again.',
        timestamp: new Date(),
      };
      setThreads(prev =>
        prev.map(t =>
          t.id === threadId ? { ...t, messages: [...t.messages, errorMsg] } : t
        )
      );
    } finally {
      setIsLoading(false);
    }
  }, [activeThreadId, createThread, isLoading, threads]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const handleNewChat = () => {
    createThread();
  };

  return (
    <div className="app-layout">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <div className="logo-mark">F</div>
            <div>
              <div className="logo-text">Fujitsu</div>
              <div className="logo-sub">AI Assistant</div>
            </div>
          </div>
          <button className="new-chat-btn" onClick={handleNewChat}>
            <PlusIcon />
            New conversation
          </button>
        </div>

        <div className="sidebar-threads">
          {threads.map(thread => (
            <div
              key={thread.id}
              className={`thread-item ${thread.id === activeThreadId ? 'active' : ''}`}
              onClick={() => { setActiveThreadId(thread.id); setSidebarOpen(false); }}
            >
              <div className="thread-title">{thread.title}</div>
              <div className="thread-preview">
                {thread.messages.length > 0
                  ? `${thread.messages.length} message${thread.messages.length > 1 ? 's' : ''}`
                  : 'Empty'}
              </div>
            </div>
          ))}
          {threads.length === 0 && (
            <div style={{ padding: '20px 12px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 12 }}>
              No conversations yet.<br />Start a new one above.
            </div>
          )}
        </div>

        <div className="sidebar-footer">
          <div className="powered-by">
            Powered by <span>IBM watsonx</span>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="chat-main">
        {/* Header */}
        <div className="chat-header">
          <div className="header-left">
            <button className="menu-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
              <MenuIcon />
            </button>
            <div>
              <div className="header-title">Fujitsu AI Assistant</div>
              <div className="header-status">
                <span className="status-dot mock" />
                Demo Mode
              </div>
            </div>
          </div>
        </div>

        {/* Messages or Welcome */}
        {messages.length === 0 && !isLoading ? (
          <div className="welcome-screen">
            <div className="welcome-logo">F</div>
            <h1 className="welcome-title">Fujitsu AI Assistant</h1>
            <p className="welcome-subtitle">
              Your intelligent enterprise companion powered by IBM watsonx. Ask me anything — I&apos;ll provide answers with source citations.
            </p>
            <div className="welcome-prompts">
              {SUGGESTED.map((s, i) => (
                <button key={i} className="prompt-card" onClick={() => sendMessage(s.text)}>
                  <div className="prompt-icon">{s.icon}</div>
                  <div className="prompt-text">{s.text}</div>
                </button>
              ))}
            </div>
            <div className="welcome-badge">
              <DocIcon />
              Answers include source citations
            </div>
          </div>
        ) : (
          <div className="messages-container">
            <div className="messages-inner">
              {messages.map(msg => (
                <div key={msg.id} className={`message ${msg.role === 'user' ? 'user-msg' : 'assistant-msg'}`}>
                  <div className="message-header">
                    <div className={`message-avatar ${msg.role}`}>
                      {msg.role === 'user' ? 'U' : 'F'}
                    </div>
                    <span className="message-role">
                      {msg.role === 'user' ? 'You' : 'Fujitsu AI'}
                    </span>
                  </div>
                  <div
                    className="message-content"
                    dangerouslySetInnerHTML={{
                      __html: msg.role === 'assistant'
                        ? renderMarkdown(msg.content)
                        : `<p>${msg.content}</p>`,
                    }}
                  />

                  {/* Sources */}
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="sources-panel">
                      <button
                        className={`sources-toggle ${openSources.has(msg.id) ? 'open' : ''}`}
                        onClick={() => toggleSources(msg.id)}
                      >
                        <DocIcon />
                        {msg.sources.length} source{msg.sources.length > 1 ? 's' : ''}
                        <ChevronIcon />
                      </button>

                      {openSources.has(msg.id) && (
                        <div className="sources-list">
                          {msg.sources.map((src, idx) => (
                            <a
                              key={idx}
                              className="source-card"
                              href={src.url || '#'}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={e => { if (!src.url) e.preventDefault(); }}
                            >
                              <div className="source-number">{idx + 1}</div>
                              <div className="source-title">{src.title}</div>
                              <div className="source-snippet">{src.snippet}</div>
                              {src.url && <div className="source-url">{src.url}</div>}
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}

              {/* Typing indicator */}
              {isLoading && (
                <div className="message assistant-msg">
                  <div className="message-header">
                    <div className="message-avatar assistant">F</div>
                    <span className="message-role">Fujitsu AI</span>
                  </div>
                  <div className="message-content">
                    <div className="typing-indicator">
                      <div className="dot" />
                      <div className="dot" />
                      <div className="dot" />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>
        )}

        {/* Input */}
        <div className="chat-input-wrapper">
          <div className="chat-input-container">
            <form onSubmit={handleSubmit} className="chat-input-box">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask me anything..."
                rows={1}
                disabled={isLoading}
              />
              <button
                type="submit"
                className="send-btn"
                disabled={!input.trim() || isLoading}
                aria-label="Send message"
              >
                <SendIcon />
              </button>
            </form>
            <div className="input-hint">
              Press Enter to send · Shift+Enter for new line
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

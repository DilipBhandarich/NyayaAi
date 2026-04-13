import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Bot,
  User,
  SendHorizontal,
  MessageSquare,
  Sparkles,
} from 'lucide-react';
import { chatApi } from '../api/chat.api.js';
import { casesApi } from '../api/cases.api.js';
import Button from '../components/ui/Button.jsx';
import Spinner from '../components/ui/Spinner.jsx';

/* ------------------------------------------------------------------ */
/*  Suggested quick-action chips shown when the chat is empty          */
/* ------------------------------------------------------------------ */
const SUGGESTIONS = [
  'Summarize this case',
  'What are the key legal issues?',
  'Similar precedents?',
  'What are the possible outcomes?',
  'Explain the timeline of events',
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */
function formatTime(id) {
  try {
    const ts = typeof id === 'string' && id.includes('-') ? parseInt(id.split('-').pop(), 10) : null;
    if (ts && ts > 1_600_000_000_000) {
      return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    if (typeof id === 'string' && /^[a-f0-9]{24}$/.test(id)) {
      const sec = parseInt(id.substring(0, 8), 16);
      return new Date(sec * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
  } catch { /* ignore */ }
  return null;
}

/* ------------------------------------------------------------------ */
/*  Typing indicator (three bouncing dots)                             */
/* ------------------------------------------------------------------ */
function TypingIndicator() {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px', justifyContent: 'flex-start' }}>
      {/* avatar */}
      <div
        style={{
          flexShrink: 0,
          width: '32px',
          height: '32px',
          borderRadius: '9999px',
          background: 'linear-gradient(to bottom right, #8b5cf6, #4f46e5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 10px 15px -3px rgba(199,210,254,0.5)',
        }}
      >
        <Bot size={16} style={{ color: 'white' }} />
      </div>

      <div
        style={{
          padding: '14px 20px',
          borderRadius: '16px',
          borderBottomLeftRadius: '4px',
          backgroundColor: 'rgba(255,255,255,0.7)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid rgba(255,255,255,0.4)',
          boxShadow: '0 10px 40px rgba(0,0,0,0.03)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              style={{
                display: 'block',
                width: '8px',
                height: '8px',
                borderRadius: '9999px',
                backgroundColor: '#818cf8',
              }}
              animate={{ y: [0, -6, 0] }}
              transition={{
                duration: 0.6,
                repeat: Infinity,
                delay: i * 0.15,
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Single message bubble                                              */
/* ------------------------------------------------------------------ */
function MessageBubble({ msg, index }) {
  const isUser = msg.role === 'user';
  const time = formatTime(msg._id);
  const [bubbleHovered, setBubbleHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.04, 0.2), ease: [0.25, 0.46, 0.45, 0.94] }}
      style={{
        display: 'flex',
        alignItems: 'flex-end',
        gap: '12px',
        justifyContent: isUser ? 'flex-end' : 'flex-start',
      }}
    >
      {/* AI avatar (left) */}
      {!isUser && (
        <div
          style={{
            flexShrink: 0,
            width: '32px',
            height: '32px',
            borderRadius: '9999px',
            background: 'linear-gradient(to bottom right, #8b5cf6, #4f46e5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 10px 15px -3px rgba(199,210,254,0.5)',
          }}
        >
          <Sparkles size={14} style={{ color: 'white' }} />
        </div>
      )}

      {/* Bubble */}
      <div
        style={{
          position: 'relative',
          maxWidth: '75%',
          ...(isUser ? { order: -1 } : {}),
        }}
        onMouseEnter={() => setBubbleHovered(true)}
        onMouseLeave={() => setBubbleHovered(false)}
      >
        <div
          style={{
            padding: '12px 16px',
            fontSize: '14px',
            lineHeight: '1.625',
            whiteSpace: 'pre-wrap',
            overflowWrap: 'break-word',
            wordBreak: 'break-word',
            ...(isUser
              ? {
                  background: 'linear-gradient(to bottom right, #4f46e5, #2563eb)',
                  color: 'white',
                  borderRadius: '16px',
                  borderBottomRightRadius: '4px',
                  boxShadow: '0 10px 15px -3px rgba(165,180,252,0.3)',
                }
              : {
                  backgroundColor: 'rgba(255,255,255,0.7)',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255,255,255,0.4)',
                  color: '#1f2937',
                  borderRadius: '16px',
                  borderBottomLeftRadius: '4px',
                  boxShadow: '0 10px 40px rgba(0,0,0,0.03)',
                }),
          }}
        >
          {msg.content}
        </div>
        {time && (
          <span
            style={{
              display: 'block',
              marginTop: '4px',
              fontSize: '10px',
              color: '#9ca3af',
              opacity: bubbleHovered ? 1 : 0,
              transition: 'opacity 0.2s',
              textAlign: isUser ? 'right' : 'left',
              paddingLeft: isUser ? 0 : '4px',
              paddingRight: isUser ? '4px' : 0,
            }}
          >
            {time}
          </span>
        )}
      </div>

      {/* User avatar (right) */}
      {isUser && (
        <div
          style={{
            flexShrink: 0,
            width: '32px',
            height: '32px',
            borderRadius: '9999px',
            background: 'linear-gradient(to bottom right, #3b82f6, #06b6d4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 10px 15px -3px rgba(191,219,254,0.5)',
          }}
        >
          <User size={14} style={{ color: 'white' }} />
        </div>
      )}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Empty state                                                        */
/* ------------------------------------------------------------------ */
function EmptyState({ onSuggestionClick }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        userSelect: 'none',
      }}
    >
      <div
        style={{
          width: '80px',
          height: '80px',
          borderRadius: '16px',
          background: 'linear-gradient(to bottom right, #e0e7ff, #dbeafe)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '24px',
          boxShadow: 'inset 0 2px 4px 0 rgba(0,0,0,0.05)',
        }}
      >
        <MessageSquare size={36} style={{ color: '#818cf8' }} strokeWidth={1.5} />
      </div>
      <h3
        style={{
          fontSize: '20px',
          fontWeight: 600,
          color: '#374151',
          marginBottom: '4px',
        }}
      >
        Start a conversation
      </h3>
      <p
        style={{
          fontSize: '14px',
          color: '#9ca3af',
          marginBottom: '32px',
          maxWidth: '320px',
          textAlign: 'center',
        }}
      >
        Ask questions about this case and get AI-powered legal insights.
      </p>

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: '8px',
          maxWidth: '28rem',
        }}
      >
        {SUGGESTIONS.map((s) => (
          <motion.button
            key={s}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onSuggestionClick(s)}
            style={{
              padding: '8px 16px',
              fontSize: '12px',
              fontWeight: 500,
              borderRadius: '9999px',
              backgroundColor: 'rgba(255,255,255,0.7)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              border: '1px solid rgba(255,255,255,0.5)',
              color: '#4f46e5',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
              transition: 'background-color 0.2s, border-color 0.2s',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#eef2ff';
              e.currentTarget.style.borderColor = '#c7d2fe';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.7)';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.5)';
            }}
          >
            {s}
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main ChatPage component                                            */
/* ------------------------------------------------------------------ */
export default function ChatPage() {
  const { id } = useParams();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [caseTitle, setCaseTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [inputFocused, setInputFocused] = useState(false);
  const [sendHovered, setSendHovered] = useState(false);
  const [backHovered, setBackHovered] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  /* -- Fetch history & case title ---------------------------------- */
  useEffect(() => {
    Promise.all([
      chatApi.getHistory(id, { limit: 50 }).catch(() => ({ messages: [] })),
      casesApi.getById(id).catch(() => ({})),
    ]).then(([chatData, caseData]) => {
      setMessages(chatData.messages || []);
      setCaseTitle((caseData.case || caseData)?.title || 'Case');
    }).finally(() => setLoading(false));
  }, [id]);

  /* -- Auto-scroll ------------------------------------------------- */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending]);

  /* -- Send handler ------------------------------------------------ */
  const handleSend = async (e) => {
    if (e) e.preventDefault();
    if (!input.trim() || sending) return;
    const msg = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: msg, _id: 'temp-' + Date.now() }]);
    setSending(true);
    try {
      const data = await chatApi.send(id, msg);
      setMessages((prev) => [
        ...prev.filter((m) => !m._id?.startsWith('temp-')),
        { role: 'user', content: msg, _id: data.userMessage?._id || 'u-' + Date.now() },
        { role: 'assistant', content: data.reply || data.assistantMessage?.content, _id: data.assistantMessage?._id || 'a-' + Date.now() },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.', _id: 'err-' + Date.now() },
      ]);
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  /* -- Suggestion chip click --------------------------------------- */
  const handleSuggestion = (text) => {
    setInput(text);
    setTimeout(() => {
      setInput(text);
      if (sending) return;
      setInput('');
      setMessages((prev) => [...prev, { role: 'user', content: text, _id: 'temp-' + Date.now() }]);
      setSending(true);
      chatApi.send(id, text).then((data) => {
        setMessages((prev) => [
          ...prev.filter((m) => !m._id?.startsWith('temp-')),
          { role: 'user', content: text, _id: data.userMessage?._id || 'u-' + Date.now() },
          { role: 'assistant', content: data.reply || data.assistantMessage?.content, _id: data.assistantMessage?._id || 'a-' + Date.now() },
        ]);
      }).catch(() => {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.', _id: 'err-' + Date.now() },
        ]);
      }).finally(() => {
        setSending(false);
        inputRef.current?.focus();
      });
    }, 0);
  };

  /* -- Loading state ------------------------------------------------ */
  if (loading) return <Spinner size="lg" />;

  /* -- Render ------------------------------------------------------ */
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: 'calc(100vh - 10rem)',
        position: 'relative',
      }}
    >

      {/* ============  HEADER  ============ */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          padding: '14px 20px',
          borderRadius: '16px',
          marginBottom: '12px',
          backgroundColor: 'rgba(255,255,255,0.6)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.4)',
          boxShadow: '0 10px 40px rgba(0,0,0,0.03)',
        }}
      >
        <Link
          to={`/cases/${id}`}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '14px',
            fontWeight: 500,
            color: backHovered ? '#4f46e5' : '#6b7280',
            transition: 'color 0.2s',
            textDecoration: 'none',
          }}
          onMouseEnter={() => setBackHovered(true)}
          onMouseLeave={() => setBackHovered(false)}
        >
          <ArrowLeft
            size={16}
            style={{
              transform: backHovered ? 'translateX(-2px)' : 'translateX(0)',
              transition: 'transform 0.2s',
            }}
          />
          <span>Back</span>
        </Link>

        <div style={{ width: '1px', height: '24px', backgroundColor: '#e5e7eb' }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
          <div
            style={{
              flexShrink: 0,
              width: '36px',
              height: '36px',
              borderRadius: '12px',
              background: 'linear-gradient(to bottom right, #6366f1, #2563eb)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 6px -1px rgba(199,210,254,0.5)',
            }}
          >
            <Bot size={18} style={{ color: 'white' }} />
          </div>
          <div style={{ minWidth: 0 }}>
            <h3
              style={{
                fontWeight: 600,
                color: '#1f2937',
                fontSize: '14px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                lineHeight: '1.25',
              }}
            >
              {caseTitle}
            </h3>
            <p
              style={{
                fontSize: '10px',
                color: '#9ca3af',
                lineHeight: '1.25',
                marginTop: '2px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <Sparkles size={9} style={{ color: '#818cf8' }} />
              Powered by Gemini AI
            </p>
          </div>
        </div>
      </motion.div>

      {/* ============  MESSAGES AREA  ============ */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px 8px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          scrollBehavior: 'smooth',
          scrollbarWidth: 'thin',
          scrollbarColor: '#c7d2fe transparent',
        }}
      >
        {messages.length === 0 && !sending ? (
          <EmptyState onSuggestionClick={handleSuggestion} />
        ) : (
          <>
            <AnimatePresence mode="popLayout">
              {messages.map((msg, i) => (
                <MessageBubble key={msg._id} msg={msg} index={i} />
              ))}
            </AnimatePresence>

            {/* Typing indicator */}
            <AnimatePresence>
              {sending && (
                <motion.div
                  key="typing"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25 }}
                >
                  <TypingIndicator />
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
        <div ref={bottomRef} />
      </div>

      {/* ============  INPUT AREA  ============ */}
      <motion.form
        onSubmit={handleSend}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          paddingTop: '12px',
          marginTop: '4px',
          borderTop: '1px solid rgba(255,255,255,0.4)',
        }}
      >
        <div style={{ flex: 1, position: 'relative' }}>
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onFocus={() => setInputFocused(true)}
            onBlur={() => setInputFocused(false)}
            placeholder="Ask about this case..."
            disabled={sending}
            style={{
              width: '100%',
              padding: '14px 20px',
              paddingRight: '16px',
              fontSize: '14px',
              backgroundColor: 'rgba(255,255,255,0.6)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: inputFocused ? '1px solid #a5b4fc' : '1px solid rgba(255,255,255,0.4)',
              borderRadius: '16px',
              boxShadow: inputFocused
                ? '0 10px 40px rgba(0,0,0,0.03), 0 0 0 3px rgba(224,231,255,1)'
                : '0 10px 40px rgba(0,0,0,0.03)',
              outline: 'none',
              color: '#1f2937',
              transition: 'all 0.2s',
              opacity: sending ? 0.6 : 1,
              cursor: sending ? 'not-allowed' : 'text',
              boxSizing: 'border-box',
            }}
          />
        </div>

        <motion.button
          type="submit"
          disabled={sending || !input.trim()}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.92 }}
          onMouseEnter={() => setSendHovered(true)}
          onMouseLeave={() => setSendHovered(false)}
          style={{
            flexShrink: 0,
            width: '48px',
            height: '48px',
            borderRadius: '16px',
            background: 'linear-gradient(to bottom right, #4f46e5, #2563eb)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: (sending || !input.trim())
              ? 'none'
              : sendHovered
              ? '0 15px 25px -5px rgba(165,180,252,0.5)'
              : '0 10px 15px -3px rgba(165,180,252,0.4)',
            opacity: (sending || !input.trim()) ? 0.4 : 1,
            cursor: (sending || !input.trim()) ? 'not-allowed' : 'pointer',
            transition: 'box-shadow 0.3s, opacity 0.2s',
            border: 'none',
          }}
        >
          <motion.span
            whileHover={{ rotate: -45, scale: 1.15 }}
            transition={{ type: 'spring', stiffness: 300, damping: 15 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <SendHorizontal size={20} />
          </motion.span>
        </motion.button>
      </motion.form>
    </div>
  );
}

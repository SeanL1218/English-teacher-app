import React, { useRef, useEffect, useState } from 'react';

export default function ChatWindow({ messages, isStreaming, onSend }) {
  const [input, setInput] = useState('');
  const bottomRef = useRef(null);
  const textareaRef = useRef(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || isStreaming) return;
    setInput('');
    onSend(text);
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleInput = (e) => {
    setInput(e.target.value);
    // Auto-resize textarea
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
  };

  return (
    <div style={styles.wrapper}>
      {/* Messages */}
      <div style={styles.messages}>
        {messages.map((msg, i) => (
          <MessageBubble key={i} msg={msg} isLast={i === messages.length - 1} isStreaming={isStreaming} />
        ))}
        {isStreaming && messages[messages.length - 1]?.content === '' && (
          <TypingIndicator />
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form style={styles.inputBar} onSubmit={handleSubmit}>
        <div style={styles.inputWrap}>
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder="Type your message in English… (Enter to send, Shift+Enter for new line)"
            style={styles.textarea}
            rows={1}
            disabled={isStreaming}
          />
          <button
            type="submit"
            disabled={!input.trim() || isStreaming}
            style={{
              ...styles.sendBtn,
              background: input.trim() && !isStreaming ? 'var(--primary)' : 'var(--border)',
              cursor: input.trim() && !isStreaming ? 'pointer' : 'default'
            }}
            title="Send message"
          >
            {isStreaming ? '⏳' : '➤'}
          </button>
        </div>
        <div style={styles.hint}>Shift+Enter for new line</div>
      </form>
    </div>
  );
}

function MessageBubble({ msg, isLast, isStreaming }) {
  const isUser = msg.role === 'user';
  const isEmpty = msg.content === '' && isLast && isStreaming;

  if (isEmpty) return null; // Will show TypingIndicator instead

  return (
    <div
      style={{
        ...styles.row,
        justifyContent: isUser ? 'flex-end' : 'flex-start',
        animation: 'fadeIn 0.25s ease'
      }}
    >
      {!isUser && (
        <div style={styles.avatarSmall}>👩‍🏫</div>
      )}
      <div
        style={{
          ...styles.bubble,
          background: isUser ? 'var(--user-bubble)' : 'var(--surface)',
          color: isUser ? 'var(--user-bubble-text)' : 'var(--text-primary)',
          borderRadius: isUser ? '18px 18px 4px 18px' : '4px 18px 18px 18px',
          border: isUser ? 'none' : '1px solid var(--border)',
          boxShadow: isUser ? '0 2px 8px rgba(79,70,229,0.25)' : 'var(--shadow-sm)',
          alignSelf: isUser ? 'flex-end' : 'flex-start'
        }}
      >
        <span style={styles.bubbleText}>{msg.content}</span>
        {isLast && isStreaming && msg.content && (
          <span style={styles.cursor}>▋</span>
        )}
      </div>
      {isUser && (
        <div style={styles.avatarUser}>🧑‍💻</div>
      )}
    </div>
  );
}

function TypingIndicator() {
  return (
    <div style={{ ...styles.row, justifyContent: 'flex-start', animation: 'fadeIn 0.25s ease' }}>
      <div style={styles.avatarSmall}>👩‍🏫</div>
      <div style={{ ...styles.bubble, background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)', borderRadius: '4px 18px 18px 18px' }}>
        <div style={styles.dots}>
          <span style={{ ...styles.dot, animationDelay: '0ms' }} />
          <span style={{ ...styles.dot, animationDelay: '160ms' }} />
          <span style={{ ...styles.dot, animationDelay: '320ms' }} />
        </div>
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    background: 'var(--bg)'
  },
  messages: {
    flex: 1,
    overflowY: 'auto',
    padding: '20px 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  row: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: '8px'
  },
  avatarSmall: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    background: 'var(--primary-bg)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '16px',
    flexShrink: 0
  },
  avatarUser: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    background: '#DBEAFE',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '16px',
    flexShrink: 0
  },
  bubble: {
    maxWidth: '72%',
    padding: '10px 14px',
    lineHeight: '1.55',
    wordBreak: 'break-word',
    position: 'relative'
  },
  bubbleText: {
    fontSize: '14px',
    whiteSpace: 'pre-wrap'
  },
  cursor: {
    display: 'inline-block',
    animation: 'pulse 0.7s infinite',
    marginLeft: '2px',
    fontSize: '14px',
    color: 'var(--primary)'
  },
  dots: {
    display: 'flex',
    gap: '4px',
    padding: '2px 4px'
  },
  dot: {
    width: '7px',
    height: '7px',
    borderRadius: '50%',
    background: 'var(--text-muted)',
    display: 'inline-block',
    animation: 'pulse 1.2s infinite'
  },
  inputBar: {
    padding: '12px 16px',
    borderTop: '1px solid var(--border)',
    background: 'var(--surface)',
    flexShrink: 0
  },
  inputWrap: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: '10px',
    background: 'var(--surface-2)',
    border: '2px solid var(--border)',
    borderRadius: '14px',
    padding: '8px 8px 8px 14px',
    transition: 'border-color 0.2s'
  },
  textarea: {
    flex: 1,
    background: 'transparent',
    border: 'none',
    resize: 'none',
    fontSize: '14px',
    color: 'var(--text-primary)',
    lineHeight: '1.5',
    maxHeight: '120px',
    outline: 'none'
  },
  sendBtn: {
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    border: 'none',
    color: '#fff',
    fontSize: '15px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.15s',
    flexShrink: 0
  },
  hint: {
    fontSize: '11px',
    color: 'var(--text-muted)',
    marginTop: '6px',
    paddingLeft: '4px'
  }
};

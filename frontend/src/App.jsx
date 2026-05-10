import React, { useState, useEffect, useRef, useCallback } from 'react';
import TopicSelector from './components/TopicSelector.jsx';
import ChatWindow from './components/ChatWindow.jsx';
import GrammarPanel from './components/GrammarPanel.jsx';
import ReviewModal from './components/ReviewModal.jsx';
import NotificationSettings from './components/NotificationSettings.jsx';

// ── Notification settings helpers ──────────────────────────────
const DEFAULT_NOTIF_SETTINGS = { enabled: false, time: '09:00', topic: 'daily' };

function loadNotifSettings() {
  try {
    const saved = JSON.parse(localStorage.getItem('chloe_notif') || 'null');
    return saved ? { ...DEFAULT_NOTIF_SETTINGS, ...saved } : DEFAULT_NOTIF_SETTINGS;
  } catch {
    return DEFAULT_NOTIF_SETTINGS;
  }
}

// ── Streak helpers ─────────────────────────────────────────────
function loadStreak() {
  const today = new Date().toDateString();
  const lastActive = localStorage.getItem('chloe_lastActive');
  const saved = parseInt(localStorage.getItem('chloe_streak') || '0', 10);

  if (lastActive === today) return saved;

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  const next = lastActive === yesterday.toDateString() ? saved + 1 : 1;
  localStorage.setItem('chloe_streak', String(next));
  localStorage.setItem('chloe_lastActive', today);
  return next;
}

function loadCards() {
  try {
    return JSON.parse(localStorage.getItem('chloe_cards') || '[]');
  } catch {
    return [];
  }
}

// ── App ────────────────────────────────────────────────────────
export default function App() {
  const [phase, setPhase] = useState('topic');   // 'topic' | 'chat'
  const [topic, setTopic] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [grammarResult, setGrammarResult] = useState(null);
  const [grammarLoading, setGrammarLoading] = useState(false);
  const [cards, setCards] = useState(loadCards);
  const [showCards, setShowCards] = useState(false);
  const [streak, setStreak] = useState(loadStreak);
  const [cardsGenerating, setCardsGenerating] = useState(false);
  const [notifSettings, setNotifSettings] = useState(loadNotifSettings);
  const [showNotifSettings, setShowNotifSettings] = useState(false);
  const [notifPermission, setNotifPermission] = useState(
    typeof Notification !== 'undefined' ? Notification.permission : 'denied'
  );
  const messageCountRef = useRef(0);
  const lastFireDateRef = useRef(localStorage.getItem('chloe_notif_lastFired') || '');

  // Save cards to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('chloe_cards', JSON.stringify(cards));
  }, [cards]);

  // ── Topic select → fetch greeting ────────────────────────────
  const handleTopicSelect = useCallback(async (selectedTopic) => {
    setTopic(selectedTopic);
    setPhase('chat');
    setMessages([]);
    setGrammarResult(null);
    messageCountRef.current = 0;

    try {
      const res = await fetch(`/api/greeting/${selectedTopic}`);
      const { greeting } = await res.json();
      setMessages([{ role: 'assistant', content: greeting }]);
    } catch {
      setMessages([{ role: 'assistant', content: "Hi! I'm Chloe, your English teacher. Let's practice together!" }]);
    }
  }, []);

  // ── Notification: start chat with Chloe's generated opener ───
  const startChatFromNotification = useCallback(async (selectedTopic) => {
    setTopic(selectedTopic);
    setPhase('chat');
    setMessages([]);
    setGrammarResult(null);
    messageCountRef.current = 0;

    try {
      const res = await fetch(`/api/conversation-starter/${selectedTopic}`);
      const { message } = await res.json();
      setMessages([{ role: 'assistant', content: message }]);
    } catch {
      try {
        const res = await fetch(`/api/greeting/${selectedTopic}`);
        const { greeting } = await res.json();
        setMessages([{ role: 'assistant', content: greeting }]);
      } catch {
        setMessages([{ role: 'assistant', content: "Hi! Ready to practice some English with me? 😊" }]);
      }
    }
  }, []);

  // ── Notification: persist settings ───────────────────────────
  const handleSaveNotifSettings = useCallback((next) => {
    setNotifSettings(next);
    localStorage.setItem('chloe_notif', JSON.stringify(next));
  }, []);

  const handleRequestNotifPermission = useCallback(async () => {
    if (typeof Notification === 'undefined') return 'denied';
    const result = await Notification.requestPermission();
    setNotifPermission(result);
    return result;
  }, []);

  // ── Notification: minute-tick scheduler ──────────────────────
  useEffect(() => {
    if (!notifSettings.enabled || notifPermission !== 'granted') return;

    const fireNotification = () => {
      const today = new Date().toDateString();
      if (lastFireDateRef.current === today) return;

      const notif = new Notification('Chloe 👩‍🏫', {
        body: "Hey! It's time to practice English. Tap to start chatting with me 😊",
        icon: '/favicon.ico',
        tag: 'chloe-daily',
        requireInteraction: true
      });
      notif.onclick = () => {
        window.focus();
        startChatFromNotification(notifSettings.topic);
        notif.close();
      };

      lastFireDateRef.current = today;
      localStorage.setItem('chloe_notif_lastFired', today);
    };

    const check = () => {
      const now = new Date();
      const [h, m] = notifSettings.time.split(':').map(Number);
      if (now.getHours() === h && now.getMinutes() === m) {
        fireNotification();
      }
    };

    check();
    const id = setInterval(check, 30 * 1000);
    return () => clearInterval(id);
  }, [notifSettings, notifPermission, startChatFromNotification]);

  // ── Grammar analysis ─────────────────────────────────────────
  const analyzeGrammar = useCallback(async (text) => {
    setGrammarLoading(true);
    setGrammarResult(null);
    try {
      const res = await fetch('/api/grammar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });
      const result = await res.json();
      setGrammarResult(result);
    } catch {
      setGrammarResult(null);
    } finally {
      setGrammarLoading(false);
    }
  }, []);

  // ── Auto-generate review cards every 5 exchanges ─────────────
  const generateCards = useCallback(async (currentMessages) => {
    if (currentMessages.length < 4) return;
    setCardsGenerating(true);
    try {
      const conversationText = currentMessages
        .map(m => `${m.role === 'user' ? 'Student' : 'Chloe'}: ${m.content}`)
        .join('\n');
      const res = await fetch('/api/review-cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversation: conversationText, topic })
      });
      const newCards = await res.json();
      if (Array.isArray(newCards) && newCards.length > 0) {
        setCards(prev => {
          const merged = [...prev, ...newCards];
          return merged.filter((c, i, self) =>
            i === self.findIndex(x => x.word.toLowerCase() === c.word.toLowerCase())
          );
        });
      }
    } catch {
      // silently ignore
    } finally {
      setCardsGenerating(false);
    }
  }, [topic]);

  // ── Send user message ─────────────────────────────────────────
  const handleSend = useCallback(async (text) => {
    if (!text.trim() || isStreaming) return;

    const userMsg = { role: 'user', content: text.trim() };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setIsStreaming(true);
    messageCountRef.current += 1;

    // Grammar analysis fires in parallel
    analyzeGrammar(text.trim());

    // Placeholder for streaming response
    const placeholder = { role: 'assistant', content: '' };
    setMessages(prev => [...prev, placeholder]);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: nextMessages, topic })
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let fullText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const raw = line.slice(6).trim();
          if (!raw) continue;
          try {
            const data = JSON.parse(raw);
            if (data.text) {
              fullText += data.text;
              setMessages(prev => {
                const updated = [...prev];
                updated[updated.length - 1] = { role: 'assistant', content: fullText };
                return updated;
              });
            }
            if (data.done || data.error) break;
          } catch { /* skip bad chunks */ }
        }
      }

      // Every 5 user messages, generate new review cards
      const finalMessages = [...nextMessages, { role: 'assistant', content: fullText }];
      if (messageCountRef.current % 5 === 0) {
        generateCards(finalMessages);
      }
    } catch (err) {
      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: 'assistant',
          content: 'Sorry, I had trouble responding. Please try again.'
        };
        return updated;
      });
    } finally {
      setIsStreaming(false);
    }
  }, [messages, topic, isStreaming, analyzeGrammar, generateCards]);

  // ── Change topic ──────────────────────────────────────────────
  const handleChangeTopic = useCallback(() => {
    setPhase('topic');
    setTopic(null);
    setMessages([]);
    setGrammarResult(null);
  }, []);

  // ── Manual card generation ────────────────────────────────────
  const handleGenerateCards = useCallback(() => {
    if (messages.length >= 2) generateCards(messages);
  }, [messages, generateCards]);

  // ── Render ────────────────────────────────────────────────────
  if (phase === 'topic') {
    return (
      <>
        <TopicSelector onSelect={handleTopicSelect} streak={streak} />
        <button
          style={styles.floatingNotifBtn}
          onClick={() => setShowNotifSettings(true)}
          title="Notification settings"
        >
          🔔 {notifSettings.enabled && notifPermission === 'granted' ? notifSettings.time : '알림 설정'}
        </button>
        {showNotifSettings && (
          <NotificationSettings
            settings={notifSettings}
            permission={notifPermission}
            onSave={handleSaveNotifSettings}
            onClose={() => setShowNotifSettings(false)}
            onRequestPermission={handleRequestNotifPermission}
          />
        )}
      </>
    );
  }

  return (
    <div style={styles.app}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerLeft}>
          <button style={styles.backBtn} onClick={handleChangeTopic} title="Change topic">
            ←
          </button>
          <div style={styles.teacherInfo}>
            <div style={styles.avatar}>👩‍🏫</div>
            <div>
              <div style={styles.teacherName}>Chloe</div>
              <div style={styles.teacherSub}>AI English Teacher</div>
            </div>
          </div>
          <TopicBadge topic={topic} />
        </div>
        <div style={styles.headerRight}>
          {cardsGenerating && (
            <span style={styles.generatingBadge}>✨ Saving cards…</span>
          )}
          <button
            style={styles.cardsBtn}
            onClick={() => setShowCards(true)}
            title="Review flashcards"
          >
            📖 Cards {cards.length > 0 && <span style={styles.cardCount}>{cards.length}</span>}
          </button>
          <button
            style={styles.cardsBtn}
            onClick={() => setShowNotifSettings(true)}
            title="Notification settings"
          >
            🔔 {notifSettings.enabled && notifPermission === 'granted' ? notifSettings.time : 'Off'}
          </button>
          <div style={styles.streakBadge} title="Day streak">
            🔥 {streak}
          </div>
        </div>
      </header>

      {/* Body */}
      <div style={styles.body}>
        <div style={styles.chatArea}>
          <ChatWindow
            messages={messages}
            isStreaming={isStreaming}
            onSend={handleSend}
          />
        </div>
        <div style={styles.grammarArea}>
          <GrammarPanel
            result={grammarResult}
            loading={grammarLoading}
            onGenerateCards={handleGenerateCards}
            cardsGenerating={cardsGenerating}
            hasMessages={messages.length > 2}
          />
        </div>
      </div>

      {showCards && (
        <ReviewModal
          cards={cards}
          onClose={() => setShowCards(false)}
          onClear={() => {
            setCards([]);
            localStorage.removeItem('chloe_cards');
          }}
        />
      )}

      {showNotifSettings && (
        <NotificationSettings
          settings={notifSettings}
          permission={notifPermission}
          onSave={handleSaveNotifSettings}
          onClose={() => setShowNotifSettings(false)}
          onRequestPermission={handleRequestNotifPermission}
        />
      )}
    </div>
  );
}

function TopicBadge({ topic }) {
  const labels = {
    daily: '💬 일상회화',
    business: '💼 비즈니스',
    travel: '✈️ 여행',
    toeic: '📝 TOEIC',
    mba: '🎓 영어 인터뷰'
  };
  return (
    <span style={styles.topicBadge}>{labels[topic] || topic}</span>
  );
}

const styles = {
  app: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    background: 'var(--bg)',
    overflow: 'hidden'
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 20px',
    background: 'var(--surface)',
    borderBottom: '1px solid var(--border)',
    boxShadow: 'var(--shadow-sm)',
    zIndex: 10,
    flexShrink: 0
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  backBtn: {
    background: 'var(--surface-2)',
    border: '1px solid var(--border)',
    borderRadius: '8px',
    padding: '6px 12px',
    fontSize: '16px',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    transition: 'all 0.15s'
  },
  teacherInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  avatar: {
    width: '38px',
    height: '38px',
    borderRadius: '50%',
    background: 'var(--primary-bg)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
    flexShrink: 0
  },
  teacherName: {
    fontWeight: '700',
    fontSize: '15px',
    color: 'var(--text-primary)'
  },
  teacherSub: {
    fontSize: '11px',
    color: 'var(--text-muted)'
  },
  topicBadge: {
    background: 'var(--primary-bg)',
    color: 'var(--primary)',
    padding: '4px 10px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600'
  },
  generatingBadge: {
    background: 'var(--accent-amber-bg)',
    color: '#92400E',
    padding: '4px 10px',
    borderRadius: '20px',
    fontSize: '11px',
    fontWeight: '500',
    animation: 'pulse 1.5s infinite'
  },
  cardsBtn: {
    background: 'var(--surface-2)',
    border: '1px solid var(--border)',
    borderRadius: '8px',
    padding: '6px 12px',
    fontSize: '13px',
    fontWeight: '600',
    color: 'var(--text-primary)',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    cursor: 'pointer',
    transition: 'all 0.15s'
  },
  cardCount: {
    background: 'var(--primary)',
    color: '#fff',
    borderRadius: '10px',
    padding: '0 6px',
    fontSize: '11px',
    fontWeight: '700'
  },
  streakBadge: {
    background: 'linear-gradient(135deg, #FEF3C7, #FDE68A)',
    border: '1px solid #F59E0B',
    borderRadius: '8px',
    padding: '6px 12px',
    fontSize: '14px',
    fontWeight: '700',
    color: '#92400E',
    cursor: 'default'
  },
  body: {
    display: 'flex',
    flex: 1,
    overflow: 'hidden',
    gap: '0'
  },
  chatArea: {
    flex: 1,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column'
  },
  floatingNotifBtn: {
    position: 'fixed',
    top: '20px',
    right: '20px',
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: '999px',
    padding: '8px 16px',
    fontSize: '13px',
    fontWeight: '600',
    color: 'var(--text-primary)',
    boxShadow: 'var(--shadow-sm)',
    cursor: 'pointer',
    zIndex: 50
  },
  grammarArea: {
    width: '320px',
    flexShrink: 0,
    borderLeft: '1px solid var(--border)',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    background: 'var(--surface)'
  }
};

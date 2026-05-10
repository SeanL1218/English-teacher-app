import React from 'react';

const TOPICS = [
  {
    id: 'daily',
    icon: '💬',
    label: '일상회화',
    labelEn: 'Daily Conversation',
    desc: '자연스러운 일상 영어 표현 연습',
    color: '#8B5CF6',
    bg: '#EDE9FE'
  },
  {
    id: 'business',
    icon: '💼',
    label: '비즈니스',
    labelEn: 'Business English',
    desc: '비즈니스 이메일, 미팅, 프레젠테이션',
    color: '#3B82F6',
    bg: '#DBEAFE'
  },
  {
    id: 'travel',
    icon: '✈️',
    label: '여행',
    labelEn: 'Travel English',
    desc: '공항, 호텔, 레스토랑 실전 회화',
    color: '#10B981',
    bg: '#D1FAE5'
  },
  {
    id: 'toeic',
    icon: '📝',
    label: 'TOEIC',
    labelEn: 'TOEIC Prep',
    desc: 'TOEIC 어휘, 문법 및 전략 훈련',
    color: '#F59E0B',
    bg: '#FEF3C7'
  },
  {
    id: 'mba',
    icon: '🎓',
    label: '영어 인터뷰',
    labelEn: 'English Interview',
    desc: '영어 인터뷰 준비 및 코칭',
    color: '#EF4444',
    bg: '#FEE2E2'
  }
];

export default function TopicSelector({ onSelect, streak }) {
  return (
    <div style={styles.page}>
      {/* Top bar */}
      <div style={styles.topBar}>
        <div style={styles.streakBadge} title="Your current streak">
          🔥 {streak} day streak
        </div>
      </div>

      {/* Hero */}
      <div style={styles.hero}>
        <div style={styles.avatarWrap}>
          <div style={styles.avatarCircle}>👩‍🏫</div>
          <div style={styles.onlineDot} />
        </div>
        <h1 style={styles.title}>
          Hi! I'm <span style={styles.titleAccent}>Chloe</span>
        </h1>
        <p style={styles.subtitle}>
          Your AI English teacher — pick a topic and let's start talking!
        </p>
      </div>

      {/* Topic grid */}
      <div style={styles.grid}>
        {TOPICS.map(t => (
          <TopicCard key={t.id} topic={t} onClick={() => onSelect(t.id)} />
        ))}
      </div>

      {/* Footer note */}
      <p style={styles.note}>
        ✨ Real-time grammar correction &nbsp;·&nbsp; Auto-generated review cards &nbsp;·&nbsp; Daily streak tracking
      </p>
    </div>
  );
}

function TopicCard({ topic, onClick }) {
  const [hovered, setHovered] = React.useState(false);

  return (
    <button
      style={{
        ...styles.card,
        border: `2px solid ${hovered ? topic.color : 'transparent'}`,
        background: hovered ? topic.bg : 'var(--surface)',
        transform: hovered ? 'translateY(-3px)' : 'none',
        boxShadow: hovered ? `0 8px 24px ${topic.color}30` : 'var(--shadow-sm)'
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
    >
      <div style={{ ...styles.cardIcon, background: topic.bg, color: topic.color }}>
        {topic.icon}
      </div>
      <div style={styles.cardText}>
        <div style={styles.cardLabel}>{topic.label}</div>
        <div style={{ ...styles.cardLabelEn, color: topic.color }}>{topic.labelEn}</div>
        <div style={styles.cardDesc}>{topic.desc}</div>
      </div>
      <div style={{ ...styles.cardArrow, color: topic.color, opacity: hovered ? 1 : 0 }}>→</div>
    </button>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '0 20px 40px',
    background: 'var(--bg)',
    animation: 'fadeIn 0.4s ease'
  },
  topBar: {
    width: '100%',
    maxWidth: '680px',
    display: 'flex',
    justifyContent: 'flex-end',
    paddingTop: '20px',
    paddingBottom: '8px'
  },
  streakBadge: {
    background: 'linear-gradient(135deg, #FEF3C7, #FDE68A)',
    border: '1px solid #F59E0B',
    borderRadius: '20px',
    padding: '6px 14px',
    fontSize: '13px',
    fontWeight: '700',
    color: '#92400E'
  },
  hero: {
    textAlign: 'center',
    padding: '24px 0 32px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px'
  },
  avatarWrap: {
    position: 'relative',
    display: 'inline-block'
  },
  avatarCircle: {
    width: '88px',
    height: '88px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #EDE9FE, #DDD6FE)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '44px',
    boxShadow: '0 0 0 4px var(--surface), 0 0 0 6px #C4B5FD'
  },
  onlineDot: {
    position: 'absolute',
    bottom: '4px',
    right: '4px',
    width: '18px',
    height: '18px',
    borderRadius: '50%',
    background: '#10B981',
    border: '3px solid var(--surface)'
  },
  title: {
    fontSize: '32px',
    fontWeight: '800',
    color: 'var(--text-primary)',
    letterSpacing: '-0.5px'
  },
  titleAccent: {
    color: 'var(--primary)'
  },
  subtitle: {
    fontSize: '16px',
    color: 'var(--text-secondary)',
    maxWidth: '380px'
  },
  grid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    width: '100%',
    maxWidth: '560px'
  },
  card: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    padding: '16px 18px',
    borderRadius: 'var(--radius-lg)',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    textAlign: 'left',
    width: '100%',
    position: 'relative'
  },
  cardIcon: {
    width: '46px',
    height: '46px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '22px',
    flexShrink: 0
  },
  cardText: {
    flex: 1
  },
  cardLabel: {
    fontWeight: '700',
    fontSize: '16px',
    color: 'var(--text-primary)'
  },
  cardLabelEn: {
    fontWeight: '500',
    fontSize: '12px',
    marginTop: '1px'
  },
  cardDesc: {
    fontSize: '13px',
    color: 'var(--text-secondary)',
    marginTop: '3px'
  },
  cardArrow: {
    fontSize: '18px',
    fontWeight: '700',
    transition: 'opacity 0.2s'
  },
  note: {
    marginTop: '28px',
    fontSize: '12px',
    color: 'var(--text-muted)',
    textAlign: 'center'
  }
};

import React, { useState } from 'react';

const DIFF_COLORS = {
  easy:   { bg: '#D1FAE5', color: '#065F46', border: '#6EE7B7' },
  medium: { bg: '#DBEAFE', color: '#1E40AF', border: '#93C5FD' },
  hard:   { bg: '#FEE2E2', color: '#991B1B', border: '#FCA5A5' }
};

export default function ReviewModal({ cards, onClose, onClear }) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);

  const card = cards[index];
  const total = cards.length;

  const prev = () => { setIndex(i => Math.max(0, i - 1)); setFlipped(false); };
  const next = () => { setIndex(i => Math.min(total - 1, i + 1)); setFlipped(false); };
  const flip = () => setFlipped(f => !f);

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={e => e.stopPropagation()}>
        {/* Modal header */}
        <div style={styles.header}>
          <div style={styles.headerLeft}>
            <span style={styles.title}>📖 Review Cards</span>
            <span style={styles.count}>{total} words</span>
          </div>
          <div style={styles.headerRight}>
            {total > 0 && (
              <button
                style={styles.clearBtn}
                onClick={() => setConfirmClear(true)}
                title="Clear all cards"
              >
                🗑️ Clear
              </button>
            )}
            <button style={styles.closeBtn} onClick={onClose}>✕</button>
          </div>
        </div>

        {/* Confirm clear dialog */}
        {confirmClear && (
          <div style={styles.confirmBar}>
            <span style={styles.confirmText}>Delete all {total} cards?</span>
            <button style={styles.confirmYes} onClick={() => { onClear(); setConfirmClear(false); setIndex(0); }}>
              Yes, delete
            </button>
            <button style={styles.confirmNo} onClick={() => setConfirmClear(false)}>
              Cancel
            </button>
          </div>
        )}

        {/* Empty state */}
        {total === 0 && (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>📚</div>
            <p style={styles.emptyTitle}>No cards yet</p>
            <p style={styles.emptyDesc}>
              Chat with Chloe and click <strong>"Save Review Cards"</strong> to build your vocabulary deck!
            </p>
            <button style={styles.closeFullBtn} onClick={onClose}>Back to chat</button>
          </div>
        )}

        {/* Flashcard */}
        {total > 0 && card && (
          <>
            {/* Progress bar */}
            <div style={styles.progressWrap}>
              <div style={{ ...styles.progressBar, width: `${((index + 1) / total) * 100}%` }} />
            </div>
            <div style={styles.progressText}>{index + 1} / {total}</div>

            {/* Card */}
            <div style={styles.cardWrap} onClick={flip}>
              <div style={{ ...styles.card, background: flipped ? '#F0FDF4' : 'var(--surface)' }}>
                {/* Difficulty badge */}
                {card.difficulty && DIFF_COLORS[card.difficulty] && (
                  <span style={{
                    ...styles.diffBadge,
                    background: DIFF_COLORS[card.difficulty].bg,
                    color: DIFF_COLORS[card.difficulty].color,
                    border: `1px solid ${DIFF_COLORS[card.difficulty].border}`
                  }}>
                    {card.difficulty}
                  </span>
                )}

                {!flipped ? (
                  <div style={styles.cardFront}>
                    <p style={styles.cardSideLabel}>Word / Expression</p>
                    <p style={styles.cardWord}>{card.word}</p>
                    <p style={styles.cardTranslation}>{card.translation}</p>
                    <p style={styles.tapHint}>Tap to reveal</p>
                  </div>
                ) : (
                  <div style={styles.cardBack}>
                    <p style={styles.cardSideLabel}>Definition & Example</p>
                    <p style={styles.cardDef}>{card.definition}</p>
                    <div style={styles.exampleBox}>
                      <span style={styles.exampleLabel}>Example</span>
                      <p style={styles.cardExample}>"{card.example}"</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Navigation */}
            <div style={styles.nav}>
              <button
                style={{ ...styles.navBtn, opacity: index === 0 ? 0.4 : 1 }}
                onClick={prev}
                disabled={index === 0}
              >
                ← Prev
              </button>
              <button style={styles.flipBtn} onClick={flip}>
                {flipped ? '🙈 Hide' : '👀 Reveal'}
              </button>
              <button
                style={{ ...styles.navBtn, opacity: index === total - 1 ? 0.4 : 1 }}
                onClick={next}
                disabled={index === total - 1}
              >
                Next →
              </button>
            </div>

            {/* Word list */}
            <div style={styles.wordList}>
              <p style={styles.wordListTitle}>All words</p>
              <div style={styles.wordChips}>
                {cards.map((c, i) => (
                  <button
                    key={i}
                    style={{
                      ...styles.chip,
                      background: i === index ? 'var(--primary)' : 'var(--surface-2)',
                      color: i === index ? '#fff' : 'var(--text-secondary)',
                      border: `1px solid ${i === index ? 'var(--primary)' : 'var(--border)'}`
                    }}
                    onClick={() => { setIndex(i); setFlipped(false); }}
                  >
                    {c.word}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.45)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
    animation: 'fadeIn 0.2s ease',
    padding: '20px'
  },
  modal: {
    background: 'var(--surface)',
    borderRadius: 'var(--radius-xl)',
    width: '100%',
    maxWidth: '500px',
    maxHeight: '90vh',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    boxShadow: '0 25px 50px rgba(0,0,0,0.25)'
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 20px',
    borderBottom: '1px solid var(--border)',
    flexShrink: 0
  },
  headerLeft: { display: 'flex', alignItems: 'center', gap: '10px' },
  headerRight: { display: 'flex', alignItems: 'center', gap: '8px' },
  title: { fontWeight: '700', fontSize: '16px' },
  count: {
    background: 'var(--primary-bg)',
    color: 'var(--primary)',
    padding: '3px 8px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '700'
  },
  clearBtn: {
    background: 'var(--accent-red-bg)',
    border: '1px solid #FCA5A5',
    borderRadius: '8px',
    padding: '5px 10px',
    fontSize: '12px',
    color: '#991B1B',
    cursor: 'pointer',
    fontWeight: '600'
  },
  closeBtn: {
    background: 'var(--surface-2)',
    border: '1px solid var(--border)',
    borderRadius: '8px',
    padding: '5px 10px',
    fontSize: '14px',
    cursor: 'pointer',
    color: 'var(--text-secondary)'
  },
  confirmBar: {
    background: 'var(--accent-amber-bg)',
    borderBottom: '1px solid #FCD34D',
    padding: '10px 20px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    flexShrink: 0
  },
  confirmText: { fontSize: '13px', color: '#78350F', flex: 1, fontWeight: '600' },
  confirmYes: {
    background: 'var(--accent-red)',
    border: 'none',
    borderRadius: '6px',
    padding: '5px 12px',
    color: '#fff',
    fontSize: '12px',
    fontWeight: '700',
    cursor: 'pointer'
  },
  confirmNo: {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: '6px',
    padding: '5px 12px',
    color: 'var(--text-primary)',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer'
  },
  emptyState: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '48px 32px',
    textAlign: 'center',
    gap: '10px'
  },
  emptyIcon: { fontSize: '48px' },
  emptyTitle: { fontWeight: '700', fontSize: '18px' },
  emptyDesc: { fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.6', maxWidth: '280px' },
  closeFullBtn: {
    marginTop: '12px',
    background: 'var(--primary)',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    padding: '10px 24px',
    fontWeight: '700',
    fontSize: '14px',
    cursor: 'pointer'
  },
  progressWrap: {
    height: '4px',
    background: 'var(--border)',
    flexShrink: 0
  },
  progressBar: {
    height: '100%',
    background: 'var(--primary)',
    transition: 'width 0.3s ease',
    borderRadius: '0 2px 2px 0'
  },
  progressText: {
    textAlign: 'right',
    padding: '6px 20px 0',
    fontSize: '11px',
    color: 'var(--text-muted)',
    fontWeight: '600',
    flexShrink: 0
  },
  cardWrap: {
    padding: '16px 20px',
    flex: 1,
    display: 'flex',
    cursor: 'pointer'
  },
  card: {
    flex: 1,
    borderRadius: 'var(--radius-lg)',
    border: '2px solid var(--border)',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    transition: 'background 0.2s ease',
    minHeight: '180px',
    justifyContent: 'center'
  },
  diffBadge: {
    position: 'absolute',
    top: '12px',
    right: '12px',
    padding: '3px 8px',
    borderRadius: '12px',
    fontSize: '10px',
    fontWeight: '700',
    textTransform: 'uppercase'
  },
  cardFront: {
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px'
  },
  cardBack: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  cardSideLabel: {
    fontSize: '11px',
    fontWeight: '700',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  cardWord: {
    fontSize: '28px',
    fontWeight: '800',
    color: 'var(--primary)',
    lineHeight: '1.2'
  },
  cardTranslation: {
    fontSize: '16px',
    color: 'var(--text-secondary)',
    fontWeight: '500'
  },
  tapHint: {
    fontSize: '12px',
    color: 'var(--text-muted)',
    marginTop: '8px'
  },
  cardDef: {
    fontSize: '15px',
    color: 'var(--text-primary)',
    lineHeight: '1.5',
    fontWeight: '500'
  },
  exampleBox: {
    background: 'var(--surface-2)',
    borderRadius: 'var(--radius-sm)',
    padding: '10px 12px',
    border: '1px solid var(--border)'
  },
  exampleLabel: {
    fontSize: '10px',
    fontWeight: '700',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    display: 'block',
    marginBottom: '4px'
  },
  cardExample: {
    fontSize: '13px',
    color: 'var(--text-secondary)',
    fontStyle: 'italic',
    lineHeight: '1.5'
  },
  nav: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 20px 16px',
    gap: '10px',
    flexShrink: 0
  },
  navBtn: {
    background: 'var(--surface-2)',
    border: '1px solid var(--border)',
    borderRadius: '8px',
    padding: '8px 16px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    color: 'var(--text-primary)',
    transition: 'opacity 0.2s'
  },
  flipBtn: {
    background: 'var(--primary)',
    border: 'none',
    borderRadius: '8px',
    padding: '8px 20px',
    fontSize: '13px',
    fontWeight: '700',
    cursor: 'pointer',
    color: '#fff'
  },
  wordList: {
    padding: '12px 20px 20px',
    borderTop: '1px solid var(--border)',
    flexShrink: 0
  },
  wordListTitle: {
    fontSize: '11px',
    fontWeight: '700',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    marginBottom: '8px'
  },
  wordChips: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px'
  },
  chip: {
    padding: '4px 10px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.15s'
  }
};

import React, { useState } from 'react';

const LEVEL_COLORS = {
  A1: { bg: '#FEE2E2', color: '#991B1B', label: 'Beginner' },
  A2: { bg: '#FEF3C7', color: '#92400E', label: 'Elementary' },
  B1: { bg: '#DBEAFE', color: '#1E40AF', label: 'Intermediate' },
  B2: { bg: '#D1FAE5', color: '#065F46', label: 'Upper Int.' },
  C1: { bg: '#EDE9FE', color: '#5B21B6', label: 'Advanced' },
  C2: { bg: '#F0FDF4', color: '#14532D', label: 'Mastery' }
};

export default function GrammarPanel({ result, loading, onGenerateCards, cardsGenerating, hasMessages }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (result?.corrected) {
      navigator.clipboard.writeText(result.corrected);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    }
  };

  const levelInfo = result?.level ? LEVEL_COLORS[result.level] : null;

  return (
    <div style={styles.panel}>
      <div style={styles.panelHeader}>
        <span style={styles.panelTitle}>📝 Grammar Check</span>
        {result?.level && levelInfo && (
          <span style={{ ...styles.levelBadge, background: levelInfo.bg, color: levelInfo.color }}>
            {result.level} · {levelInfo.label}
          </span>
        )}
      </div>

      <div style={styles.panelBody}>
        {/* Empty state */}
        {!loading && !result && (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>✍️</div>
            <p style={styles.emptyTitle}>Grammar Checker</p>
            <p style={styles.emptyDesc}>
              Send a message and I'll check your grammar in real time!
            </p>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div style={styles.loadingState}>
            <div style={styles.loadingBar} />
            <div style={{ ...styles.loadingBar, width: '75%', animationDelay: '0.15s' }} />
            <div style={{ ...styles.loadingBar, width: '55%', animationDelay: '0.3s' }} />
            <p style={styles.loadingText}>Analyzing your English…</p>
          </div>
        )}

        {/* No errors */}
        {!loading && result && !result.hasErrors && (
          <div style={styles.successBlock}>
            <div style={styles.successIcon}>✅</div>
            <p style={styles.successTitle}>Perfect grammar!</p>
            <p style={styles.successSub}>Your sentence looks great. Keep it up!</p>
            {result.tips && (
              <div style={styles.tipBox}>
                <span style={styles.tipLabel}>💡 Tip</span>
                <p style={styles.tipText}>{result.tips}</p>
              </div>
            )}
          </div>
        )}

        {/* Errors found */}
        {!loading && result && result.hasErrors && (
          <div style={styles.errorsBlock}>
            {/* Corrected text */}
            <div style={styles.correctedBox}>
              <div style={styles.correctedHeader}>
                <span style={styles.correctedLabel}>✏️ Corrected</span>
                <button style={styles.copyBtn} onClick={handleCopy}>
                  {copied ? '✓ Copied' : 'Copy'}
                </button>
              </div>
              <p style={styles.correctedText}>"{result.corrected}"</p>
            </div>

            {/* Error list */}
            {result.errors?.length > 0 && (
              <div style={styles.errorList}>
                <p style={styles.errorListTitle}>Changes made:</p>
                {result.errors.map((err, i) => (
                  <div key={i} style={styles.errorItem}>
                    <div style={styles.errorChange}>
                      <span style={styles.errorOriginal}>"{err.original}"</span>
                      <span style={styles.arrow}>→</span>
                      <span style={styles.errorCorrection}>"{err.correction}"</span>
                    </div>
                    <p style={styles.errorExplanation}>{err.explanation}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Tip */}
            {result.tips && (
              <div style={styles.tipBox}>
                <span style={styles.tipLabel}>💡 Tip</span>
                <p style={styles.tipText}>{result.tips}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Generate cards button */}
      <div style={styles.panelFooter}>
        <button
          style={{
            ...styles.genBtn,
            opacity: hasMessages && !cardsGenerating ? 1 : 0.5,
            cursor: hasMessages && !cardsGenerating ? 'pointer' : 'default'
          }}
          onClick={onGenerateCards}
          disabled={!hasMessages || cardsGenerating}
          title="Extract vocabulary from this conversation"
        >
          {cardsGenerating ? '⏳ Generating…' : '✨ Save Review Cards'}
        </button>
      </div>
    </div>
  );
}

const styles = {
  panel: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%'
  },
  panelHeader: {
    padding: '14px 16px',
    borderBottom: '1px solid var(--border)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexShrink: 0
  },
  panelTitle: {
    fontWeight: '700',
    fontSize: '13px',
    color: 'var(--text-primary)'
  },
  levelBadge: {
    padding: '3px 8px',
    borderRadius: '20px',
    fontSize: '11px',
    fontWeight: '700'
  },
  panelBody: {
    flex: 1,
    overflowY: 'auto',
    padding: '16px'
  },
  emptyState: {
    textAlign: 'center',
    padding: '32px 16px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px'
  },
  emptyIcon: {
    fontSize: '36px',
    marginBottom: '4px'
  },
  emptyTitle: {
    fontWeight: '700',
    fontSize: '14px',
    color: 'var(--text-primary)'
  },
  emptyDesc: {
    fontSize: '12px',
    color: 'var(--text-secondary)',
    lineHeight: '1.5'
  },
  loadingState: {
    padding: '16px 0',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    alignItems: 'flex-start'
  },
  loadingBar: {
    height: '12px',
    width: '100%',
    borderRadius: '6px',
    background: 'linear-gradient(90deg, var(--border) 25%, var(--surface-2) 50%, var(--border) 75%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.5s infinite'
  },
  loadingText: {
    fontSize: '12px',
    color: 'var(--text-muted)',
    marginTop: '4px'
  },
  successBlock: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    gap: '8px',
    padding: '20px 0',
    animation: 'fadeIn 0.3s ease'
  },
  successIcon: {
    fontSize: '32px'
  },
  successTitle: {
    fontWeight: '700',
    fontSize: '15px',
    color: 'var(--accent-green)'
  },
  successSub: {
    fontSize: '13px',
    color: 'var(--text-secondary)'
  },
  errorsBlock: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    animation: 'fadeIn 0.3s ease'
  },
  correctedBox: {
    background: 'var(--accent-green-bg)',
    border: '1px solid #6EE7B7',
    borderRadius: 'var(--radius-md)',
    padding: '12px'
  },
  correctedHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '6px'
  },
  correctedLabel: {
    fontSize: '11px',
    fontWeight: '700',
    color: '#065F46'
  },
  copyBtn: {
    background: 'transparent',
    border: 'none',
    fontSize: '11px',
    color: '#065F46',
    cursor: 'pointer',
    fontWeight: '600',
    padding: '2px 6px',
    borderRadius: '4px',
    background: 'rgba(255,255,255,0.6)'
  },
  correctedText: {
    fontSize: '13px',
    color: '#065F46',
    fontStyle: 'italic',
    lineHeight: '1.5'
  },
  errorList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  errorListTitle: {
    fontSize: '11px',
    fontWeight: '700',
    color: 'var(--text-secondary)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  errorItem: {
    background: 'var(--accent-red-bg)',
    border: '1px solid #FCA5A5',
    borderRadius: 'var(--radius-sm)',
    padding: '10px'
  },
  errorChange: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    flexWrap: 'wrap',
    marginBottom: '5px'
  },
  errorOriginal: {
    fontSize: '13px',
    color: '#991B1B',
    textDecoration: 'line-through',
    fontStyle: 'italic'
  },
  arrow: {
    fontSize: '12px',
    color: 'var(--text-muted)'
  },
  errorCorrection: {
    fontSize: '13px',
    color: '#065F46',
    fontWeight: '600'
  },
  errorExplanation: {
    fontSize: '12px',
    color: '#7F1D1D',
    lineHeight: '1.4'
  },
  tipBox: {
    background: 'var(--accent-amber-bg)',
    border: '1px solid #FCD34D',
    borderRadius: 'var(--radius-sm)',
    padding: '10px'
  },
  tipLabel: {
    fontSize: '11px',
    fontWeight: '700',
    color: '#78350F',
    display: 'block',
    marginBottom: '4px'
  },
  tipText: {
    fontSize: '12px',
    color: '#78350F',
    lineHeight: '1.5'
  },
  panelFooter: {
    padding: '12px 16px',
    borderTop: '1px solid var(--border)',
    flexShrink: 0
  },
  genBtn: {
    width: '100%',
    padding: '9px',
    borderRadius: 'var(--radius-sm)',
    background: 'var(--primary)',
    color: '#fff',
    fontWeight: '600',
    fontSize: '13px',
    border: 'none',
    transition: 'opacity 0.2s'
  }
};

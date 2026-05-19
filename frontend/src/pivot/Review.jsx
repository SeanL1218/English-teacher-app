import { useMemo, useState } from 'react';
import { PATTERN_LABELS } from './profile.js';

function formatDateShort(iso) {
  const d = new Date(iso);
  const today = new Date();
  const sameDay = d.toDateString() === today.toDateString();
  if (sameDay) return '오늘';
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return '어제';
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

function ReviewItem({ session }) {
  const [open, setOpen] = useState(false);
  const cat = session.patternCategory;
  const catLabel = cat && cat !== 'none' ? PATTERN_LABELS[cat] : null;

  return (
    <div className={`review-item ${session.ok ? 'ok' : 'miss'}`}>
      <button className="review-item-head" onClick={() => setOpen(o => !o)}>
        <div className="review-item-head-left">
          <span className={`review-mark ${session.ok ? 'ok' : 'miss'}`}>
            {session.ok ? '✓' : '⟲'}
          </span>
          <div className="review-item-head-text">
            <div className="review-item-korean">{session.korean}</div>
            <div className="review-item-meta">
              <span>{formatDateShort(session.at)}</span>
              {catLabel && <span>· {catLabel}</span>}
              {session.reviewOfSessionId && <span>· 복습</span>}
            </div>
          </div>
        </div>
        <span className="review-chevron">{open ? '−' : '+'}</span>
      </button>

      {open && (
        <div className="review-item-body">
          <div className="review-row">
            <div className="review-row-label">내 답</div>
            <div className="review-row-text strike">{session.studentResponse}</div>
          </div>
          <div className="review-row">
            <div className="review-row-label">자연스러운 표현</div>
            <div className="review-row-text emphasized">{session.corrected}</div>
          </div>
          {session.explanation_ko && (
            <div className="review-row">
              <div className="review-row-label">설명</div>
              <div className="review-row-text">{session.explanation_ko}</div>
            </div>
          )}
          {session.examples && session.examples.length > 0 && (
            <div className="review-row">
              <div className="review-row-label">예문</div>
              <ul className="review-list">
                {session.examples.map((ex, i) => <li key={i}>{ex}</li>)}
              </ul>
            </div>
          )}
          {session.alternatives && session.alternatives.length > 0 && (
            <div className="review-row">
              <div className="review-row-label">다른 표현</div>
              <ul className="review-list">
                {session.alternatives.map((alt, i) => <li key={i}>{alt}</li>)}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function Review({ profile, onBack }) {
  const history = useMemo(
    () => profile.sessionHistory.slice().reverse(),
    [profile.sessionHistory]
  );

  const totalMistakes = history.filter(s => !s.ok).length;
  const counts = profile.skillState.patternCounts;
  const dueCount = profile.spacedReview.filter(r => new Date(r.dueAt).getTime() <= Date.now()).length;

  const sortedPatterns = Object.entries(counts)
    .filter(([, n]) => n > 0)
    .sort((a, b) => b[1] - a[1]);

  return (
    <div className="pivot-screen">
      <div className="pivot-header">
        <div className="pivot-header-top">
          <div className="pivot-brand">
            <span className="pivot-brand-mark">90s</span>Pivot
          </div>
          <button className="review-back-btn" onClick={onBack}>← 오늘</button>
        </div>
        <div className="pivot-tagline">지난 기록</div>
      </div>

      <div className="pivot-screen-body review-body">
        <div className="pivot-card review-card">
          <div className="review-stats">
            <div className="review-stat">
              <div className="review-stat-num">{history.length}</div>
              <div className="review-stat-label">총 세션</div>
            </div>
            <div className="review-stat">
              <div className="review-stat-num">{totalMistakes}</div>
              <div className="review-stat-label">틀린 문장</div>
            </div>
            <div className="review-stat">
              <div className="review-stat-num">{dueCount}</div>
              <div className="review-stat-label">복습 예정</div>
            </div>
          </div>

          {sortedPatterns.length > 0 && (
            <>
              <div className="review-section-title">자주 틀리는 영역</div>
              <div className="review-pattern-chips">
                {sortedPatterns.map(([key, n]) => (
                  <span key={key} className="review-pattern-chip">
                    {PATTERN_LABELS[key]} <b>{n}</b>
                  </span>
                ))}
              </div>
            </>
          )}

          <div className="review-section-title">기록</div>
          {history.length === 0 ? (
            <p className="pivot-coach-line muted small">아직 기록이 없어요. 한 문장만 해볼까요?</p>
          ) : (
            <div className="review-list-wrap">
              {history.map(s => <ReviewItem key={s.id} session={s} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

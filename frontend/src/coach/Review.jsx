import React, { useEffect, useMemo, useState } from 'react';
import { loadHistory } from './storage.js';

export default function Review({ refreshKey }) {
  const [history, setHistory] = useState(() => loadHistory());
  const [pickKey, setPickKey] = useState(0);
  const [attempt, setAttempt] = useState('');
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    setHistory(loadHistory());
  }, [refreshKey]);

  const mistakes = useMemo(
    () => history.filter((e) => e.mistakeType && e.mistakeType !== 'None'),
    [history]
  );

  const current = useMemo(() => {
    if (mistakes.length === 0) return null;
    const pool = mistakes.slice(0, 10);
    return pool[pickKey % pool.length];
  }, [mistakes, pickKey]);

  function handleNext() {
    setPickKey((k) => k + 1);
    setAttempt('');
    setRevealed(false);
  }

  if (mistakes.length === 0) {
    return (
      <div className="coach-review">
        <h2 className="coach-title">복습 🪞</h2>
        <p className="coach-sub">실수를 하나씩 다시 익혀 봐요.</p>
        <div className="coach-empty">
          아직 복습할 문장이 없어요. Practice 탭에서 한 문장 적어 보면 여기로 모일 거예요. 💜
        </div>
      </div>
    );
  }

  return (
    <div className="coach-review">
      <h2 className="coach-title">복습 🪞</h2>
      <p className="coach-sub">아래 원문을 보고, 자연스러운 표현으로 직접 다시 써 보세요.</p>

      <div className="coach-review-card">
        <div className="coach-label">원문</div>
        <div className="coach-original">{current.original}</div>

        <div className="coach-label">내가 다듬어 본 표현</div>
        <textarea
          value={attempt}
          onChange={(e) => setAttempt(e.target.value)}
          placeholder="여기에 직접 다시 써 보세요…"
          rows={3}
          className="coach-review-input"
        />

        {!revealed && (
          <button onClick={() => setRevealed(true)} className="coach-show">정답 보기</button>
        )}

        {revealed && (
          <>
            <div className="coach-label">자연스러운 표현</div>
            <div className="coach-corrected">{current.corrected}</div>
            <div className="coach-encourage">잘했어요! 한 문장 더 복습해 볼까요?</div>
            <button onClick={handleNext} className="coach-again">다른 문장 →</button>
          </>
        )}

      </div>
    </div>
  );
}

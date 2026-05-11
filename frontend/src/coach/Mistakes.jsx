import React, { useEffect, useState } from 'react';
import { loadHistory, clearHistory } from './storage.js';

export default function Mistakes({ refreshKey, onCleared }) {
  const [history, setHistory] = useState(() => loadHistory());

  useEffect(() => {
    setHistory(loadHistory());
  }, [refreshKey]);

  const mistakes = history.filter((e) => e.mistakeType && e.mistakeType !== 'None');

  function handleClear() {
    if (!history.length) return;
    const ok = window.confirm('지금까지의 기록을 모두 지울까요? 이 작업은 되돌릴 수 없어요.');
    if (!ok) return;
    clearHistory();
    setHistory([]);
    if (onCleared) onCleared();
  }

  return (
    <div className="coach-mistakes">
      <div className="coach-mistakes-head">
        <div>
          <h2 className="coach-title">자주 마주친 표현 🌱</h2>
          <p className="coach-sub">실수는 성장의 발판이에요. 한 번 더 눈에 익혀 봐요.</p>
        </div>
        {history.length > 0 && (
          <button className="coach-clear" onClick={handleClear}>전체 지우기</button>
        )}
      </div>

      {mistakes.length === 0 && (
        <div className="coach-empty">
          아직 모아둔 실수가 없어요. Practice 탭에서 한 문장 적어 보면 여기 모일 거예요. ✨
        </div>
      )}

      {mistakes.length > 0 && (
        <ul className="coach-mistake-list">
          {mistakes.map((e) => (
            <li key={e.id} className="coach-mistake-item">
              <div className="coach-mistake-meta">
                <span className="coach-mistake-type">{e.mistakeType}</span>
                <span className="coach-mistake-date">{formatDate(e.createdAt)}</span>
              </div>
              <div className="coach-mistake-original">✗ {e.original}</div>
              <div className="coach-mistake-corrected">✓ {e.corrected}</div>
            </li>
          ))}
        </ul>
      )}

    </div>
  );
}

function formatDate(iso) {
  try {
    const d = new Date(iso);
    const month = d.getMonth() + 1;
    const day = d.getDate();
    return `${month}/${day}`;
  } catch {
    return '';
  }
}

import React, { useEffect, useState } from 'react';
import { loadHistory, summarize } from './storage.js';

export default function Progress({ refreshKey }) {
  const [stats, setStats] = useState(() => summarize(loadHistory()));

  useEffect(() => {
    setStats(summarize(loadHistory()));
  }, [refreshKey]);

  const { total, average, topMistake } = stats;
  const message = encourage(total, average);

  return (
    <div className="coach-progress">
      <h2 className="coach-title">나의 성장 📈</h2>
      <p className="coach-sub">조금씩, 꾸준히. 매일 한 문장이 큰 변화를 만들어요.</p>

      <div className="coach-stat-grid">
        <Stat label="교정한 문장" value={total} unit="개" />
        <Stat label="평균 점수" value={total > 0 ? average : '–'} unit={total > 0 ? '점' : ''} />
        <Stat label="자주 하는 실수" value={topMistake || '아직 없음'} />
      </div>

      <div className="coach-encourage">{message}</div>
    </div>
  );
}

function Stat({ label, value, unit }) {
  return (
    <div className="coach-stat">
      <div className="coach-stat-label">{label}</div>
      <div className="coach-stat-value">
        {value}{unit ? <span className="coach-stat-unit"> {unit}</span> : null}
      </div>
    </div>
  );
}

function encourage(total, average) {
  if (total === 0) return '첫 문장을 적어 보세요. 시작이 가장 큰 걸음이에요. 💜';
  if (total < 5) return `벌써 ${total}문장이나 적었어요! 이 페이스 멋져요.`;
  if (average >= 85) return '와, 표현이 정말 자연스러워지고 있어요. 자신감 있게 더 써 봐요!';
  if (average >= 70) return '꾸준한 노력이 보여요. 한 단계만 더 다듬어 봐요. ✨';
  return '지금처럼 한 문장씩 쌓아가면 분명히 늘어요. 응원할게요!';
}

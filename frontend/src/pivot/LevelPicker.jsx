import { useState } from 'react';
import { setLevel } from './profile.js';

export const LEVELS = [
  {
    id: 'beginner',
    label: '초급',
    desc: '짧은 문장만 가능. 단어부터 막혀요.',
  },
  {
    id: 'intermediate',
    label: '중급',
    desc: '일상 대화는 되는데, 가끔 단어가 막혀요.',
  },
  {
    id: 'advanced',
    label: '고급',
    desc: '대부분 가능. 더 자연스럽고 미묘하게 말하고 싶어요.',
  },
  {
    id: 'business',
    label: '비즈니스 / 프로페셔널',
    desc: '회의·면접·협상 영어를 훈련하고 싶어요.',
  },
];

export function LevelOptions({ value, onChange }) {
  return (
    <div className="pivot-options">
      {LEVELS.map(l => (
        <button
          key={l.id}
          className={`pivot-option ${value === l.id ? 'selected' : ''}`}
          onClick={() => onChange(l.id)}
        >
          <span className="pivot-level-label">{l.label}</span>
          <span className="pivot-level-desc">{l.desc}</span>
        </button>
      ))}
    </div>
  );
}

export default function LevelPicker({ profile, onDone }) {
  const [level, setLevelState] = useState(null);

  function save() {
    const updated = setLevel(profile, level);
    onDone(updated);
  }

  return (
    <div className="pivot-screen">
      <div className="pivot-header">
        <div className="pivot-header-top">
          <div className="pivot-brand">
            <span className="pivot-brand-mark">90s</span>Pivot
          </div>
        </div>
        <div className="pivot-tagline">먼저 영어 수준을 알려주세요.</div>
      </div>
      <div className="pivot-screen-body">
        <div className="pivot-card">
          <p className="pivot-coach-line">레벨에 맞춰 문장을 골라드릴게요.</p>
          <p className="pivot-coach-line muted small">
            고급/비즈니스를 고르면 회의·면접·반박·설득 같은 실제 상황 문장이 나와요.
          </p>
          <LevelOptions value={level} onChange={setLevelState} />
          <button
            className="pivot-button primary"
            disabled={!level}
            onClick={save}
          >
            저장하고 시작
          </button>
        </div>
      </div>
    </div>
  );
}

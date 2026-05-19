import { useState } from 'react';
import { initProfile } from './profile.js';
import { LevelOptions } from './LevelPicker.jsx';

const GOALS = [
  { id: 'daily_conversation', label: '일상 대화' },
  { id: 'job_interview', label: '면접 / 비즈니스' },
  { id: 'travel', label: '여행' },
  { id: 'exam', label: '시험 / OPIc' },
];

function Header() {
  return (
    <div className="pivot-header">
      <div className="pivot-header-top">
        <div className="pivot-brand">
          <span className="pivot-brand-mark">90s</span>Pivot
        </div>
      </div>
      <div className="pivot-tagline">하루 90초, 한 문장. 그게 다예요.</div>
    </div>
  );
}

export default function Onboarding({ onDone }) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [goal, setGoal] = useState(null);
  const [level, setLevel] = useState(null);

  function start() {
    const profile = initProfile({ name, goal, level });
    onDone(profile);
  }

  return (
    <div className="pivot-screen">
      <Header />
      <div className="pivot-screen-body">
        <div className="pivot-card">
          {step === 0 && (
            <>
              <p className="pivot-hero-mark">Pivot 90s</p>
              <p className="pivot-hero-tagline">
                한국어 한 문장 → 영어로<br />30초 안에 답하고 끝.
              </p>
              <div className="pivot-divider" />
              <p className="pivot-coach-line">안녕, 저는 Chloe예요.</p>
              <p className="pivot-coach-line muted">이름이 어떻게 되세요?</p>
              <input
                autoFocus
                className="pivot-input"
                value={name}
                onChange={e => setName(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && name.trim()) setStep(1);
                }}
                placeholder="이름"
              />
              <button
                className="pivot-button primary"
                disabled={!name.trim()}
                onClick={() => setStep(1)}
              >
                다음
              </button>
            </>
          )}

          {step === 1 && (
            <>
              <p className="pivot-coach-line">{name}, 영어가 필요한 이유는?</p>
              <p className="pivot-coach-line muted small">
                매일 그 상황에 쓸 한 문장을 골라드릴게요.
              </p>
              <div className="pivot-options">
                {GOALS.map(g => (
                  <button
                    key={g.id}
                    className={`pivot-option ${goal === g.id ? 'selected' : ''}`}
                    onClick={() => setGoal(g.id)}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
              <button
                className="pivot-button primary"
                disabled={!goal}
                onClick={() => setStep(2)}
              >
                다음
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <p className="pivot-coach-line">지금 영어 수준이 어느 정도예요?</p>
              <p className="pivot-coach-line muted small">
                레벨에 맞춰 난이도가 자동으로 조절돼요. 고급/비즈니스는 실제 회의·면접 문장이 나와요.
              </p>
              <LevelOptions value={level} onChange={setLevel} />
              <button
                className="pivot-button primary"
                disabled={!level}
                onClick={() => setStep(3)}
              >
                다음
              </button>
            </>
          )}

          {step === 3 && (
            <>
              <p className="pivot-coach-line">좋아요. 진행은 이렇게 돼요.</p>
              <div className="pivot-flow-preview">
                <div className="pivot-flow-preview-title">매일 90초</div>
                <div className="pivot-flow-step">
                  <span className="pivot-flow-step-num">1</span>
                  <span>오늘의 한국어 한 문장</span>
                </div>
                <div className="pivot-flow-step">
                  <span className="pivot-flow-step-num">2</span>
                  <span>영어로 답하기 (30초)</span>
                </div>
                <div className="pivot-flow-step">
                  <span className="pivot-flow-step-num">3</span>
                  <span>한 줄 피드백</span>
                </div>
                <div className="pivot-flow-step">
                  <span className="pivot-flow-step-num">4</span>
                  <span>끝. 내일 또 만나요.</span>
                </div>
              </div>
              <p className="pivot-coach-line small muted">
                대화 앱이 아니에요. 짧고 빠른 영어 반사 훈련이에요.
              </p>
              <button className="pivot-button primary" onClick={start}>
                시작하기
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

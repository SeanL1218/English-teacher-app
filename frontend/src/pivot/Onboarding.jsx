import { useState } from 'react';
import { initProfile } from './profile.js';

const GOALS = [
  { id: 'daily_conversation', label: '일상 대화' },
  { id: 'job_interview', label: '면접 / 비즈니스' },
  { id: 'travel', label: '여행' },
  { id: 'exam', label: '시험 (TOEIC 등)' },
];

export default function Onboarding({ onDone }) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [goal, setGoal] = useState(null);

  function start() {
    const profile = initProfile({ name, goal });
    onDone(profile);
  }

  return (
    <div className="pivot-screen">
      <div className="pivot-card">
        {step === 0 && (
          <>
            <p className="pivot-coach-line">안녕하세요. 저는 Chloe예요.</p>
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
              className="pivot-button"
              disabled={!name.trim()}
              onClick={() => setStep(1)}
            >
              다음
            </button>
          </>
        )}

        {step === 1 && (
          <>
            <p className="pivot-coach-line">{name}, 영어 공부하는 이유가 뭐예요?</p>
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
              className="pivot-button"
              disabled={!goal}
              onClick={() => setStep(2)}
            >
              다음
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <p className="pivot-coach-line">좋아요.</p>
            <p className="pivot-coach-line">하루에 한 문장만 같이 해봐요.</p>
            <p className="pivot-coach-line muted">90초면 충분해요.</p>
            <button className="pivot-button primary" onClick={start}>
              시작하기
            </button>
          </>
        )}
      </div>
    </div>
  );
}

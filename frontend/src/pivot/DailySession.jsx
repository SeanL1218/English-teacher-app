import { useEffect, useMemo, useState } from 'react';
import {
  getTodayPromptIfFresh,
  lockTodayPrompt,
  pickNextTargetPattern,
  getRecentTopics,
  recordSessionResult,
} from './profile.js';
import { greeting, feedbackHeader, closing } from './coachVoice.js';

const STAGE = { LOADING: 'loading', READY: 'ready', EVALUATING: 'evaluating', DONE: 'done' };

function formatElapsed(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

function Header({ streak, elapsedSec, showTimer }) {
  return (
    <div className="pivot-header">
      <div className="pivot-header-top">
        <div className="pivot-brand">
          <span className="pivot-brand-mark">90s</span>Pivot
        </div>
        <div className="pivot-header-meta">
          {streak > 0 && <span className="pivot-chip">🔥 {streak}</span>}
          {showTimer && (
            <span className="pivot-chip timer">⏱ {formatElapsed(elapsedSec)}</span>
          )}
        </div>
      </div>
      <div className="pivot-tagline">하루 90초, 한 문장.</div>
    </div>
  );
}

export default function DailySession({ profile, onProfileChange }) {
  const [stage, setStage] = useState(STAGE.LOADING);
  const [prompt, setPrompt] = useState(null);
  const [response, setResponse] = useState('');
  const [evaluation, setEvaluation] = useState(null);
  const [error, setError] = useState(null);
  const [elapsedSec, setElapsedSec] = useState(0);

  const greetingLine = useMemo(() => greeting(profile), [profile]);

  useEffect(() => {
    let cancelled = false;
    async function loadPrompt() {
      const cached = getTodayPromptIfFresh(profile);
      if (cached) {
        if (!cancelled) {
          setPrompt(cached);
          setStage(STAGE.READY);
        }
        return;
      }
      try {
        const r = await fetch('/api/pivot/prompt', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            goal: profile.identity.goal,
            level: profile.identity.level,
            targetPattern: pickNextTargetPattern(profile),
            recentTopics: getRecentTopics(profile),
          }),
        });
        if (!r.ok) throw new Error('prompt fetch failed');
        const data = await r.json();
        if (cancelled) return;
        const updated = lockTodayPrompt(profile, data);
        onProfileChange(updated);
        setPrompt(data);
        setStage(STAGE.READY);
      } catch (e) {
        if (!cancelled) {
          setError('잠깐 연결이 안 되네요. 다시 시도해주세요.');
          setStage(STAGE.READY);
        }
      }
    }
    loadPrompt();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (stage !== STAGE.READY) return;
    const start = Date.now();
    const id = setInterval(() => {
      setElapsedSec(Math.floor((Date.now() - start) / 1000));
    }, 1000);
    return () => clearInterval(id);
  }, [stage]);

  async function submit() {
    if (!response.trim() || !prompt) return;
    setStage(STAGE.EVALUATING);
    setError(null);
    try {
      const r = await fetch('/api/pivot/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          korean: prompt.korean,
          expectedEnglish: prompt.expectedEnglish,
          targetPattern: prompt.targetPattern,
          studentResponse: response,
        }),
      });
      if (!r.ok) throw new Error('eval failed');
      const data = await r.json();
      const updated = recordSessionResult(profile, data);
      onProfileChange(updated);
      setEvaluation(data);
      setStage(STAGE.DONE);
    } catch (e) {
      setError('평가에 실패했어요. 한 번만 더 보내볼게요.');
      setStage(STAGE.READY);
    }
  }

  const streak = profile.engagement.currentStreak;

  if (stage === STAGE.LOADING) {
    return (
      <div className="pivot-screen">
        <Header streak={streak} elapsedSec={0} showTimer={false} />
        <div className="pivot-screen-body">
          <div className="pivot-card">
            <p className="pivot-coach-line muted">{greetingLine}</p>
            <p className="pivot-coach-line muted">오늘 문장 가져오는 중…</p>
          </div>
        </div>
      </div>
    );
  }

  if (stage === STAGE.DONE && evaluation) {
    return (
      <div className="pivot-screen">
        <Header streak={streak} elapsedSec={elapsedSec} showTimer={true} />
        <div className="pivot-screen-body">
          <div className="pivot-card">
            <p className="pivot-done-mark">{evaluation.ok ? '✓' : '⟲'}</p>
            <p className="pivot-coach-line">{feedbackHeader(evaluation.ok)}</p>
            {!evaluation.ok && (
              <p className="pivot-corrected">{evaluation.corrected}</p>
            )}
            <p className="pivot-coach-line muted">{evaluation.feedback_ko}</p>
            <div className="pivot-divider" />
            <p className="pivot-coach-line small">{closing(profile)}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pivot-screen">
      <Header streak={streak} elapsedSec={elapsedSec} showTimer={stage === STAGE.READY} />
      <div className="pivot-screen-body">
        <div className="pivot-card">
          <p className="pivot-coach-line muted small">{greetingLine}</p>
          {prompt && (
            <>
              <p className="pivot-prompt-label">오늘의 한 문장</p>
              <p className="pivot-prompt-ko">{prompt.korean}</p>
              <textarea
                className="pivot-textarea"
                value={response}
                onChange={e => setResponse(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    if (stage === STAGE.READY) submit();
                  }
                }}
                placeholder="영어로 답해보세요"
                disabled={stage === STAGE.EVALUATING}
                autoFocus
              />
              {error && <p className="pivot-error">{error}</p>}
              <button
                className="pivot-button primary"
                disabled={!response.trim() || stage === STAGE.EVALUATING}
                onClick={submit}
              >
                {stage === STAGE.EVALUATING ? '확인 중…' : '제출'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

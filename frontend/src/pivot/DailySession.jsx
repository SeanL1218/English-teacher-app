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

export default function DailySession({ profile, onProfileChange, onReset }) {
  const [stage, setStage] = useState(STAGE.LOADING);
  const [prompt, setPrompt] = useState(null);
  const [response, setResponse] = useState('');
  const [evaluation, setEvaluation] = useState(null);
  const [error, setError] = useState(null);

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

  if (stage === STAGE.LOADING) {
    return (
      <div className="pivot-screen">
        <div className="pivot-card">
          <p className="pivot-coach-line muted">{greetingLine}</p>
          <p className="pivot-coach-line muted">…</p>
        </div>
      </div>
    );
  }

  if (stage === STAGE.DONE && evaluation) {
    return (
      <div className="pivot-screen">
        <div className="pivot-card">
          <p className="pivot-coach-line">{feedbackHeader(evaluation.ok)}</p>
          {!evaluation.ok && (
            <p className="pivot-corrected">{evaluation.corrected}</p>
          )}
          <p className="pivot-coach-line muted">{evaluation.feedback_ko}</p>
          <div className="pivot-divider" />
          <p className="pivot-coach-line small">{closing(profile)}</p>
          <p className="pivot-streak">
            🔥 {profile.engagement.currentStreak}일
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="pivot-screen">
      <div className="pivot-card">
        <p className="pivot-coach-line">{greetingLine}</p>
        {prompt && (
          <>
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
              placeholder="영어로 써보세요"
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
  );
}

import React, { useState } from 'react';
import { saveEntry, avgScore } from './storage.js';

export default function Practice({ onSaved }) {
  const [sentence, setSentence] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    if (!sentence.trim() || loading) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await fetch('/api/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sentence: sentence.trim() })
      });
      if (!res.ok) throw new Error('Coach request failed');
      const data = await res.json();
      const entry = {
        id: Date.now(),
        original: sentence.trim(),
        corrected: data.corrected,
        explanation: data.explanation,
        scores: data.scores,
        mistakeType: data.mistakeType,
        createdAt: new Date().toISOString()
      };
      saveEntry(entry);
      setResult(entry);
      if (onSaved) onSaved();
    } catch (err) {
      setError('잠깐만요! 다시 한 번 시도해 주세요.');
    } finally {
      setLoading(false);
    }
  }

  function handleNew() {
    setSentence('');
    setResult(null);
    setError('');
  }

  return (
    <div className="coach-practice">
      <h2 className="coach-title">오늘의 한 문장 ✍️</h2>
      <p className="coach-sub">영어로 한 문장 적어 주세요. 자연스럽게 다듬어 드릴게요.</p>

      {!result && (
        <form onSubmit={handleSubmit} className="coach-form">
          <textarea
            value={sentence}
            onChange={(e) => setSentence(e.target.value)}
            placeholder="e.g., I want to discuss about the project schedule."
            rows={4}
            disabled={loading}
          />
          <button type="submit" disabled={loading || !sentence.trim()}>
            {loading ? '코치가 살펴보는 중…' : '코치에게 보내기'}
          </button>
          {error && <div className="coach-error">{error}</div>}
        </form>
      )}

      {result && (
        <div className="coach-card">
          <div className="coach-row">
            <div className="coach-label">원문</div>
            <div className="coach-original">{result.original}</div>
          </div>
          <div className="coach-row">
            <div className="coach-label">자연스러운 표현</div>
            <div className="coach-corrected">{result.corrected}</div>
          </div>
          <div className="coach-row">
            <div className="coach-label">코치 한마디</div>
            <div className="coach-explanation">{result.explanation}</div>
          </div>

          <div className="coach-scores">
            <Chip label="정확성" value={result.scores && result.scores.accuracy} />
            <Chip label="자연스러움" value={result.scores && result.scores.naturalness} />
            <Chip label="비즈니스 톤" value={result.scores && result.scores.businessTone} />
          </div>

          <div className="coach-summary">
            <span>평균 {avgScore(result)}점</span>
            <span>유형: {result.mistakeType || 'None'}</span>
          </div>

          <button onClick={handleNew} className="coach-again">한 문장 더 연습하기 →</button>
        </div>
      )}

    </div>
  );
}

function Chip({ label, value }) {
  const v = typeof value === 'number' ? value : 0;
  return (
    <div className="coach-chip">
      <div className="coach-chip-label">{label}</div>
      <div className="coach-chip-value">{v}</div>
    </div>
  );
}

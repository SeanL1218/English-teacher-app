const KEY = 'chloe_pivot_profile_v1';

export const PATTERN_LABELS = {
  tense: '시제',
  wordChoice: '단어 선택',
  preposition: '전치사',
  article: '관사',
  naturalness: '자연스러움',
  businessTone: '비즈니스 톤',
  hedging: '완곡 표현',
  sentenceStructure: '문장 구조',
};

const EMPTY_PATTERN_COUNTS = Object.fromEntries(
  Object.keys(PATTERN_LABELS).map(k => [k, 0])
);

const DEFAULT = {
  version: 2,
  identity: {
    name: '',
    L1: 'ko',
    goal: 'daily_conversation',
    level: null,
  },
  skillState: {
    activeTargets: [],
    recentMistakes: [],
    patternCounts: { ...EMPTY_PATTERN_COUNTS },
  },
  engagement: {
    currentStreak: 0,
    longestStreak: 0,
    lastSessionAt: null,
    sessionDates: [],
  },
  coachState: {
    lastTopic: null,
    lastTargetPattern: null,
    todayPrompt: null,
  },
  sessionHistory: [],
  spacedReview: [],
  onboardedAt: null,
};

function migrate(loaded) {
  if (!loaded) return null;
  const next = { ...DEFAULT, ...loaded };
  next.identity = { ...DEFAULT.identity, ...(loaded.identity || {}) };
  next.skillState = {
    ...DEFAULT.skillState,
    ...(loaded.skillState || {}),
    patternCounts: { ...EMPTY_PATTERN_COUNTS, ...(loaded.skillState?.patternCounts || {}) },
  };
  next.engagement = { ...DEFAULT.engagement, ...(loaded.engagement || {}) };
  next.coachState = { ...DEFAULT.coachState, ...(loaded.coachState || {}) };
  next.sessionHistory = Array.isArray(loaded.sessionHistory) ? loaded.sessionHistory : [];
  next.spacedReview = Array.isArray(loaded.spacedReview) ? loaded.spacedReview : [];
  next.version = 2;
  return next;
}

export function loadProfile() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    return migrate(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function saveProfile(profile) {
  localStorage.setItem(KEY, JSON.stringify(profile));
}

export function initProfile({ name, goal, level }) {
  const profile = {
    ...DEFAULT,
    identity: { ...DEFAULT.identity, name: name.trim(), goal, level },
    skillState: { ...DEFAULT.skillState, patternCounts: { ...EMPTY_PATTERN_COUNTS } },
    sessionHistory: [],
    spacedReview: [],
    onboardedAt: new Date().toISOString(),
  };
  saveProfile(profile);
  return profile;
}

export function setLevel(profile, level) {
  const next = {
    ...profile,
    identity: { ...profile.identity, level },
    coachState: { ...profile.coachState, todayPrompt: null },
  };
  saveProfile(next);
  return next;
}

export function todayISODate() {
  return new Date().toISOString().slice(0, 10);
}

export function daysSinceLastSession(profile) {
  if (!profile.engagement.lastSessionAt) return null;
  const last = new Date(profile.engagement.lastSessionAt);
  const diffMs = Date.now() - last.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

export function pickNextTargetPattern(profile) {
  const recent = profile.skillState.recentMistakes;
  if (recent.length === 0) return null;
  const last = recent[recent.length - 1];
  return last.subtype || last.type;
}

export function getRecentTopics(profile, n = 5) {
  return profile.skillState.recentMistakes
    .slice(-n)
    .map(m => m.subtype || m.type)
    .filter(Boolean);
}

export function lockTodayPrompt(profile, prompt, opts = {}) {
  const updated = {
    ...profile,
    coachState: {
      ...profile.coachState,
      todayPrompt: { date: todayISODate(), reviewOfSessionId: opts.reviewOfSessionId || null, ...prompt },
    },
  };
  saveProfile(updated);
  return updated;
}

export function getTodayPromptIfFresh(profile) {
  const p = profile.coachState.todayPrompt;
  if (p && p.date === todayISODate()) return p;
  return null;
}

function sessionId(at) {
  return `${at}-${Math.random().toString(36).slice(2, 8)}`;
}

function recomputeStreak(sessionDates) {
  let streak = 0;
  const cursor = new Date();
  for (let i = 0; i < 365; i++) {
    const iso = cursor.toISOString().slice(0, 10);
    if (sessionDates.includes(iso)) {
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}

export function recordSessionResult(profile, evaluation, promptContext) {
  const next = JSON.parse(JSON.stringify(profile));
  const today = todayISODate();
  const nowIso = new Date().toISOString();

  if (!next.engagement.sessionDates.includes(today)) {
    next.engagement.sessionDates.push(today);
    if (next.engagement.sessionDates.length > 90) next.engagement.sessionDates.shift();
  }
  next.engagement.currentStreak = recomputeStreak(next.engagement.sessionDates);
  next.engagement.longestStreak = Math.max(next.engagement.longestStreak, next.engagement.currentStreak);
  next.engagement.lastSessionAt = nowIso;

  const id = sessionId(nowIso);
  const entry = {
    id,
    at: nowIso,
    korean: promptContext.korean,
    expectedEnglish: promptContext.expectedEnglish,
    targetPattern: promptContext.targetPattern || null,
    studentResponse: promptContext.studentResponse,
    ok: !!evaluation.ok,
    mistakeType: evaluation.mistakeType || 'None',
    mistakeSubtype: evaluation.mistakeSubtype || null,
    patternCategory: evaluation.patternCategory || 'none',
    corrected: evaluation.corrected || promptContext.expectedEnglish,
    feedback_ko: evaluation.feedback_ko || '',
    explanation_ko: evaluation.explanation_ko || '',
    examples: Array.isArray(evaluation.examples) ? evaluation.examples.slice(0, 3) : [],
    alternatives: Array.isArray(evaluation.alternatives) ? evaluation.alternatives.slice(0, 3) : [],
    level: next.identity.level,
    goal: next.identity.goal,
    reviewOfSessionId: promptContext.reviewOfSessionId || null,
  };
  next.sessionHistory.push(entry);
  if (next.sessionHistory.length > 200) next.sessionHistory.shift();

  if (!entry.ok) {
    const cat = entry.patternCategory;
    if (cat && cat !== 'none' && cat in next.skillState.patternCounts) {
      next.skillState.patternCounts[cat] += 1;
    }
    next.skillState.recentMistakes.push({
      type: entry.mistakeType,
      subtype: entry.mistakeSubtype,
      at: nowIso,
    });
    if (next.skillState.recentMistakes.length > 30) next.skillState.recentMistakes.shift();
    next.coachState.lastTargetPattern = entry.mistakeSubtype || entry.mistakeType;

    const dueAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    next.spacedReview.push({
      sessionId: id,
      korean: entry.korean,
      expectedEnglish: entry.expectedEnglish,
      targetPattern: entry.targetPattern,
      patternCategory: entry.patternCategory,
      dueAt,
      attempts: 0,
    });
    if (next.spacedReview.length > 50) next.spacedReview.shift();
  } else if (promptContext.reviewOfSessionId) {
    next.spacedReview = next.spacedReview.filter(r => r.sessionId !== promptContext.reviewOfSessionId);
  }

  next.coachState.todayPrompt = null;
  saveProfile(next);
  return next;
}

export function dueReviews(profile) {
  const now = Date.now();
  return profile.spacedReview
    .filter(r => new Date(r.dueAt).getTime() <= now)
    .sort((a, b) => new Date(a.dueAt) - new Date(b.dueAt));
}

export function pickDueReview(profile) {
  const due = dueReviews(profile);
  return due.length > 0 ? due[0] : null;
}

export function snoozeReview(profile, sessionId, days = 1) {
  const next = JSON.parse(JSON.stringify(profile));
  const item = next.spacedReview.find(r => r.sessionId === sessionId);
  if (item) {
    item.attempts = (item.attempts || 0) + 1;
    item.dueAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
  }
  saveProfile(next);
  return next;
}

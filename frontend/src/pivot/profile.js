const KEY = 'chloe_pivot_profile_v1';

const DEFAULT = {
  version: 1,
  identity: {
    name: '',
    L1: 'ko',
    goal: 'daily_conversation',
    level: null,
  },
  skillState: {
    activeTargets: [],
    recentMistakes: [],
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
  onboardedAt: null,
};

export function loadProfile() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw);
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

export function lockTodayPrompt(profile, prompt) {
  const updated = {
    ...profile,
    coachState: {
      ...profile.coachState,
      todayPrompt: { date: todayISODate(), ...prompt },
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

export function recordSessionResult(profile, evaluation) {
  const next = JSON.parse(JSON.stringify(profile));
  const today = todayISODate();

  if (!next.engagement.sessionDates.includes(today)) {
    next.engagement.sessionDates.push(today);
    if (next.engagement.sessionDates.length > 60) {
      next.engagement.sessionDates.shift();
    }
  }

  let streak = 0;
  const cursor = new Date();
  for (let i = 0; i < 365; i++) {
    const iso = cursor.toISOString().slice(0, 10);
    if (next.engagement.sessionDates.includes(iso)) {
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
    } else {
      break;
    }
  }
  next.engagement.currentStreak = streak;
  next.engagement.longestStreak = Math.max(next.engagement.longestStreak, streak);
  next.engagement.lastSessionAt = new Date().toISOString();

  if (evaluation && evaluation.mistakeType && evaluation.mistakeType !== 'None') {
    next.skillState.recentMistakes.push({
      type: evaluation.mistakeType,
      subtype: evaluation.mistakeSubtype || null,
      at: new Date().toISOString(),
    });
    if (next.skillState.recentMistakes.length > 30) {
      next.skillState.recentMistakes.shift();
    }
    next.coachState.lastTargetPattern = evaluation.mistakeSubtype || evaluation.mistakeType;
  }

  next.coachState.todayPrompt = null;

  saveProfile(next);
  return next;
}

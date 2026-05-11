const KEY = 'chloe_coach_history';

export function loadHistory() {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || '[]');
    return Array.isArray(raw) ? raw : [];
  } catch {
    return [];
  }
}

export function saveEntry(entry) {
  const history = loadHistory();
  const next = [entry, ...history];
  localStorage.setItem(KEY, JSON.stringify(next));
  return next;
}

export function clearHistory() {
  localStorage.removeItem(KEY);
}

export function avgScore(entry) {
  const scores = entry.scores || {};
  const accuracy = scores.accuracy || 0;
  const naturalness = scores.naturalness || 0;
  const businessTone = scores.businessTone || 0;
  return Math.round((accuracy + naturalness + businessTone) / 3);
}

export function summarize(history) {
  const total = history.length;

  let scoreSum = 0;
  const mistakeCounts = {};
  for (const entry of history) {
    scoreSum += avgScore(entry);
    const type = entry.mistakeType || 'Other';
    if (type !== 'None') {
      mistakeCounts[type] = (mistakeCounts[type] || 0) + 1;
    }
  }

  const average = total > 0 ? Math.round(scoreSum / total) : 0;
  const sorted = Object.entries(mistakeCounts).sort(function (a, b) {
    return b[1] - a[1];
  });
  const topMistake = sorted.length > 0 ? sorted[0][0] : null;

  return { total, average, topMistake, mistakeCounts };
}

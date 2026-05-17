import { daysSinceLastSession } from './profile.js';

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function greeting(profile) {
  const name = profile.identity.name || '';
  const days = daysSinceLastSession(profile);
  const lastPattern = profile.coachState.lastTargetPattern;

  if (!profile.engagement.lastSessionAt) {
    return pick([
      `반가워요${name ? ', ' + name : ''}. 짧은 거 하나만 해볼게요.`,
      `안녕하세요${name ? ' ' + name : ''}. 첫 문장, 같이 가볼까요?`,
    ]);
  }

  if (days >= 11) {
    return pick([
      `오랜만이에요${name ? ' ' + name : ''}. 부담 없이, 한 문장만.`,
      `다시 만나서 좋아요. 가볍게 갈게요.`,
    ]);
  }

  if (days >= 6) {
    if (lastPattern) {
      return `${name ? name + ', ' : ''}지난번 ${lastPattern} 다시 한번 볼래요?`;
    }
    return pick([
      `다시 시작해볼까요? 짧게.`,
      `${name ? name + ', ' : ''}오늘만 한 문장.`,
    ]);
  }

  if (days >= 3) {
    if (lastPattern) {
      return `${lastPattern}, 다시 한번 볼게요.`;
    }
    return pick([
      `오늘 문장이에요.`,
      `짧게 한 문장 갈게요.`,
    ]);
  }

  if (lastPattern && days <= 1) {
    return pick([
      `오늘은 ${lastPattern} 한 번 더.`,
      `같은 패턴, 한 번만 더.`,
    ]);
  }

  return pick([
    `오늘 문장이에요.`,
    `시작해볼까요?`,
    `짧게 하나.`,
  ]);
}

export function feedbackHeader(ok) {
  return ok
    ? pick(['좋아요.', '네, 자연스러워요.', '그게 맞아요.', '딱 그거예요.'])
    : pick(['거의 다 왔어요.', '한 번만 더.', '비슷해요.', '아쉬워요.']);
}

export function closing(profile) {
  const s = profile.engagement.currentStreak;
  if (s >= 7) return `${s}일 연속이에요. 내일도 만나요.`;
  if (s >= 3) return `${s}일째예요. 같은 시간에 또 봐요.`;
  if (s === 1) return `첫 날 완료. 내일도 짧게 한 문장.`;
  return `내일 다시 만나요.`;
}

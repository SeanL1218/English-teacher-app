import { daysSinceLastSession } from './profile.js';

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function honorific(name) {
  return name ? `${name}님` : '';
}

export function greeting(profile, isReview = false) {
  const name = profile.identity.name || '';
  const h = honorific(name);
  const days = daysSinceLastSession(profile);
  const lastPattern = profile.coachState.lastTargetPattern;

  if (isReview) {
    return pick([
      `${h}, 지난번에 헷갈렸던 표현 다시 해볼래요?`,
      `${h ? h + ', ' : ''}복습 한 번 해볼까요?`,
      `같은 표현 한 번만 더 ${h ? h + '.' : ''}`.trim(),
    ]);
  }

  if (!profile.engagement.lastSessionAt) {
    return pick([
      `반가워요${h ? ' ' + h : ''}. 짧은 거 하나만 해볼게요.`,
      `${h ? h + ', ' : '안녕하세요. '}첫 문장 같이 가볼까요?`,
    ]);
  }

  if (days >= 11) {
    return pick([
      `오랜만이에요${h ? ' ' + h : ''}. 부담 없이, 한 문장만.`,
      `다시 만나서 좋아요${h ? ' ' + h : ''}. 가볍게 갈게요.`,
    ]);
  }

  if (days >= 6) {
    if (lastPattern) {
      return `${h ? h + ', ' : ''}지난번 ${lastPattern} 다시 한번 볼래요?`;
    }
    return pick([
      `${h ? h + ', ' : ''}다시 시작해볼까요? 짧게.`,
      `${h ? h + ', ' : ''}오늘만 한 문장.`,
    ]);
  }

  if (days >= 3) {
    if (lastPattern) {
      return `${lastPattern}, 다시 한번 볼게요.`;
    }
    return pick([
      `오늘 문장이에요${h ? ', ' + h : ''}.`,
      `짧게 한 문장 갈게요.`,
    ]);
  }

  if (lastPattern && days <= 1) {
    return pick([
      `오늘은 ${lastPattern} 한 번 더${h ? ', ' + h : ''}.`,
      `같은 패턴, 한 번만 더.`,
    ]);
  }

  return pick([
    `${h ? h + ', ' : ''}오늘도 90초만 해볼까요?`,
    `${h ? h + ', ' : ''}오늘 문장이에요.`,
    `시작해볼까요${h ? ', ' + h : ''}?`,
  ]);
}

export function feedbackHeader(ok, profile) {
  const name = profile?.identity?.name || '';
  const h = honorific(name);
  return ok
    ? pick([
        `좋아요${h ? ' ' + h : ''}.`,
        `네, 자연스러워요.`,
        `그게 맞아요${h ? ', ' + h : ''}.`,
        `이번엔 더 자연스러웠어요${h ? ' ' + h : ''}.`,
      ])
    : pick([
        `거의 다 왔어요${h ? ' ' + h : ''}.`,
        `한 번만 더${h ? ', ' + h : ''}.`,
        `비슷해요.`,
        `아쉬워요${h ? ' ' + h : ''}.`,
      ]);
}

export function closing(profile) {
  const name = profile.identity.name || '';
  const h = honorific(name);
  const s = profile.engagement.currentStreak;
  if (s >= 7) return `${s}일 연속이에요${h ? ', ' + h : ''}. 내일도 만나요.`;
  if (s >= 3) return `${s}일째예요${h ? ', ' + h : ''}. 같은 시간에 또 봐요.`;
  if (s === 1) return `첫 날 완료${h ? ', ' + h : ''}. 내일도 짧게 한 문장.`;
  return `내일 다시 만나요${h ? ', ' + h : ''}.`;
}

export const RUSH_PENALTY = 500;

export function rapidAnswerLimit(question) {
  const text = [question.q, question.a, ...question.wrong].join(' ');
  const words = text.trim().split(/\s+/).length;
  return Math.max(1000, Math.min(2000, 450 + words * 22));
}

// Timing is only a clue. Require both repeated very short response times and
// mostly incorrect answers; fast, accurate retrieval must never be penalised.
export function assessAnswerPattern(history, previous = {}) {
  const guard = {
    warned: previous.warned === true,
    lastEventAttempt: Number.isInteger(previous.lastEventAttempt) ? previous.lastEventAttempt : 0,
    penalties: Number.isInteger(previous.penalties) ? previous.penalties : 0,
  };
  const sinceEvent = history.length - guard.lastEventAttempt;
  if (sinceEvent < 5) return {guard, event:null};
  const window = history.slice(-5);
  if (window.some(a => !Number.isFinite(a.responseMs) || a.responseMs < 0 || !Number.isFinite(a.rapidLimitMs))) {
    return {guard, event:null};
  }
  const rapid = window.filter(a => a.responseMs < a.rapidLimitMs);
  const rapidWrong = rapid.filter(a => a.correct === false);
  if (rapid.length < 4 || rapidWrong.length < 3) return {guard, event:null};
  const event = guard.warned ? {kind:'penalty',points:RUSH_PENALTY} : {kind:'warning',points:0};
  guard.warned = true;
  guard.lastEventAttempt = history.length;
  if (event.kind === 'penalty') guard.penalties++;
  return {guard, event};
}

export const DURATION_MS = 300000;
export const SEGMENTS = [
  {label:'+100',value:100}, {label:'+500',value:500}, {label:'−250',value:-250},
  {label:'+200',value:200}, {label:'×2',multiplier:2}, {label:'+750',value:750},
  {label:'+300',value:300}, {label:'+1,000',value:1000}, {label:'+150',value:150},
  {label:'−500',value:-500}, {label:'+400',value:400}, {label:'+250',value:250},
  {label:'×3',multiplier:3}, {label:'+600',value:600}, {label:'+100',value:100},
  {label:'+1,500',value:1500}, {label:'+350',value:350}, {label:'−100',value:-100},
  {label:'+800',value:800}, {label:'×2',multiplier:2}, {label:'+200',value:200},
  {label:'+450',value:450}, {label:'+1,000',value:1000}, {label:'+500',value:500},
];
export function applySegment(score, segment) {
  return Math.min(Number.MAX_SAFE_INTEGER, Math.max(Number.MIN_SAFE_INTEGER,
    segment.multiplier ? score * segment.multiplier : score + segment.value));
}
export function shuffle(items, random = Math.random) {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
export function balancedDeck(questions, random = Math.random) {
  const groups = new Map();
  for (const q of questions) {
    if (!groups.has(q.topic)) groups.set(q.topic, []);
    groups.get(q.topic).push(q);
  }
  const buckets = [...groups.values()].map(g => shuffle(g, random));
  const deck = [];
  while (buckets.some(b => b.length)) {
    for (const b of shuffle(buckets, random)) if (b.length) deck.push(b.pop());
  }
  return deck;
}
export function remainingMs(deadline, now) { return Math.max(0, deadline - now); }
export function timeLabel(ms) {
  const s = Math.max(0, Math.ceil(ms / 1000));
  return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
}
// Drawing starts at twelve o'clock. Stop at the centre of the chosen wedge.
export function targetRotation(current, index, laps = 4, count = SEGMENTS.length) {
  const turn = Math.PI * 2;
  const end = ((turn - (index + .5) * turn / count) % turn + turn) % turn;
  const normalized = ((current % turn) + turn) % turn;
  return current + laps * turn + ((end - normalized + turn) % turn);
}
export function pointedSegment(rotation, count = SEGMENTS.length) {
  const turn = Math.PI * 2;
  const angle = ((-rotation % turn) + turn) % turn;
  return Math.floor(angle / (turn / count)) % count;
}

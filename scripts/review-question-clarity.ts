import { curriculumTopics } from "../app/curriculum-topics";
import { ibTopics } from "../app/ib-question-bank";
import { extraQuestions } from "../app/question-bank";
import { scientificSkillsTopics } from "../app/scientific-skills-question-bank";
import { year10Topics } from "../app/year10-question-bank";
import { year11Topics } from "../app/year11-question-bank";
import { seniorTopics } from "../app/year12-question-bank";
import { year13Topics } from "../app/year13-question-bank";
import { expandedOneWordQuestions, expandedQuestions } from "../app/year-group-expansion";
import { clarifyQuestion } from "../app/question-clarity";

type Question = { q: string; a: string; kind: "short" | "explain" };
type Topic = {
  id: string;
  year: number | "IB";
  name: string;
  course?: string;
  questions: Question[];
  oneWordQuestions?: Question[];
};

function unique(questions: Question[]) {
  const seen = new Set<string>();
  return questions.filter((question) => {
    const key = question.q.trim().toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

const yearGroupTopics = [
  ...curriculumTopics.map((topic) => ({ ...topic, questions: [...topic.questions, ...(extraQuestions[topic.id] ?? [])] })),
  ...year10Topics,
  ...year11Topics,
  ...seniorTopics,
  ...year13Topics,
  ...scientificSkillsTopics,
] as Topic[];

const topics = [
  ...yearGroupTopics.map((topic) => ({
    ...topic,
    questions: unique([...topic.questions, ...(expandedQuestions[topic.id] ?? [])].map(clarifyQuestion)),
    oneWordQuestions: topic.oneWordQuestions?.length
      ? unique([...topic.oneWordQuestions, ...(expandedOneWordQuestions[topic.id] ?? [])].map(clarifyQuestion))
      : [],
  })),
  ...(ibTopics as Topic[]).map((topic) => ({
    ...topic,
    questions: unique(topic.questions.map(clarifyQuestion)),
    oneWordQuestions: topic.oneWordQuestions?.length
      ? unique(topic.oneWordQuestions.map(clarifyQuestion))
      : [],
  })),
];

const entries = topics.flatMap((topic) => [
  ...topic.questions.map((question) => ({ topic: topic.id, bank: "main", ...question })),
  ...(topic.oneWordQuestions ?? []).map((question) => ({ topic: topic.id, bank: "one-word", ...question })),
]);

const checks: Array<[string, (entry: (typeof entries)[number]) => boolean]> = [
  ["indirect equation clue", ({ q }) => /^(?:what|which).+\bcalculated using\b/i.test(q)],
  ["malformed response command", ({ q }) => /^(?:Name|State|Define|Describe|Write)\b.*\b(?:that that|the is|that on|that of|that for|that do (?!not\b))\b/i.test(q)],
  ["yes-no opening", ({ q }) => /^(?:is|are|can|could|do|does|did|will|would|should|has|have|had)\b/i.test(q)],
  ["long answer to short prompt", ({ a, kind }) => kind === "short" && a.trim().split(/\s+/).length > 16],
  ["explanation answer without response command", ({ q, a, kind }) => kind === "explain" && a.trim().split(/\s+/).length > 14 && /^(?:what|which)\b/i.test(q) && !/\b(?:explain|describe|compare|justify|evaluate|calculate|state|give|name|identify)\b/i.test(q)],
  ["unclear referent", ({ q }) => /^(?:what|which|how|why) (?:does|do|is|are|can|could|would|should) (?:it|this|that|they|these|those)\b/i.test(q)],
  ["generic learner scenario", ({ q }) => /\b(?:a student is revising|what should they remember|important when studying|helps explain)\b/i.test(q)],
  ["awkward definition command", ({ q }) => /^Define (?:one|reached|formed|produced|released|used|needed|found|measured|shown|the (?:first|main|primary|overall))\b/i.test(q)],
  ["definition rewritten as naming", ({ q, kind }) => kind === "explain" && /^Name (?!one\b|the (?:two|three|four|five|six)\b)(?:a |an )?[a-z][a-z -]{0,30}\.$/i.test(q)],
  ["compressed classroom wording", ({ q }) => !/^(?:What|Which) type of\b/i.test(q) && /^(?:What|Which)\s+(?:[a-z-]+\s+){0,3}(?:charge state|motion state|category|connection|arrangement|idea|graph feature|graph quantity)\b/i.test(q)],
  ["broken definition wording", ({ q }) => /^Define meant by\b/i.test(q)],
  ["vague scientific-idea prompt", ({ q }) => /Explain one important scientific idea about/i.test(q)],
];

for (const [label, matches] of checks) {
  const found = entries.filter(matches);
  console.log(`\n${label}: ${found.length}`);
  for (const entry of found.slice(0, 30)) console.log(`${entry.topic} [${entry.bank}] ${entry.q} -> ${entry.a}`);
}

const openingCounts = new Map<string, number>();
for (const { q } of entries) {
  const opening = q.trim().split(/\s+/).slice(0, 4).join(" ").replace(/[?.!,;:]$/, "");
  openingCounts.set(opening, (openingCounts.get(opening) ?? 0) + 1);
}

console.log("\nMost common four-word openings:");
for (const [opening, count] of [...openingCounts.entries()].sort((left, right) => right[1] - left[1]).slice(0, 80)) {
  console.log(`${count}\t${opening}`);
}

for (const lead of ["What", "Which"]) {
  const nouns = new Map<string, number>();
  for (const { q } of entries) {
    const match = q.match(new RegExp(`^${lead}\\s+([^\\s?.!,;:]+)`, "i"));
    if (!match) continue;
    const noun = match[1].toLowerCase();
    nouns.set(noun, (nouns.get(noun) ?? 0) + 1);
  }
  console.log(`\nWords after ${lead}:`);
  for (const [noun, count] of [...nouns.entries()].sort((left, right) => right[1] - left[1]).slice(0, 60)) {
    console.log(`${count}\t${noun}`);
  }
}

const compressedStem = /^(?:What|Which)\s+(?:[a-z-]+\s+){0,3}(?:state|category|feature|condition|situation|arrangement|connection|idea|case|property|factor|behaviour|process|method|effect|event|rule|pattern|relationship)\b/i;
const compressed = entries.filter(({ q }) => compressedStem.test(q));
console.log(`\ncompressed stems: ${compressed.length}`);
for (const entry of compressed.slice(0, 240)) console.log(`${entry.topic} [${entry.bank}] ${entry.q} -> ${entry.a}`);

console.log(`\nReviewed ${entries.length.toLocaleString("en-NZ")} prompts across ${topics.length} topics.`);

if (process.env.SHOW_QUESTION_SAMPLES === "1") {
  console.log("\nRepresentative question from every topic:");
  for (const topic of topics) {
    const main = topic.questions[Math.floor(topic.questions.length / 2)];
    const oneWord = topic.oneWordQuestions?.[Math.floor((topic.oneWordQuestions.length) / 2)];
    const label = `${topic.year} ${topic.course ?? topic.name}`;
    console.log(`${label} | ${topic.name} | ${main.q} -> ${main.a}`);
    if (oneWord) console.log(`${label} | ${topic.name} [one-word] | ${oneWord.q} -> ${oneWord.a}`);
  }
}

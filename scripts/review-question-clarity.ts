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
type Topic = { id: string; questions: Question[]; oneWordQuestions?: Question[] };

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
];

for (const [label, matches] of checks) {
  const found = entries.filter(matches);
  console.log(`\n${label}: ${found.length}`);
  for (const entry of found.slice(0, 30)) console.log(`${entry.topic} [${entry.bank}] ${entry.q} -> ${entry.a}`);
}

console.log(`\nReviewed ${entries.length.toLocaleString("en-NZ")} prompts across ${topics.length} topics.`);

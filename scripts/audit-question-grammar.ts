import { curriculumTopics } from "../app/curriculum-topics";
import { ibTopics } from "../app/ib-question-bank";
import { extraQuestions } from "../app/question-bank";
import { scientificSkillsTopics } from "../app/scientific-skills-question-bank";
import { year10Topics } from "../app/year10-question-bank";
import { year11Topics } from "../app/year11-question-bank";
import { seniorTopics } from "../app/year12-question-bank";
import { year13Topics } from "../app/year13-question-bank";
import { expandedOneWordQuestions, expandedQuestions } from "../app/year-group-expansion";
import { clarifyQuestion, isBareYesNoQuestion } from "../app/question-clarity";

type AuditQuestion = {
  q: string;
  a: string;
  difficulty: "foundation" | "core" | "stretch";
  kind: "short" | "explain";
};

type AuditTopic = {
  id: string;
  year: number | "IB";
  name: string;
  questions: AuditQuestion[];
  oneWordQuestions?: AuditQuestion[];
};

function uniqueQuestionWording(questions: AuditQuestion[]) {
  const seen = new Set<string>();
  return questions.filter((question) => {
    const key = question.q.trim().toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

const yearGroupTopics = [
  ...curriculumTopics.map((topic) => ({
    ...topic,
    questions: [...topic.questions, ...(extraQuestions[topic.id] ?? [])],
  })),
  ...year10Topics,
  ...year11Topics,
  ...seniorTopics,
  ...year13Topics,
  ...scientificSkillsTopics,
] as AuditTopic[];

const topics: AuditTopic[] = [
  ...yearGroupTopics.map((topic) => ({
    ...topic,
    questions: uniqueQuestionWording([
      ...topic.questions,
      ...(typeof topic.year === "number" && topic.year >= 7 && topic.year <= 9
        ? []
        : (expandedQuestions[topic.id] ?? [])),
    ].filter((question) => !isBareYesNoQuestion(question)).map(clarifyQuestion)),
    oneWordQuestions: topic.oneWordQuestions?.length
      ? uniqueQuestionWording([
          ...topic.oneWordQuestions,
          ...(typeof topic.year === "number" && topic.year >= 7 && topic.year <= 9
            ? []
            : (expandedOneWordQuestions[topic.id] ?? [])),
        ].filter((question) => !isBareYesNoQuestion(question)).map(clarifyQuestion))
      : [],
  })),
  ...(ibTopics as AuditTopic[]).map((topic) => ({
    ...topic,
    questions: uniqueQuestionWording(topic.questions.filter((question) => !isBareYesNoQuestion(question)).map(clarifyQuestion)),
    oneWordQuestions: topic.oneWordQuestions?.length
      ? uniqueQuestionWording(topic.oneWordQuestions.filter((question) => !isBareYesNoQuestion(question)).map(clarifyQuestion))
      : [],
  })),
];

const entries = topics.flatMap((topic) => [
  ...topic.questions.map((question) => ({ topic, question, bank: "main" })),
  ...(topic.oneWordQuestions ?? []).map((question) => ({ topic, question, bank: "one-word" })),
]);

const malformedPatterns: Array<[RegExp, string]> = [
  [
    /\b(?:whether|why|how)\s+(?:all|both|most|many|some|few)\s+(?:do|does|did)\s+(?:arteries|veins|cells|particles|objects|materials|elements|atoms|molecules|ions|genes|organisms|plants|animals|waves|forces|circuits|reactions)\b/i,
    "misplaced auxiliary verb after a quantifier",
  ],
  [
    /\b(?:help|affect|change|increase|decrease|move|react|form|show|identify|explain|compare)\s+(?:can|could|will|would|should)\b/i,
    "modal verb is in the wrong position",
  ],
  [
    /^Name (?:one|two|three|four|five|six) (?:processes?|factors?|features?|ways?|reasons?|conditions?|properties?|examples?) (?:transfer|occur|happen|show|contain|carry|affect|increase|decrease|control|cause|produce)\b/i,
    "missing linking word such as 'that' after a numbered noun phrase",
  ],
  [
    /^Identify which (?:stays|controls|occurs|happens|shows|provides|causes)\b/i,
    "unnatural 'Identify which' construction",
  ],
  [
    /^Identify which evidence can compare\b/i,
    "evidence prompt is grammatically incomplete",
  ],
  [
    /^Write the arrow in a chemical equation\b/i,
    "question asks for the symbol rather than the meaning expected by the answer",
  ],
];

const violations: string[] = [];

for (const { topic, question, bank } of entries) {
  const prompt = question.q.trim();
  for (const [pattern, reason] of malformedPatterns) {
    if (pattern.test(prompt)) {
      violations.push(`${topic.id} (${bank}): ${reason}: ${prompt}`);
    }
  }
}

if (topics.length < 168 || entries.length < 9_000) {
  violations.push(`grammar-audit coverage unexpectedly fell to ${entries.length} prompts across ${topics.length} topics`);
}

if (violations.length) {
  throw new Error(`Question grammar audit failed with ${violations.length} issue(s):\n${violations.join("\n")}`);
}

console.log(`Question grammar audit passed: ${entries.length.toLocaleString("en-NZ")} rendered prompts across ${topics.length} topics passed the malformed-grammar regression checks.`);

import { acidsBasesConcepts } from "./year10-data/acids-bases";
import { atomsIonsPeriodicConcepts } from "./year10-data/atoms-ions-periodic";
import { earthScienceConcepts } from "./year10-data/earth-science";
import { electricityConcepts } from "./year10-data/electricity";
import { forcesMotionConcepts } from "./year10-data/forces-motion";
import { geneticsConcepts } from "./year10-data/genetics";
import { humanBodyConcepts } from "./year10-data/human-body";

type Difficulty = "foundation" | "core" | "stretch";
type QuestionKind = "short" | "explain";

export type Year10Question = {
  q: string;
  a: string;
  difficulty: Difficulty;
  kind: QuestionKind;
};

export type Year10Topic = {
  id: string;
  year: 10;
  name: string;
  strand: "Biology" | "Chemistry" | "Physics";
  keywords: string[];
  questions: Year10Question[];
  oneWordQuestions: Year10Question[];
};

type ConceptRow = readonly [
  answer: string,
  clueA: string,
  clueB: string,
  difficulty: Difficulty,
];

type TopicSpec = {
  id: string;
  name: string;
  strand: Year10Topic["strand"];
  concepts: readonly ConceptRow[];
};

/*
 * Year 10 retrieval questions are tied directly to the St Peter's Year 10
 * unit plans/SLOs. Prompts are written so students can immediately understand
 * what they are being asked, with one intended answer per prompt.
 */
function makeTopic(spec: TopicSpec): Year10Topic {
  const questions = spec.concepts.flatMap(([answer, clueA, clueB, difficulty]) => [
    { q: clueA, a: answer, difficulty, kind: "short" as const },
    { q: clueB, a: answer, difficulty, kind: "short" as const },
  ]);

  return {
    id: spec.id,
    year: 10,
    name: spec.name,
    strand: spec.strand,
    keywords: spec.concepts.map(([answer]) => answer),
    questions,
    oneWordQuestions: questions.map((question) => ({ ...question })),
  };
}

export const year10Topics: Year10Topic[] = [
  makeTopic({
    id: "y10-atoms-ions-periodic",
    name: "Atoms, Ions and the Periodic Table",
    strand: "Chemistry",
    concepts: atomsIonsPeriodicConcepts,
  }),
  makeTopic({
    id: "y10-forces-motion",
    name: "Forces and Motion",
    strand: "Physics",
    concepts: forcesMotionConcepts,
  }),
  makeTopic({
    id: "y10-genetics",
    name: "Genetics",
    strand: "Biology",
    concepts: geneticsConcepts,
  }),
  makeTopic({
    id: "y10-acids-bases",
    name: "Acids and Bases",
    strand: "Chemistry",
    concepts: acidsBasesConcepts,
  }),
  makeTopic({
    id: "y10-electricity",
    name: "Electricity",
    strand: "Physics",
    concepts: electricityConcepts,
  }),
  makeTopic({
    id: "y10-human-body",
    name: "Human Body",
    strand: "Biology",
    concepts: humanBodyConcepts,
  }),
  makeTopic({
    id: "y10-earth-science",
    name: "Earth Science",
    strand: "Physics",
    concepts: earthScienceConcepts,
  }),
];

if (year10Topics.length !== 7) {
  throw new Error(`Year 10 must contain 7 topics; found ${year10Topics.length}.`);
}

const vagueQuestionPattern =
  /explain one important scientific idea|importance of|why it matters|what do you know about|tell me about|\bthis unit\b|\bthis topic\b/i;

const forbiddenTopicContent: Record<string, RegExp> = {
  "y10-atoms-ions-periodic": /\bisotope\b|\bisoelectronic\b|\bhalogen\b|\bnoble gas\b/i,
  "y10-forces-motion": /Newton'?s third law|\bmomentum\b|\bvector\b|\bstopping distance\b|\binertia\b/i,
  "y10-genetics": /\bbase sequence\b|\bcodominance\b|\bsex chromosome\b|\bpedigree\b/i,
  "y10-acids-bases": /\btitration\b|\bequivalence point\b|\bend point\b/i,
};

for (const topic of year10Topics) {
  if (topic.questions.length < 40) {
    throw new Error(`${topic.id} must contain at least 40 mixed questions.`);
  }
  if (topic.oneWordQuestions.length < 40) {
    throw new Error(`${topic.id} must contain at least 40 short-answer questions.`);
  }

  for (const bank of [topic.questions, topic.oneWordQuestions]) {
    const unique = new Set(bank.map((question) => question.q.trim().toLowerCase()));
    if (unique.size !== bank.length) {
      throw new Error(`${topic.id} contains duplicate question wording.`);
    }
    if (bank.some((question) => vagueQuestionPattern.test(question.q))) {
      throw new Error(`${topic.id} contains a vague or contextless Year 10 prompt.`);
    }
  }

  const forbidden = forbiddenTopicContent[topic.id];
  if (forbidden) {
    const searchable = [
      ...topic.keywords,
      ...topic.questions.flatMap((question) => [question.q, question.a]),
    ].join(" ");
    if (forbidden.test(searchable)) {
      throw new Error(`${topic.id} contains content outside the taught Year 10 unit plan.`);
    }
  }
}

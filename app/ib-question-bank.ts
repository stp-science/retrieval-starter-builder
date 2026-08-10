import { biologyIbTopicSpecs } from "./ib-biology-data";
import { chemistryIbTopicSpecs } from "./ib-chemistry-data";
import { physicsIbTopicSpecs } from "./ib-physics-data";
import type { IbConcept, IbSubject, IbTopicSpec } from "./ib-question-types";

type Difficulty = "foundation" | "core" | "stretch";
type QuestionKind = "short" | "explain";

export type IbQuestion = {
  q: string;
  a: string;
  difficulty: Difficulty;
  kind: QuestionKind;
};

export type IbTopic = {
  id: string;
  year: "IB";
  name: string;
  course: IbSubject;
  standard: string;
  level: "SL & HL" | "HL only";
  programme: "IB";
  strand: IbSubject;
  keywords: string[];
  questions: IbQuestion[];
  oneWordQuestions: IbQuestion[];
};

export const ibSubjects: IbSubject[] = ["Biology", "Chemistry", "Physics"];

function capitalise(sentence: string) {
  return sentence.charAt(0).toUpperCase() + sentence.slice(1);
}

const keywordStopwords = new Set([
  "about", "after", "allow", "allows", "because", "being", "between", "changes", "different",
  "during", "helps", "important", "needed", "provides", "their", "therefore", "these", "through",
  "using", "which", "while", "within", "without",
]);

function topicKeywords(spec: IbTopicSpec) {
  const terms = spec.concepts.map(([term]) => term);
  const supporting = spec.concepts.flatMap(([, definition, significance]) =>
    (`${definition} ${significance}`.toLowerCase().match(/[a-z][a-z'-]{4,}/g) ?? [])
      .filter((word) => !keywordStopwords.has(word)),
  );
  return [...new Set([...terms, ...supporting])].slice(0, 16);
}

function buildQuestions(topic: IbTopicSpec): IbQuestion[] {
  return topic.concepts.flatMap((concept: IbConcept, index: number) => {
    const [term, definition, significance] = concept;
    const next = topic.concepts[(index + 1) % topic.concepts.length];
    return [
      {
        q: `What is meant by ${term}?`,
        a: capitalise(definition),
        difficulty: "foundation" as const,
        kind: "explain" as const,
      },
      {
        q: `Explain the importance of ${term} in ${topic.name}.`,
        a: capitalise(significance),
        difficulty: "core" as const,
        kind: "explain" as const,
      },
      {
        q: `A student is revising ${topic.name}. What should they remember about ${term}?`,
        a: `${capitalise(definition)} ${capitalise(significance)}`,
        difficulty: "core" as const,
        kind: "explain" as const,
      },
      {
        q: `Compare how ${term} and ${next[0]} contribute to ${topic.name}.`,
        a: `${term}: ${capitalise(significance)} ${next[0]}: ${capitalise(next[2])}`,
        difficulty: "stretch" as const,
        kind: "explain" as const,
      },
    ];
  });
}

function buildOneWordQuestions(topic: IbTopicSpec): IbQuestion[] {
  return topic.concepts.flatMap(([term, definition]) => [
    {
      q: `Which key term matches this description: ${definition}?`,
      a: term,
      difficulty: "core" as const,
      kind: "short" as const,
    },
    {
      q: `Name the concept described as ${definition}.`,
      a: term,
      difficulty: "core" as const,
      kind: "short" as const,
    },
  ]);
}

function makeTopic(spec: IbTopicSpec): IbTopic {
  return {
    id: spec.id,
    year: "IB",
    name: spec.name,
    course: spec.subject,
    standard: spec.code,
    level: spec.level,
    programme: "IB",
    strand: spec.subject,
    keywords: topicKeywords(spec),
    questions: buildQuestions(spec),
    oneWordQuestions: buildOneWordQuestions(spec),
  };
}

export const ibTopics: IbTopic[] = [
  ...biologyIbTopicSpecs,
  ...chemistryIbTopicSpecs,
  ...physicsIbTopicSpecs,
].map(makeTopic);

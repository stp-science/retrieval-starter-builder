import { topicsPart0, visualsPart0 } from "./curriculum-data/part-0";
import { topicsPart1, visualsPart1 } from "./curriculum-data/part-1";
import { topicsPart2, visualsPart2 } from "./curriculum-data/part-2";
import { topicsPart3, visualsPart3 } from "./curriculum-data/part-3";
import { topicsPart4, visualsPart4 } from "./curriculum-data/part-4";
import { topicsPart5, visualsPart5 } from "./curriculum-data/part-5";
import { topicsPart6, visualsPart6 } from "./curriculum-data/part-6";
import { topicsPart7, visualsPart7 } from "./curriculum-data/part-7";
import { topicsPart8, visualsPart8 } from "./curriculum-data/part-8";
import { topicsPart9, visualsPart9 } from "./curriculum-data/part-9";
import { topicsPart10, visualsPart10 } from "./curriculum-data/part-10";
import { topicsPart11, visualsPart11 } from "./curriculum-data/part-11";
import { topicsPart12, visualsPart12 } from "./curriculum-data/part-12";
import { topicsPart13, visualsPart13 } from "./curriculum-data/part-13";
import { topicsPart14, visualsPart14 } from "./curriculum-data/part-14";

export type CurriculumQuestion = {
  q: string;
  a: string;
  difficulty: "foundation" | "core" | "stretch";
  kind: "short" | "explain";
};

export type CurriculumTopic = {
  id: string;
  year: 7 | 8 | 9;
  name: string;
  strand: "Biology" | "Chemistry" | "Physics";
  keywords: string[];
  questions: CurriculumQuestion[];
};

export type CurriculumVisual = {
  symbol: string;
  answer: string;
};

export const curriculumTopics: CurriculumTopic[] = [
  ...topicsPart0,
  ...topicsPart1,
  ...topicsPart2,
  ...topicsPart3,
  ...topicsPart4,
  ...topicsPart5,
  ...topicsPart6,
  ...topicsPart7,
  ...topicsPart8,
  ...topicsPart9,
  ...topicsPart10,
  ...topicsPart11,
  ...topicsPart12,
  ...topicsPart13,
  ...topicsPart14,
] as CurriculumTopic[];

export const curriculumVisuals: Record<string, CurriculumVisual[]> = Object.assign(
  {},
  visualsPart0,
  visualsPart1,
  visualsPart2,
  visualsPart3,
  visualsPart4,
  visualsPart5,
  visualsPart6,
  visualsPart7,
  visualsPart8,
  visualsPart9,
  visualsPart10,
  visualsPart11,
  visualsPart12,
  visualsPart13,
  visualsPart14,
);

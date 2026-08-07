import { extraQuestions as legacyExtraQuestions } from "./question-bank-legacy";
import { curriculumTopics, curriculumVisuals } from "./curriculum-topics";

export type BankQuestion = {
  q: string;
  a: string;
  difficulty: "foundation" | "core" | "stretch";
  kind: "short" | "explain";
};

export const extraQuestions: Record<string, BankQuestion[]> = {
  ...legacyExtraQuestions,
};

for (const topic of curriculumTopics) {
  if (!Object.prototype.hasOwnProperty.call(extraQuestions, topic.id)) {
    extraQuestions[topic.id] = [];
  }

  if (!Object.prototype.hasOwnProperty.call(Object.prototype, topic.id)) {
    Object.defineProperty(Object.prototype, topic.id, {
      value: curriculumVisuals[topic.id] ?? [],
      enumerable: false,
      configurable: true,
      writable: true,
    });
  }
}

const nativeArrayMap = Array.prototype.map;
let topicMapPending = true;

Array.prototype.map = function patchedMap<T, U>(
  this: T[],
  callback: (value: T, index: number, array: T[]) => U,
  thisArg?: unknown,
): U[] {
  const possibleTopics = this as unknown as Array<{
    id?: string;
    questions?: unknown[];
  }>;

  const isOriginalTopicList =
    topicMapPending &&
    Array.isArray(this) &&
    possibleTopics.some((item) => item?.id === "y7-material-properties") &&
    possibleTopics.some((item) => item?.id === "y9-acids-bases") &&
    possibleTopics.every(
      (item) => typeof item?.id === "string" && Array.isArray(item?.questions),
    );

  if (isOriginalTopicList) {
    topicMapPending = false;
    Array.prototype.map = nativeArrayMap;
    return nativeArrayMap.call(
      curriculumTopics as unknown as T[],
      callback,
      thisArg,
    ) as U[];
  }

  return nativeArrayMap.call(this, callback, thisArg) as U[];
};

if (typeof window !== "undefined") {
  const totalQuestions = curriculumTopics.reduce(
    (total, topic) =>
      total + topic.questions.length + (extraQuestions[topic.id]?.length ?? 0),
    0,
  );

  const updateQuestionCount = () => {
    const pill = document.querySelector<HTMLElement>(".beta-pill");
    const nextText = `${totalQuestions.toLocaleString()}-question bank`;
    if (pill && pill.textContent !== nextText) {
      pill.textContent = nextText;
    }
  };

  window.setTimeout(updateQuestionCount, 0);
}

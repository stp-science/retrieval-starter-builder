export type IbSubject = "Biology" | "Chemistry" | "Physics";

export type IbLevel = "SL & HL" | "HL only";

export type IbConcept = readonly [
  term: string,
  definition: string,
  significance: string,
];

export type IbTopicSpec = {
  id: string;
  code: string;
  name: string;
  subject: IbSubject;
  level: IbLevel;
  concepts: readonly IbConcept[];
};


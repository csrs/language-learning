export enum QuestionSetType {
  Random = "RANDOM",
  All = "ALL",
}

export type Storage = {
  [questionId: number]: number;
};

export type Question = {
  id: number;
  question: string;
  image?: string;
  possibleAnswers: string[];
  answer?: number;
};

export type Answer = {
  id: number;
  question?: string;
  possibleAnswers?: string[];
  answer: number;
};

export type AnswerKey = {
  questionId: number;
  answer: number;
};

export type QuestionAnswerKey = {
  [questionId: number]: number;
};

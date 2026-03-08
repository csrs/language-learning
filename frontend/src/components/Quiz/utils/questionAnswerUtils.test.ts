import { type Question } from "../types/questionAnswerTypes";
import { convertAnswerNumberToString } from "./questionAnswerUtils";

describe("convertAnswerNumberToString", () => {
  const questions: Question[] = [
    { id: 1, question: "Q1", possibleAnswers: ["A", "B", "C"], answer: 0 },
    { id: 2, question: "Q2", possibleAnswers: ["X", "Y", "Z"], answer: 1 },
  ];

  it("returns the correct answer string when valid questionId and answerNumber are given", () => {
    expect(convertAnswerNumberToString(questions, 1, 0)).toBe("A");
    expect(convertAnswerNumberToString(questions, 1, 2)).toBe("C");
    expect(convertAnswerNumberToString(questions, 2, 1)).toBe("Y");
  });

  it("returns undefined when questionId does not exist", () => {
    expect(convertAnswerNumberToString(questions, 999, 0)).toBeUndefined();
  });

  it("returns undefined when answerNumber is out of range", () => {
    expect(convertAnswerNumberToString(questions, 1, 5)).toBeUndefined();
    expect(convertAnswerNumberToString(questions, 2, -1)).toBeUndefined();
  });
});

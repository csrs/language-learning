import { type Answer, type Question } from "../types/questionAnswerTypes";

export const chooseRandomQuestions = (
  mainQuestions: Question[],
  // hamburgQuestions: Question[],
  ommittedQuestionIds?: number[],
): Question[] => {
  const newArray: Question[] = [];
  const chosenMainIndices: number[] = [];
  // const chosenHamburgIndices: number[] = [];
  while (newArray.length < 2) {
    const randomNumber = Math.floor(Math.random() * mainQuestions.length);
    if (
      !chosenMainIndices.includes(randomNumber) &&
      !ommittedQuestionIds?.includes(randomNumber)
    ) {
      newArray.push(mainQuestions[randomNumber]);
      chosenMainIndices.push(randomNumber);
    }
  }
  // while (newArray.length < 33) {
  //   const randomQuestionId =
  //     350 + Math.floor(Math.random() * hamburgQuestions.length);
  //   // todo: refactor how the questions array is structered

  //   if (
  //     !chosenHamburgIndices.includes(randomQuestionId - 350) &&
  //     !ommittedQuestionIds?.includes(randomQuestionId)
  //   ) {
  //     newArray.push(hamburgQuestions[randomQuestionId - 350]);
  //     chosenHamburgIndices.push(randomQuestionId - 350);
  //   }
  // }

  return newArray;
};

export const findQuestionStringById = (
  questions: Question[],
  questionId: number,
): string | undefined => {
  const questionResult: Question | undefined = questions.find(
    (q) => q.id === questionId,
  );
  if (!questionResult) {
    return undefined;
  }
  return questionResult.question;
};

export const convertAnswerNumberToString = (
  questions: Question[],
  questionId: number,
  answerNumber: number,
): string | undefined => {
  const questionResult: Question | undefined = questions.find(
    (q) => q.id === questionId,
  );

  if (!questionResult) {
    return undefined;
  }
  return questionResult.possibleAnswers[answerNumber];
};

export const compareSubmittedAnswer = (
  questionId: number,
  submittedAnswer: number,
  answers: Answer[],
): boolean => {
  const answer = answers.find((a) => a.id === questionId);
  if (!answer) {
    return false;
  }
  return answer.answer === submittedAnswer;
};

export const isSessionStorageAvailable = () => {
  try {
    const testKey = "test";
    sessionStorage.setItem(testKey, "testValue");
    sessionStorage.removeItem(testKey);
    return true;
  } catch (e) {
    console.error("Error: ", e);
    return false;
  }
};

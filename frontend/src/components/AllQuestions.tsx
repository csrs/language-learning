import React, { useState } from "react";
import { allQuestionsReversed } from "../consts/questions";

import "./../App.css";
import { type Question as QuestionType } from "../types/questionAnswerTypes";
import { Question } from "./Question";

export const AllQuestions = () => {
  const [incorrectAnswers, setIncorrectAnswers] =
    useState<QuestionType[]>(allQuestionsReversed);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const submittedAnswers = Array.from(formData.entries()).reduce<
      Record<number, number>
    >((acc, entry) => {
      const [questionId, submittedAnswer] = entry; // name and value from each form element
      const questionIdAsNumber = Number(questionId);
      const submittedAnswerAsNumber = Number(submittedAnswer);
      acc[questionIdAsNumber] = submittedAnswerAsNumber;
      return acc;
    }, {});

    setIncorrectAnswers((prev) =>
      prev.filter((q) => submittedAnswers[q.id] !== q.answer).reverse(),
    );
    window.scrollTo(0, 0);
  };

  return incorrectAnswers.length > 0 ? (
    <div className="column form">
      <form onSubmit={handleSubmit}>
        <fieldset>
          <legend>{incorrectAnswers.length} Questions remaining</legend>
          <div className="questions-container">
            {incorrectAnswers.map((q) => {
              return <Question question={q} />;
            })}
          </div>
          <div className="button-group">
            <button type="submit">
              Submit and remove correctly-answered questions
            </button>
          </div>
        </fieldset>
      </form>
    </div>
  ) : (
    <div>
      <p>You answered all questions correctly!</p>
    </div>
  );
};

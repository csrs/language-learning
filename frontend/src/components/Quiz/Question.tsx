import { type Question as QuestionType } from "./types/questionAnswerTypes";

import "./App.css";
import { GREEN, YELLOW } from "./consts/colors";

export const Question = ({
  question,
  isSubmitted,
  isCorrectlyAnswered,
}: {
  question: QuestionType;
  isSubmitted?: boolean;
  isCorrectlyAnswered?: boolean;
}) => {
  return (
    <>
      <div key={question.id} className="question-item">
        <div
          className="question-content"
          style={{
            backgroundColor: !isSubmitted
              ? ""
              : isCorrectlyAnswered
                ? GREEN
                : YELLOW,
          }}
        >
          <strong>
            <span style={{ color: "red" }}>* </span>
            {`Question #${question.id + 1}: ${question.question}`}
          </strong>
          {question.image && (
            <img src={question.image} style={{ width: "200px" }} />
          )}
        </div>
        {question.possibleAnswers.map((a, index) => {
          return (
            <div key={index}>
              <input
                required
                type="radio"
                id={`question${question.id.toString()}-${index}`}
                name={question.id.toString()}
                value={index.toString()}
              />
              <label htmlFor={`question${question.id.toString()}-${index}`}>
                {a}
              </label>
            </div>
          );
        })}
        <br />
      </div>
    </>
  );
};

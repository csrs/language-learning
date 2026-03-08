import { QuestionSetType } from "./types/questionAnswerTypes";
import "./App.css";
import { useState } from "react";
import { Instructions } from "./Instructions";
import { AllQuestions } from "./AllQuestions";
import { QuestionGroup } from "./QuestionGroup";

export const Quiz = () => {
  const [selectedOption, setSelectedOption] = useState<QuestionSetType>(
    QuestionSetType.Random,
  );

  const handleOptionChange = (value: QuestionSetType) => {
    setSelectedOption(value);
  };

  return (
    <>
      <div className="container">
        <form>
          <div>
            <input
              required
              type="radio"
              id="randomQuestions"
              name="toggle"
              value={QuestionSetType.Random}
              checked={selectedOption === QuestionSetType.Random}
              onChange={() => handleOptionChange(QuestionSetType.Random)}
            />
            <label htmlFor="randomQuestions">2 Random Questions</label>
          </div>
          <div>
            <input
              required
              type="radio"
              id="allQuestions"
              name="toggle"
              value={QuestionSetType.All}
              checked={selectedOption === QuestionSetType.All}
              onChange={() => handleOptionChange(QuestionSetType.All)}
            />
            <label htmlFor="allQuestions">All Questions</label>
          </div>
        </form>
        {selectedOption === QuestionSetType.All ? (
          <>
            <Instructions allQuestionsMode />
            <AllQuestions />
          </>
        ) : (
          <>
            <Instructions allQuestionsMode={false} />
            <QuestionGroup />
          </>
        )}
      </div>
    </>
  );
};

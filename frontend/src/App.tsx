import "./App.css";
import { useState } from "react";
import { QuestionGroup } from "./components/QuestionGroup";
import { AllQuestions } from "./components/AllQuestions";
import { Instructions } from "./components/Instructions";
import { QuestionSetType } from "./types/questionAnswerTypes";
import { Form, MemoryGame } from "./components/TaskList/Form";
import { Page } from "./components/TaskList/Page";

function App() {
  const [selectedOption, setSelectedOption] = useState<QuestionSetType>(
    QuestionSetType.Random,
  );

  const handleOptionChange = (value: QuestionSetType) => {
    setSelectedOption(value);
  };

  return (
    <Page />

    // <div className="container">
    //   <form>
    //     <div>
    //       <input
    //         required
    //         type="radio"
    //         id="randomQuestions"
    //         name="toggle"
    //         value={QuestionSetType.Random}
    //         checked={selectedOption === QuestionSetType.Random}
    //         onChange={() => handleOptionChange(QuestionSetType.Random)}
    //       />
    //       <label htmlFor="randomQuestions">33 Random Questions</label>
    //     </div>
    //     <div>
    //       <input
    //         required
    //         type="radio"
    //         id="allQuestions"
    //         name="toggle"
    //         value={QuestionSetType.All}
    //         checked={selectedOption === QuestionSetType.All}
    //         onChange={() => handleOptionChange(QuestionSetType.All)}
    //       />
    //       <label htmlFor="allQuestions">All Questions</label>
    //     </div>
    //   </form>
    //   {selectedOption === QuestionSetType.All ? (
    //     <>
    //       <Instructions allQuestionsMode />
    //       <AllQuestions />
    //     </>
    //   ) : (
    //     <>
    //       <Instructions allQuestionsMode={false} />
    //       <QuestionGroup />
    //     </>
    //   )}
    // </div>
  );
}

export default App;

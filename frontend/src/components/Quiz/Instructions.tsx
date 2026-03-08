export const Instructions = ({
  allQuestionsMode,
}: {
  allQuestionsMode: boolean;
}) => {
  return (
    <div className="column instructions">
      <strong>Info:</strong>
      <p>
        Questions come from <em>Mein Einbürgerungstest</em> by Hans Jörg
        Schrötter. The "Question #" refers to the actual Allgemeine
        Fragenkatalog question number in the book.
      </p>
      {allQuestionsMode ? (
        <>
          <strong>Instructions:</strong>
          <div>
            <ol>
              <li>Answer all questions.</li>
              <li>
                Click "Submit". Correctly answered questions will be highlighted
                in green. Incorrectly answered questions will be highlighted in
                yellow.
              </li>
              <li>
                The questions you answered incorrectly will still be shown, so
                you can try those again.
              </li>
            </ol>
          </div>
        </>
      ) : (
        <div>
          <strong>Instructions:</strong>
          <div>
            <ol>
              <li>Answer all questions.</li>
              <li>
                Click "Submit". Correctly answered questions will be highlighted
                in green. Incorrectly answered questions will be highlighted in
                yellow.
              </li>
              <li>
                If you correctly answer the same question 3 times, it won't
                appear again. This is kept track of in your browser's Session
                Storage (if your browser allows it).
              </li>
              <li>
                If you want to delete your session storage, click "Delete
                Session Storage". You don't need to refresh the page afterwards.
              </li>
            </ol>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState } from "react";
import QuizList from "./QuizList";
import QuizAttempt from "./QuizAttempt";

function App() {
  const [selectedQuizId, setSelectedQuizId] = useState(null);
  const studentId = 5;

  return (
    <div className="App">
      {!selectedQuizId ? (
        <QuizList studentId={studentId} onSelectQuiz={setSelectedQuizId} />
      ) : (
        <QuizAttempt quizId={selectedQuizId} studentId={studentId} />
      )}
    </div>
  );
}

export default App;

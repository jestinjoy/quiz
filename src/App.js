import React, { useState } from "react";
import QuizList from "./QuizList";
import QuizSummary from "./QuizSummary";

function App() {
  const [selectedQuizId, setSelectedQuizId] = useState(null);
  const studentId = 5; // Example student ID

  return (
    <div className="App">
      {selectedQuizId ? (
        <QuizSummary
          quizId={selectedQuizId}
          studentId={studentId}
          onBack={() => setSelectedQuizId(null)}
        />
      ) : (
        <QuizList studentId={studentId} onViewSummary={setSelectedQuizId} />
      )}
    </div>
  );
}

export default App;

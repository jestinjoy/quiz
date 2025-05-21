import React, { useState } from "react";
import 'katex/dist/katex.min.css';
import QuizList from "./QuizList";
import QuizAttempt from "./QuizAttempt";
import QuizSummary from "./QuizSummary";

function App() {
  const [currentQuizId, setCurrentQuizId] = useState(null);
  const [viewSummaryQuizId, setViewSummaryQuizId] = useState(null);

  const studentId = 5; // You can replace this with login-based ID later

  if (currentQuizId !== null) {
    return (
      <QuizAttempt
        quizId={currentQuizId}
        studentId={studentId}
        onBack={() => setCurrentQuizId(null)} // ✅ add this
      />
    );
  }


  if (viewSummaryQuizId !== null) {
    return (
      <QuizSummary
        quizId={viewSummaryQuizId}
        studentId={studentId}
        onBack={() => setViewSummaryQuizId(null)}
      />
    );
  }

  return (
    <QuizList
      studentId={studentId}
      onSelectQuiz={(quizId) => setCurrentQuizId(quizId)}
      onViewSummary={(quizId) => setViewSummaryQuizId(quizId)}
    />
  );
}

export default App;

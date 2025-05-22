import React, { useState, useEffect } from "react";
import QuizList from "./QuizList";
import QuizAttempt from "./QuizAttempt";
import QuizSummary from "./QuizSummary";
import Login from "./Login";

export default function App() {
  const [student, setStudent] = useState(null);
  const [currentQuizId, setCurrentQuizId] = useState(null);
  const [viewSummaryQuizId, setViewSummaryQuizId] = useState(null);

  // Load student from localStorage on app start
  useEffect(() => {
    const stored = localStorage.getItem("student");
    if (stored) {
      try {
        setStudent(JSON.parse(stored));
      } catch (e) {
        console.error("Invalid student data in localStorage", e);
        localStorage.removeItem("student");
      }
    }
  }, []);

  const handleLogin = (studentData) => {
    localStorage.setItem("student", JSON.stringify(studentData));
    setStudent(studentData);
  };

  const handleLogout = () => {
    localStorage.removeItem("student");
    setStudent(null);
    setCurrentQuizId(null);
    setViewSummaryQuizId(null);
  };

  if (!student) return <Login onLogin={handleLogin} />;

  if (currentQuizId !== null) {
    return (
      <QuizAttempt
        quizId={currentQuizId}
        studentId={student.id}
        onBack={() => setCurrentQuizId(null)}
      />
    );
  }

  if (viewSummaryQuizId !== null) {
    return (
      <QuizSummary
        quizId={viewSummaryQuizId}
        studentId={student.id}
        onBack={() => setViewSummaryQuizId(null)}
      />
    );
  }

  return (
    <div style={{ fontFamily: "sans-serif" }}>
      <div style={{
        textAlign: "right",
        padding: "12px 20px",
        backgroundColor: "#f8f9fa",
        borderBottom: "1px solid #ddd",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }}>
        <span>👋 Welcome, <strong>{student.name}</strong></span>
        <button
          onClick={handleLogout}
          style={{
            backgroundColor: "#dc3545",
            color: "#fff",
            padding: "6px 12px",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer"
          }}
        >
          Logout
        </button>
      </div>

      <QuizList
        studentId={student.id}
        onSelectQuiz={(quizId) => setCurrentQuizId(quizId)}
        onViewSummary={(quizId) => setViewSummaryQuizId(quizId)}
      />
    </div>
  );
}

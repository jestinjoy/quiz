import React, { useEffect, useState } from "react";
import axios from "axios";

export default function QuizList({ studentId, onSelectQuiz, onViewSummary }) {
  const [quizzes, setQuizzes] = useState({
    active: [],
    upcoming: [],
    completed: []
  });

  useEffect(() => {
    axios.get(`http://localhost:8000/list/${studentId}`)
      .then(res => setQuizzes(res.data))
      .catch(err => console.error("Failed to load quizzes", err));
  }, [studentId]);

  const startAndSelectQuiz = async (quizId) => {
    try {
      await axios.post(`http://localhost:8000/start_quiz/${quizId}/${studentId}`);
      onSelectQuiz(quizId);
    } catch (err) {
      alert("Failed to start quiz");
    }
  };

  const buttonStyle = (color) => ({
    marginTop: "10px",
    padding: "8px 16px",
    fontSize: "14px",
    backgroundColor: color === "green" ? "#28a745" : "#6c757d",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer"
  });

  const renderQuizCard = (quiz, type) => (
    <div
      key={quiz.quiz_id}
      style={{
        border: "1px solid #ccc",
        borderRadius: "10px",
        padding: "16px",
        marginBottom: "16px",
        backgroundColor:
          type === "completed" ? "#f2f2f2" :
          type === "active" ? "#e6f9f0" :
          "#fff4e6"
      }}
    >
      <h3>{quiz.title}</h3>
      <p><strong>Start:</strong> {new Date(quiz.start_time).toLocaleString("en-IN")}</p>
      <p><strong>Duration:</strong> {quiz.duration_minutes} mins</p>
      <p><strong>Total Marks:</strong> {quiz.total_marks}</p>

      {quiz.score !== null && (
        <p><strong>Your Score:</strong> {quiz.score} / {quiz.total_marks}</p>
      )}

      {quiz.status === "COMPLETED" && quiz.position && (
        <p><strong>Your Position:</strong> {quiz.position}</p>
      )}

      {quiz.status === "COMPLETED" && quiz.attempted && (
        <button
          style={buttonStyle("gray")}
          onClick={() => onViewSummary(quiz.quiz_id)}
        >
          📄 View Summary
        </button>
      )}

      {quiz.status === "COMPLETED" && !quiz.attempted && (
        <p style={{ color: "gray", fontStyle: "italic" }}>Summary unavailable (not attempted)</p>
      )}


      {type === "active" && (
        <button
          style={buttonStyle("green")}
          onClick={() => startAndSelectQuiz(quiz.quiz_id)}
        >
          ▶️ Start Quiz
        </button>
      )}
    </div>
  );

  return (
    <div style={{ maxWidth: "700px", margin: "auto", padding: "20px" }}>
      <h2>📚 Available Quizzes</h2>

      <h3>🟢 Active</h3>
      {quizzes.active.length > 0 ? (
        [...quizzes.active].reverse().map(q => renderQuizCard(q, "active"))
      ) : <p>No active quizzes.</p>}

      <h3>🕓 Upcoming</h3>
      {quizzes.upcoming.length > 0 ? (
        [...quizzes.upcoming].reverse().map(q => renderQuizCard(q, "upcoming"))
      ) : <p>No upcoming quizzes.</p>}

      <h3>📜 Completed</h3>
      {quizzes.completed.length > 0 ? (
        [...quizzes.completed].reverse().map(q => renderQuizCard(q, "completed"))
      ) : <p>No completed quizzes yet.</p>}
    </div>
  );
}

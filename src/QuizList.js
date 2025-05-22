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

  const buttonStyle = (color) => ({
    marginTop: "10px",
    padding: "12px",
    fontSize: "15px",
    backgroundColor: color === "green" ? "#28a745" : "#6c757d",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    width: "100%",
  });

  const renderQuizCard = (quiz, type) => (
    <div
      key={quiz.quiz_id}
      style={{
        border: "1px solid #ddd",
        borderRadius: "12px",
        padding: "18px",
        marginBottom: "20px",
        backgroundColor:
          type === "completed" ? "#f8f9fa" :
          type === "active" ? "#e6fcef" :
          "#fff8e1",
        boxShadow: "0 4px 8px rgba(0,0,0,0.05)"
      }}
    >
      <h3 style={{ marginBottom: "10px", color: "#333" }}>{quiz.title}</h3>
      <p style={infoText}><strong>🕒 Start:</strong> {new Date(quiz.start_time).toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
        hour12: true,
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      })}</p>
      <p style={infoText}><strong>⏳ Duration:</strong> {quiz.duration_minutes} mins</p>
      <p style={infoText}><strong>🎯 Total Marks:</strong> {quiz.total_marks}</p>

      {quiz.score !== null && (
        <p style={infoText}><strong>✅ Your Score:</strong> {quiz.score} / {quiz.total_marks}</p>
      )}

      {quiz.status === "COMPLETED" && quiz.position && (
        <p style={infoText}><strong>🏆 Your Position:</strong> {quiz.position}</p>
      )}

      {quiz.status === "COMPLETED" && (
        <button
          style={buttonStyle("gray")}
          onClick={() => onViewSummary(quiz.quiz_id)}
        >
          📄 View Summary
        </button>
      )}

      {type === "active" && (
        <button
          style={buttonStyle("green")}
          onClick={() => onSelectQuiz(quiz.quiz_id)}
        >
          ▶️ Start Quiz
        </button>
      )}
    </div>
  );

  const infoText = {
    fontSize: "15px",
    marginBottom: "6px",
    color: "#555"
  };

  return (
    <div style={{
      maxWidth: "90%",
      margin: "auto",
      padding: "20px 10px",
      fontFamily: "'Segoe UI', sans-serif"
    }}>
      <h2 style={{ textAlign: "center", marginBottom: "24px", fontSize: "24px" }}>
        📚 Available Quizzes
      </h2>

      <h3>🟢 Active</h3>
      {quizzes.active.length > 0 ? (
        [...quizzes.active].reverse().map(q => renderQuizCard(q, "active"))
      ) : (
        <p style={{ color: "#777" }}>No active quizzes.</p>
      )}

      <h3>🕓 Upcoming</h3>
      {quizzes.upcoming.length > 0 ? (
        [...quizzes.upcoming].reverse().map(q => renderQuizCard(q, "upcoming"))
      ) : (
        <p style={{ color: "#777" }}>No upcoming quizzes.</p>
      )}

      <h3>📜 Completed</h3>
      {quizzes.completed.length > 0 ? (
        [...quizzes.completed].reverse().map(q => renderQuizCard(q, "completed"))
      ) : (
        <p style={{ color: "#777" }}>No completed quizzes yet.</p>
      )}
    </div>
  );
}

import React, { useEffect, useState } from "react";
import axios from "axios";

export default function QuizList({ studentId, onSelectQuiz }) {
  const [quizzes, setQuizzes] = useState({
    active: [],
    upcoming: [],
    completed: []
  });

  useEffect(() => {
    axios.get(`http://localhost:8000/list/${studentId}`)
      .then(res => {
        setQuizzes(res.data);
      })
      .catch(err => {
        console.error("Failed to load quizzes", err);
      });
  }, [studentId]);

const renderQuizCard = (quiz, type) => (
  <div
    key={quiz.quiz_id}
    style={{
      border: "1px solid #ccc",
      borderRadius: "8px",
      padding: "12px",
      marginBottom: "10px",
      backgroundColor:
        type === "completed" ? "#f0f0f0" :
        type === "active" ? "#e7f7ed" :
        "#fff7e6"
    }}
  >
    <h4>{quiz.title}</h4>
    <p><strong>Start:</strong> {new Date(quiz.start_time).toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
        hour12: true,
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
    })}</p>

    <p><strong>Duration:</strong> {quiz.duration_minutes} mins</p>
    <p><strong>Marks:</strong> {quiz.total_marks}</p>

    {type === "completed" && (
      <>
        <p><strong>Your Score:</strong> {quiz.score}</p>
        {quiz.position && (
          <p><strong>Your Rank:</strong> {quiz.position}</p>
        )}
      </>
    )}

    {type === "active" && (
      <button onClick={() => onSelectQuiz(quiz.quiz_id)}>
        Start Quiz
      </button>
    )}
  </div>
);


  return (
    <div style={{ maxWidth: "600px", margin: "auto" }}>
      <h2>Available Quizzes</h2>

      <h3>🟢 Active</h3>
      {quizzes.active.length > 0 ? (
        quizzes.active.map(q => renderQuizCard(q, "active"))
      ) : (
        <p>No active quizzes.</p>
      )}

      <h3>🕓 Upcoming</h3>
      {quizzes.upcoming.length > 0 ? (
        quizzes.upcoming.map(q => renderQuizCard(q, "upcoming"))
      ) : (
        <p>No upcoming quizzes.</p>
      )}

      <h3>📜 Completed</h3>
      {quizzes.completed.length > 0 ? (
        quizzes.completed.map(q => renderQuizCard(q, "completed"))
      ) : (
        <p>No completed quizzes yet.</p>
      )}
    </div>
  );
}

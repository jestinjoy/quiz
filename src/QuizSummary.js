import React, { useEffect, useState } from "react";
import axios from "axios";

export default function QuizSummary({ quizId, studentId, onBack }) {
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    axios.get(`http://localhost:8000/quiz/${quizId}/summary/${studentId}`)
      .then(res => setSummary(res.data))
      .catch(err => console.error("Error loading quiz summary", err));
  }, [quizId, studentId]);

  if (!summary) return <p>Loading summary...</p>;

  return (
    <div style={{ maxWidth: "600px", margin: "auto" }}>
      <button onClick={onBack}>⬅ Back</button>
      <h2>{summary.quiz_title}</h2>
      <p><strong>Your Score:</strong> {summary.your_score}/{summary.total_marks}</p>
      <p><strong>Students Attended:</strong> {summary.students_attended}</p>
      <p><strong>Average Marks:</strong> {summary.average_marks}</p>
      <p><strong>Median Marks:</strong> {summary.median_marks}</p>

      <h3>Your Answers</h3>
      <ul>
        {summary.answers.map((item, idx) => (
          <li key={idx} style={{ marginBottom: "10px" }}>
            <p><strong>Q:</strong> {item.question}</p>
            <p><strong>Your Answer:</strong> {item.your_answer}</p>
            <p><strong>Correct Answer:</strong> {item.correct_answer}</p>
            <p style={{ color: item.is_correct ? "green" : "red" }}>
              {item.is_correct ? "✔ Correct" : "✘ Incorrect"}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}

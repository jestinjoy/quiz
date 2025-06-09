import React, { useEffect, useState, useCallback } from "react";
import { InlineMath } from "react-katex";
import "katex/dist/katex.min.css";
import axios from "axios";

const API_BASE = window.location.hostname === "localhost"
  ? "http://localhost:8000"
  : process.env.REACT_APP_SERVER_IP;



// Split text into plain, math, and code blocks
const preprocessSegments = (text) => {
  const regex = /<(math|code)>(.*?)<\/\1>/gs;
  let parts = [];
  let lastIndex = 0;
  const matches = [...text.matchAll(regex)];

  for (let match of matches) {
    const [fullMatch, tag, content] = match;
    const index = match.index;

    if (index > lastIndex) {
      parts.push({ type: "text", content: text.slice(lastIndex, index) });
    }

    parts.push({ type: tag, content });
    lastIndex = index + fullMatch.length;
  }

  if (lastIndex < text.length) {
    parts.push({ type: "text", content: text.slice(lastIndex) });
  }

  return parts;
};

// Render plain, math, and code blocks
const renderWithSegments = (text) => {
  const parts = preprocessSegments(text);
  return parts.map((part, index) => {
    if (part.type === "math") {
      return <InlineMath key={index}>{part.content}</InlineMath>;
    } else if (part.type === "code") {
      return (
        <pre
          key={index}
          style={{
            background: "#f4f4f4",
            padding: "8px",
            margin: "5px 0",
            borderRadius: "4px",
            whiteSpace: "pre-wrap",
            fontFamily: "monospace"
          }}
        >
          <code>{part.content}</code>
        </pre>
      );
    } else {
      return (
        <span key={index} style={{ whiteSpace: "pre-wrap" }}>
          {part.content}
        </span>
      );
    }
  });
};

export default function QuizAttempt({ quizId, studentId, onBack }) {
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [score, setScore] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);

  const handleSubmit = useCallback(async () => {
    if (submitted || submitting) return;

    setSubmitting(true);
    try {
      const res = await axios.post(`${API_BASE}/submit_quiz`,
 {
        quiz_id: quizId,
        student_id: studentId,
        answers: answers
      });
      setSubmitted(true);
      setScore(res.data.score);
    } catch (err) {
      alert(err.response?.data?.detail || "Submission failed");
    } finally {
      setSubmitting(false);
    }
  }, [submitted, submitting, quizId, studentId, answers]);

  useEffect(() => {
    axios
      .get(`${API_BASE}/quiz/${quizId}/questions/${studentId}`)
      .then((res) => {
        setQuiz(res.data);
        setTimeLeft(res.data.duration_minutes * 60);
      })
      .catch((err) => {
        console.error("Failed to load quiz", err);
      });
  }, [quizId, studentId]);


  useEffect(() => {
    if (!quiz || submitted) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [quiz, submitted, handleSubmit]);

  const formatTime = (secs) => {
    const m = String(Math.floor(secs / 60)).padStart(2, "0");
    const s = String(secs % 60).padStart(2, "0");
    return `${m}:${s}`;
  };

  const handleChange = (questionId, value) => {
    setAnswers({ ...answers, [questionId]: value });
  };

  if (!quiz) return <p>Loading quiz...</p>;

  return (
    <div
      style={{
        maxWidth: "700px",
        margin: "auto",
        padding: "20px",
        fontFamily: "sans-serif",
        backgroundColor: "#f9f9f9",
        borderRadius: "10px",
        boxShadow: "0 0 10px rgba(0,0,0,0.1)"
      }}
    >
      <h2 style={{ textAlign: "center" }}>{quiz.title}</h2>
      <p>
        <strong>Time Left:</strong> {formatTime(timeLeft)}
      </p>
      <p>
        <strong>Duration:</strong> {quiz.duration_minutes} minutes
      </p>
      <p>
        <strong>Total Marks:</strong> {quiz.total_marks}
      </p>

      {quiz.questions.map((q, index) => (
        <div
          key={q.question_id}
          style={{
            marginBottom: "25px",
            padding: "10px",
            backgroundColor: "#fff",
            borderRadius: "6px"
          }}
        >
          <p style={{ fontWeight: "bold" }}>
            Q{index + 1}: {renderWithSegments(q.question_text)}
          </p>

          {(q.question_type === "MCQ" || q.question_type === "TRUE_FALSE") &&
            q.options.map((opt, i) => (
              <label key={i} style={{ display: "block", margin: "5px 0" }}>
                <input
                  type="radio"
                  name={`q-${q.question_id}`}
                  value={opt.text}
                  onChange={() => handleChange(q.question_id, opt.text)}
                  checked={answers[q.question_id] === opt.text}
                />{" "}
                {renderWithSegments(opt.text)}
              </label>
            ))}

          {q.question_type === "MULTI_SELECT" &&
            q.options.map((opt, i) => (
              <label key={i} style={{ display: "block", margin: "5px 0" }}>
                <input
                  type="checkbox"
                  name={`q-${q.question_id}`}
                  value={opt.text}
                  onChange={(e) => {
                    const prev = answers[q.question_id]
                      ? JSON.parse(answers[q.question_id])
                      : [];
                    const newVal = e.target.checked
                      ? [...prev, opt.text]
                      : prev.filter((v) => v !== opt.text);
                    handleChange(q.question_id, JSON.stringify(newVal));
                  }}
                  checked={
                    answers[q.question_id] &&
                    JSON.parse(answers[q.question_id]).includes(opt.text)
                  }
                />{" "}
                {renderWithSegments(opt.text)}
              </label>
            ))}
        </div>
      ))}

      {!submitted ? (
        <button
          onClick={handleSubmit}
          disabled={submitting}
          style={{
            padding: "10px 20px",
            fontSize: "16px",
            backgroundColor: submitting ? "#ccc" : "#28a745",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: submitting ? "not-allowed" : "pointer"
          }}
        >
          {submitting ? "Submitting..." : "Submit Quiz"}
        </button>
      ) : (
        <>
          <h3>Your Score: {score}</h3>
          <button
            onClick={onBack}
            style={{
              marginTop: "10px",
              padding: "8px 16px",
              fontSize: "14px",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer"
            }}
          >
            ⬅ Back to Home
          </button>
        </>
      )}
    </div>
  );
}

import React, { useEffect, useState } from "react";
import axios from "axios";

export default function QuizAttempt({ quizId, studentId, onBack }) {

  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false); // ✅ new
  const [score, setScore] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    axios.get(`http://localhost:8000/quiz/${quizId}/questions`)
      .then(res => {
        setQuiz(res.data);
        setTimeLeft(res.data.duration_minutes * 60);
      })
      .catch(err => {
        console.error("Failed to load quiz", err);
      });
  }, [quizId]);

  useEffect(() => {
    if (!quiz || submitted) return;

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          handleSubmit(); // ✅ auto-submit
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [quiz, submitted]);

  const formatTime = (secs) => {
    const m = String(Math.floor(secs / 60)).padStart(2, '0');
    const s = String(secs % 60).padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleChange = (questionId, value) => {
    setAnswers({ ...answers, [questionId]: value });
  };

  const handleSubmit = async () => {
    if (submitted || submitting) return; // ✅ prevent double submission

    setSubmitting(true); // ✅ lock the form

    try {
      const res = await axios.post("http://localhost:8000/submit_quiz", {
        quiz_id: quizId,
        student_id: studentId,
        answers: answers
      });

      setSubmitted(true);
      setScore(res.data.score);
    } catch (err) {
      alert(err.response?.data?.detail || "Submission failed");
    } finally {
      setSubmitting(false); // ✅ release the lock
    }
  };

  if (!quiz) return <p>Loading quiz...</p>;

  return (
    <div style={{ maxWidth: "600px", margin: "auto" }}>
      <h2>{quiz.title}</h2>
      <p><strong>Time Left:</strong> {formatTime(timeLeft)}</p>
      <p><strong>Duration:</strong> {quiz.duration_minutes} minutes</p>
      <p><strong>Total Marks:</strong> {quiz.total_marks}</p>

      {quiz.questions.map((q, index) => (
        <div key={q.question_id} style={{ marginBottom: "20px" }}>
          <p><strong>Q{index + 1}:</strong> {q.question_text}</p>

          {(q.question_type === "MCQ" || q.question_type === "TRUE_FALSE") &&
            q.options.map((opt, i) => (
              <label key={i}>
                <input
                  type="radio"
                  name={`q-${q.question_id}`}
                  value={opt.text}
                  onChange={() => handleChange(q.question_id, opt.text)}
                  checked={answers[q.question_id] === opt.text}
                />
                {opt.text}
                <br />
              </label>
            ))
          }

          {q.question_type === "MULTI_SELECT" &&
            q.options.map((opt, i) => (
              <label key={i}>
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
                      : prev.filter(v => v !== opt.text);
                    handleChange(q.question_id, JSON.stringify(newVal));
                  }}
                  checked={
                    answers[q.question_id] &&
                    JSON.parse(answers[q.question_id]).includes(opt.text)
                  }
                />
                {opt.text}
                <br />
              </label>
            ))
          }
        </div>
      ))}

{!submitted ? (
  <button onClick={handleSubmit} disabled={submitting}>
    {submitting ? "Submitting..." : "Submit Quiz"}
  </button>
) : (
  <>
    <h3>Your Score: {score}</h3>
    <button onClick={onBack}>⬅ Back to Home</button>
  </>
)}

    </div>
  );
}

import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { InlineMath } from "react-katex";
import "katex/dist/katex.min.css";

// Utility to split mixed text and math blocks
const splitTextWithMath = (text) => {
  const regex = /<math>(.*?)<\/math>/gs;
  let parts = [];
  let lastIndex = 0;
  const matches = [...text.matchAll(regex)];

  for (let match of matches) {
    const [fullMatch, latexContent] = match;
    const index = match.index;

    if (index > lastIndex) {
      parts.push({ type: "text", content: text.slice(lastIndex, index) });
    }

    parts.push({ type: "math", content: latexContent });
    lastIndex = index + fullMatch.length;
  }

  if (lastIndex < text.length) {
    parts.push({ type: "text", content: text.slice(lastIndex) });
  }

  return parts;
};

// Render mixed content with LaTeX
const renderWithMath = (text) => {
  const parts = splitTextWithMath(text);
  return parts.map((part, idx) =>
    part.type === "math" ? (
      <InlineMath key={idx}>{part.content}</InlineMath>
    ) : (
      <span key={idx} style={{ whiteSpace: "pre-wrap" }}>{part.content}</span>
    )
  );
};

export default function QuizSummary({ quizId, studentId, onBack }) {
  const [summary, setSummary] = useState(null);
  const summaryRef = useRef();

  useEffect(() => {
    axios.get(`http://localhost:8000/quiz/${quizId}/summary/${studentId}`)
      .then(res => setSummary(res.data))
      .catch(err => console.error("Error loading quiz summary", err));
  }, [quizId, studentId]);

  const downloadPDF = async () => {
    const input = summaryRef.current;
    const canvas = await html2canvas(input, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`${summary.quiz_title.replace(/\s+/g, "_")}_summary.pdf`);
  };

  if (!summary) return <p>Loading summary...</p>;

  return (
    <div style={{ maxWidth: "800px", margin: "40px auto", padding: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
        <button onClick={onBack} style={{ padding: "8px 16px" }}>⬅ Back</button>
        <button onClick={downloadPDF} style={{ padding: "8px 16px", backgroundColor: "#007bff", color: "white", border: "none", borderRadius: "5px" }}>📄 Download PDF</button>
      </div>

      <div ref={summaryRef} style={{ padding: "30px", backgroundColor: "#ffffff", borderRadius: "10px", boxShadow: "0 0 10px rgba(0,0,0,0.1)" }}>
        <h2 style={{ marginBottom: "10px" }}>{summary.quiz_title}</h2>
        <p><strong>Your Score:</strong> {summary.your_score}/{summary.total_marks}</p>
        <p><strong>Students Attended:</strong> {summary.students_attended}</p>
        <p><strong>Average Marks:</strong> {summary.average_marks}</p>
        <p><strong>Median Marks:</strong> {summary.median_marks}</p>

        <h3 style={{ marginTop: "30px" }}>Your Answers</h3>
        <ul style={{ listStyleType: "none", padding: 0 }}>
          {summary.answers.map((item, idx) => (
            <li
              key={idx}
              style={{
                marginBottom: "20px",
                padding: "15px",
                backgroundColor: item.is_correct ? "#e6f9f0" : "#ffe6e6",
                borderRadius: "8px",
                border: "1px solid #ccc"
              }}
            >
              <p><strong>Q{idx + 1}:</strong> {renderWithMath(item.question)}</p>
              <p><strong>Your Answer:</strong> {renderWithMath(item.your_answer)}</p>
              <p><strong>Correct Answer:</strong> {renderWithMath(item.correct_answer)}</p>
              <p style={{ fontWeight: "bold", color: item.is_correct ? "green" : "red" }}>
                {item.is_correct ? "✔ Correct" : "✘ Incorrect"}
              </p>
              {item.feedback && (
                <p style={{ fontStyle: "italic", color: "#555" }}>
                  <strong>Feedback:</strong> {item.feedback}
                </p>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

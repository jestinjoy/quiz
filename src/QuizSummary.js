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

// Renders mixed text and LaTeX using <math> blocks
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
    <div style={{ maxWidth: "700px", margin: "auto" }}>
      <button onClick={onBack}>⬅ Back</button>
      <button onClick={downloadPDF} style={{ float: "right" }}>📄 Download PDF</button>

      <div ref={summaryRef} style={{ padding: "20px", backgroundColor: "#fff", marginTop: "20px" }}>
        <h2>{summary.quiz_title}</h2>
        <p><strong>Your Score:</strong> {summary.your_score}/{summary.total_marks}</p>
        <p><strong>Students Attended:</strong> {summary.students_attended}</p>
        <p><strong>Average Marks:</strong> {summary.average_marks}</p>
        <p><strong>Median Marks:</strong> {summary.median_marks}</p>

        <h3>Your Answers</h3>
        <ul>
          {summary.answers.map((item, idx) => (
            <li key={idx} style={{ marginBottom: "20px" }}>
              <p><strong>Q:</strong> {renderWithMath(item.question)}</p>
              <p><strong>Your Answer:</strong> {renderWithMath(item.your_answer)}</p>
              <p><strong>Correct Answer:</strong> {renderWithMath(item.correct_answer)}</p>
              <p style={{ color: item.is_correct ? "green" : "red" }}>
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

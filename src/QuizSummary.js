import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { InlineMath } from "react-katex";
import "katex/dist/katex.min.css";

// Split plain text, math, and code blocks
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

// Render mixed segments
const renderWithSegments = (text) => {
  const parts = preprocessSegments(text);
  return parts.map((part, idx) => {
    if (part.type === "math") {
      return <InlineMath key={idx}>{part.content}</InlineMath>;
    } else if (part.type === "code") {
      return (
        <pre
          key={idx}
          style={{
            background: "#f4f4f4",
            padding: "8px",
            borderRadius: "4px",
            fontFamily: "monospace",
            whiteSpace: "pre-wrap"
          }}
        >
          <code>{part.content}</code>
        </pre>
      );
    } else {
      return (
        <span key={idx} style={{ whiteSpace: "pre-wrap" }}>
          {part.content}
        </span>
      );
    }
  });
};

export default function QuizSummary({ quizId, studentId, onBack }) {
  const [summary, setSummary] = useState(null);
  const summaryRef = useRef();

  useEffect(() => {
    axios
      .get(`http://localhost:8000/quiz/${quizId}/summary/${studentId}`)
      .then((res) => setSummary(res.data))
      .catch((err) => console.error("Error loading quiz summary", err));
  }, [quizId, studentId]);

const downloadPDF = async () => {
  const input = summaryRef.current;
  const canvas = await html2canvas(input, { scale: 2 });
  const imgData = canvas.toDataURL("image/png");

  const pdf = new jsPDF("p", "mm", "a4");
  const pageHeight = pdf.internal.pageSize.getHeight();
  const pageWidth = pdf.internal.pageSize.getWidth();

  const imgProps = pdf.getImageProperties(imgData);
  const imgHeight = (imgProps.height * pageWidth) / imgProps.width;

  let position = 0;

  while (position < imgHeight) {
    pdf.addImage(imgData, "PNG", 0, -position, pageWidth, imgHeight);
    position += pageHeight;
    if (position < imgHeight) pdf.addPage();
  }

  pdf.save(`${summary.quiz_title.replace(/\s+/g, "_")}_summary.pdf`);
};


  if (!summary) return <p>Loading summary...</p>;

  return (
    <div style={{ maxWidth: "800px", margin: "auto", padding: "20px" }}>
      <button onClick={onBack}>⬅ Back</button>
      <button onClick={downloadPDF} style={{ float: "right" }}>
        📄 Download PDF
      </button>

      <div
        ref={summaryRef}
        style={{
          backgroundColor: "#fff",
          padding: "20px",
          borderRadius: "10px",
          marginTop: "20px",
          boxShadow: "0 0 10px rgba(0,0,0,0.1)"
        }}
      >
        <h2 style={{ textAlign: "center" }}>{summary.quiz_title}</h2>
        <p>
          <strong>Your Score:</strong> {summary.your_score} / {summary.total_marks}
        </p>
        <p>
          <strong>Students Attended:</strong> {summary.students_attended}
        </p>
        <p>
          <strong>Average Marks:</strong> {summary.average_marks}
        </p>
        <p>
          <strong>Median Marks:</strong> {summary.median_marks}
        </p>

        <h3 style={{ marginTop: "30px" }}>Your Answers</h3>
        <ul style={{ listStyle: "none", padding: 0 }}>
          {summary.answers.map((item, idx) => (
            <li
              key={idx}
              style={{
                backgroundColor: "#f8f9fa",
                padding: "16px",
                marginBottom: "16px",
                borderRadius: "8px",
                borderLeft: item.is_correct ? "6px solid green" : "6px solid red"
              }}
            >
              <p>
                <strong>Q{idx + 1}:</strong> {renderWithSegments(item.question)}
              </p>
              <p>
                <strong>Your Answer:</strong> {renderWithSegments(item.your_answer)}
              </p>
              <p>
                <strong>Correct Answer:</strong> {renderWithSegments(item.correct_answer)}
              </p>
              <p
                style={{
                  fontWeight: "bold",
                  color: item.is_correct ? "green" : "red"
                }}
              >
                {item.is_correct ? "✔ Correct" : "✘ Incorrect"}
              </p>
              {item.feedback && (
                <p style={{ fontStyle: "italic", color: "#555" }}>
                  <strong>Feedback:</strong> {renderWithSegments(item.feedback)}
                </p>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

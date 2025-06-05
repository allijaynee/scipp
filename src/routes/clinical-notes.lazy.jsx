import { useState, useEffect } from "react";
import { useForm } from "../FormContext.jsx";
import "../App.css";
import { createLazyFileRoute } from '@tanstack/react-router';

export const Route = createLazyFileRoute('/clinical-notes')({
  component: ClinicalNotes,
});

function ClinicalNotes() {
  const { formData } = useForm();
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let ignore = false;
    const generateNote = async () => {
      setLoading(true);
      setError("");
      setNote("");
      setCopied(false);
      try {
        const response = await fetch("https://scipp.onrender.com/api/generate-note", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: [
              { role: "system", content: "You are a helpful clinical documentation assistant." },
              { role: "user", content: `
You are a clinical documentation assistant. Write a clear, professional clinical note that summarizes all the provided patient data in full sentences and paragraphs. Do not use SOAP or any specific template—just present all the information in a logical, readable way.

Patient Data:
${JSON.stringify(formData, null, 2)}

Clinical Note:
              `}
            ],
            max_tokens: 400,
            temperature: 0.3
          })
        });
        if (!response.ok) throw new Error("Failed to generate note");
        const data = await response.json();
        if (!ignore) setNote(data.choices[0].message.content.trim());
      } catch {
        if (!ignore) setError("Error generating note. Please try again.");
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    generateNote();
    return () => { ignore = true; };
  }, [formData]);

  const handleCopy = () => {
    if (note) {
      navigator.clipboard.writeText(note);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="card-container">
      <div className="card">
        <header className="card-header">
          <h1>SCiPP Chest Pain Pathway</h1>
        </header>
        <div className="card-section">
          {loading && <div style={{ color: "#7B2CBF", marginBottom: 16 }}>Generating clinical note…</div>}
          {error && <div style={{ color: "#d32f2f", marginBottom: 16 }}>{error}</div>}
          {note && !loading && !error && (
            <>
              <textarea
                value={note}
                onChange={e => setNote(e.target.value)}
                style={{
                  background: "#f8f4ff",
                  borderRadius: 12,
                  padding: 24,
                  fontFamily: "monospace, monospace",
                  color: "#222",
                  boxShadow: "0 2px 8px #7B2CBF11",
                  marginTop: 12,
                  width: '100%',
                  minHeight: 220,
                  fontSize: '1.08rem',
                  border: '1.5px solid #e0d4ff',
                  resize: 'vertical',
                  outline: 'none',
                  whiteSpace: 'pre-wrap',
                }}
              />
              <button
                className="card-button card-hover"
                style={{ marginTop: 16, background: copied ? '#7B2CBF' : undefined, color: copied ? '#fff' : undefined, maxWidth: 200 }}
                onClick={handleCopy}
              >
                {copied ? "Copied!" : "Copy to Clipboard"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
} 
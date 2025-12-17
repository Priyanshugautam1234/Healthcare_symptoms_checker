import { useState, useEffect, useRef } from 'react';
import React from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { jsPDF } from 'jspdf';
import './index.css';

function App() {
  const [symptoms, setSymptoms] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const resultRef = React.useRef(null);

  useEffect(() => {
    if (result && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [result]);

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert("Voice input is not supported in this browser. Try Chrome/Edge.");
      return;
    }

    const recognition = new window.webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.lang = 'en-US';
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setSymptoms((prev) => prev ? prev + ' ' + transcript : transcript);
    };

    recognition.start();
  };

  const generatePDF = () => {
    if (!result) return;

    // Helper to strip emojis and special chars that jsPDF standard fonts can't handle
    const cleanText = (text) => {
      return text.replace(/[^\x20-\x7E\n]/g, '');
    };

    const doc = new jsPDF();

    // Header
    doc.setFontSize(22);
    doc.setTextColor(13, 148, 136); // Teal color
    doc.text("MediCheck AI Report", 20, 20);

    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 30);
    // Sanitize symptoms
    doc.text(`Symptoms: ${cleanText(symptoms)}`, 20, 40);

    let yPos = 60;

    // Conditions
    doc.setFontSize(16);
    doc.setTextColor(30);
    doc.text("Possible Conditions", 20, yPos);
    yPos += 10;

    result.conditions.forEach((c) => {
      doc.setFontSize(12);
      doc.setTextColor(0);
      doc.setFont("helvetica", "bold");
      doc.text(`- ${cleanText(c.name)}`, 20, yPos);
      yPos += 7;

      doc.setFont("helvetica", "normal");
      doc.setTextColor(80);
      const splitExp = doc.splitTextToSize(cleanText(c.explanation), 170);
      doc.text(splitExp, 25, yPos);
      yPos += (splitExp.length * 5) + 5;
    });

    yPos += 10;

    // Recommendations
    doc.setFontSize(16);
    doc.setTextColor(30);
    doc.text("Recommendations", 20, yPos);
    yPos += 10;

    result.recommendations.forEach((r) => {
      doc.setFontSize(12);
      doc.setTextColor(0);
      doc.setFont("helvetica", "bold");
      doc.text(`- ${cleanText(r.action)}`, 20, yPos);
      yPos += 7;

      doc.setFont("helvetica", "normal");
      doc.setTextColor(80);
      const splitReason = doc.splitTextToSize(cleanText(r.reason), 170);
      doc.text(splitReason, 25, yPos);
      yPos += (splitReason.length * 5) + 5;
    });

    // Disclaimer
    yPos += 20;
    doc.setFontSize(10);
    doc.setTextColor(150);
    doc.text("Disclaimer: " + cleanText(result.disclaimer), 20, yPos, { maxWidth: 170 });

    // Force download with explicit filename using Blob
    const pdfBlob = doc.output('blob');
    const url = URL.createObjectURL(pdfBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = "MediCheck_Report.pdf";
    document.body.appendChild(link);
    link.click();

    // Cleanup
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!symptoms.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await axios.post('/api/analyze', { symptoms });
      setResult(response.data);
    } catch (err) {
      setError('Failed to analyze symptoms. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <header style={{ marginBottom: '3rem', textAlign: 'center' }}>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L12 22" stroke="url(#paint0_linear)" strokeWidth="4" strokeLinecap="round" />
              <path d="M2 12L22 12" stroke="url(#paint0_linear)" strokeWidth="4" strokeLinecap="round" />
              <defs>
                <linearGradient id="paint0_linear" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
                  <stop stopColor="var(--primary)" />
                  <stop offset="1" stopColor="var(--secondary)" />
                </linearGradient>
              </defs>
            </svg>
            <h1 style={{ fontSize: '2.5rem', background: 'linear-gradient(to right, var(--primary), var(--secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 }}>
              MediCheck AI
            </h1>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
            Advanced Symptom Analysis Assistant
          </p>
        </motion.div>
      </header>

      <main>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card"
          style={{ marginBottom: '2rem' }}
        >
          <form onSubmit={handleSubmit}>
            <label style={{ display: 'block', marginBottom: '1rem', fontWeight: 500 }}>
              Describe your symptoms
            </label>
            <div style={{ position: 'relative' }}>
              <textarea
                className="input-field"
                rows="4"
                placeholder="e.g., I have a throbbing headache and sensitivity to light..."
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                style={{ marginBottom: '1.5rem', resize: 'vertical', width: '100%', paddingRight: '3rem' }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
              />
              <button
                type="button"
                onClick={startListening}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '10px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '5px',
                  color: isListening ? '#ef4444' : 'var(--text-secondary)'
                }}
                title="Use Voice Input"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                  <line x1="12" y1="19" x2="12" y2="23"></line>
                  <line x1="8" y1="23" x2="16" y2="23"></line>
                </svg>
                {isListening && <span style={{ position: 'absolute', top: -5, right: -5, width: 8, height: 8, background: '#ef4444', borderRadius: '50%' }}></span>}
              </button>
            </div>

            <button
              type="submit"
              className="btn-primary"
              style={{ width: '100%' }}
              disabled={loading}
            >
              {loading ? 'Analyzing...' : 'Analyze Symptoms'}
            </button>
          </form>
        </motion.div>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              style={{ padding: '1rem', background: '#fee2e2', color: '#991b1b', borderRadius: 'var(--radius)', marginBottom: '2rem' }}
            >
              {error}
            </motion.div>
          )}

          {result && (
            <motion.div
              ref={resultRef}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="card"
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2 style={{ margin: 0 }}>Analysis Result</h2>
                <button
                  onClick={generatePDF}
                  style={{
                    padding: '0.5rem 1rem',
                    background: 'var(--secondary)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '0.9rem'
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                  </svg>
                  Download Report
                </button>
              </div>

              {result.emergency_alert && (
                <div style={{ background: '#fef2f2', border: '1px solid var(--accent)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span style={{ fontSize: '1.5rem' }}>⚠️</span>
                  <div>
                    <strong style={{ color: 'var(--accent)' }}>Potential Emergency</strong>
                    <p style={{ fontSize: '0.9rem', color: '#991b1b' }}>Please seek immediate medical attention.</p>
                  </div>
                </div>
              )}

              <h2 style={{ marginBottom: '1rem' }}>Possible Conditions</h2>
              <div style={{ display: 'grid', gap: '1rem', marginBottom: '2rem' }}>
                {result.conditions.map((item, idx) => (
                  <div key={idx} style={{ padding: '1rem', background: '#f1f5f9', borderRadius: '8px' }}>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '0.4rem', color: 'var(--primary-dark)' }}>{item.name}</h3>
                    <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}>{item.explanation}</p>
                  </div>
                ))}
              </div>

              <h2 style={{ marginBottom: '1rem' }}>Recommendations</h2>
              <div style={{ display: 'grid', gap: '1rem', marginBottom: '2rem' }}>
                {result.recommendations.map((item, idx) => (
                  <div key={idx} style={{ padding: '1rem', borderLeft: '4px solid var(--secondary)', background: '#f0fdfa' }}>
                    <strong style={{ display: 'block', marginBottom: '0.4rem', color: '#0d9488' }}>{item.action}</strong>
                    <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}>{item.reason}</p>
                  </div>
                ))}
              </div>

              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                <strong>Disclaimer:</strong> {result.disclaimer}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer style={{ marginTop: '4rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
        <p>© 2025 MediCheck AI. Educational Purpose Only.</p>
      </footer>
    </div>
  );
}

export default App;

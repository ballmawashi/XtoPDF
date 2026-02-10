"use client";

import { useState } from 'react';

export default function Home() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!url) return;
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate PDF');
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `x-article-${Date.now()}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <main className="main">
        <h1 className="title">X to PDF Converter</h1>
        <p className="description">
          Enter an X (Twitter) article URL to download it as a PDF.
        </p>

        <div className="input-group">
          <input
            type="url"
            className="input"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://x.com/username/status/..."
            disabled={loading}
          />
        </div>

        {error && <p className="error">{error}</p>}

        <button
          className="button"
          onClick={handleGenerate}
          disabled={loading || !url}
        >
          {loading ? (
            <span className="loader">Generating...</span>
          ) : (
            'Download PDF'
          )}
        </button>
      </main>

      <footer className="footer">
        <p>Built with Next.js & Puppeteer</p>
      </footer>
    </div>
  );
}

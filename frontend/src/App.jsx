import { useEffect, useMemo, useState } from "react";

// const API_BASE_URL = "http://127.0.0.1:8000";
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

const LOADING_STEPS = [
  "Reading resume...",
  "Analyzing job requirements...",
  "Comparing experience...",
  "Preparing recommendations...",
];

function App() {
  const [resumeState, setResumeState] = useState({
    loading: true,
    loaded: false,
    filename: "Rahul_Kumar_Resume.pdf",
    error: "",
  });

  const [jobDescription, setJobDescription] = useState("");
  const [jobUrl, setJobUrl] = useState("");
  const [status, setStatus] = useState("ready");
  const [loadingStep, setLoadingStep] = useState(0);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState("");

  const isAnalyzing = status === "analyzing";

  const statusText = useMemo(() => {
    if (status === "analyzing") {
      return "Analyzing...";
    }

    if (status === "error") {
      return "Error";
    }

    return "Agent Ready";
  }, [status]);

  useEffect(() => {
    let active = true;

    async function fetchHealth() {
      try {
        const response = await fetch(`${API_BASE_URL}/api/health`);
        const data = await response.json();

        if (!active) {
          return;
        }

        setResumeState({
          loading: false,
          loaded: Boolean(data.resume_loaded),
          filename: data.resume_filename || "Rahul_Kumar_Resume.pdf",
          error: data.resume_error || "",
        });
      } catch {
        if (!active) {
          return;
        }

        setResumeState({
          loading: false,
          loaded: false,
          filename: "Rahul_Kumar_Resume.pdf",
          error: "The backend is not reachable. Start FastAPI first.",
        });
      }
    }

    fetchHealth();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!isAnalyzing) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setLoadingStep((current) => (current + 1) % LOADING_STEPS.length);
    }, 1300);

    return () => window.clearInterval(timer);
  }, [isAnalyzing]);

  function validateUrl(value) {
    if (!value.trim()) {
      return true;
    }

    try {
      const parsed = new URL(value.trim());
      return parsed.protocol === "http:" || parsed.protocol === "https:";
    } catch {
      return false;
    }
  }

  async function handleAnalyze(event) {
    event.preventDefault();

    if (isAnalyzing) {
      return;
    }

    setError("");
    setAnalysis(null);

    if (!resumeState.loaded) {
      setStatus("error");
      setError(
        resumeState.error ||
          "The resume is unavailable. Add the PDF before analyzing a job."
      );
      return;
    }

    if (!jobDescription.trim()) {
      setStatus("error");
      setError("Please paste a job description before starting the analysis.");
      return;
    }

    if (jobDescription.trim().length < 20) {
      setStatus("error");
      setError(
        "The job description is too short. Please provide more information."
      );
      return;
    }

    if (!validateUrl(jobUrl)) {
      setStatus("error");
      setError("Please enter a valid URL beginning with http:// or https://.");
      return;
    }

    if (jobUrl.trim()) {
      setStatus("error");
      setError(
        "URL analysis is disabled in this MVP. Paste the job description directly instead."
      );
      return;
    }

    setStatus("analyzing");
    setLoadingStep(0);

    try {
      const response = await fetch(`${API_BASE_URL}/api/analyze`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          job_description: jobDescription.trim(),
          job_url: null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "The analysis could not be completed."
        );
      }

      setAnalysis(data);
      setStatus("ready");

      window.setTimeout(() => {
        document
          .getElementById("analysis-results")
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    } catch (requestError) {
      setStatus("error");
      setError(
        requestError.message ||
          "A network error occurred. Confirm that the backend is running."
      );
    }
  }

  function handleReset() {
    setAnalysis(null);
    setError("");
    setStatus("ready");
    setJobDescription("");
    setJobUrl("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="app-shell">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />

      <header className="topbar">
        <a className="brand" href="/" aria-label="JobPilot home">
          <span className="brand-mark">J</span>

          <span className="brand-copy">
            <strong>JobPilot</strong>
            <span>Personal Job Search Assistant</span>
          </span>
        </a>

        <div
          className={`agent-status ${
            status === "error" ? "agent-status-error" : ""
          }`}
          aria-live="polite"
        >
          <span className="status-dot" />
          <span>{statusText}</span>
        </div>
      </header>

      <main>
        <section className="hero-section">
          <div className="hero-badge">
            <span className="badge-dot" />
            Resume-grounded career intelligence
          </div>

          <h1>
            Analyze a job.
            <br />
            <span>Prepare with clarity.</span>
          </h1>

          <p className="hero-description">
            Compare a job description with your resume and understand where you
            match, where you have gaps, and how to prepare.
          </p>
        </section>

        <section className="workspace-card">
          <div className="workspace-header">
            <div>
              <p className="section-kicker">ANALYSIS WORKSPACE</p>
              <h2>Start with the opportunity</h2>
            </div>

            <span className="private-label">
              <span className="lock-icon">⌑</span>
              Private by design
            </span>
          </div>

          <form onSubmit={handleAnalyze}>
            <div className="input-grid">
              <article className="input-card resume-card">
                <div className="card-heading">
                  <div className="heading-icon resume-icon">◫</div>

                  <div>
                    <p className="section-kicker">YOUR RESUME</p>
                    <h3>Source document</h3>
                  </div>
                </div>

                <div
                  className={`resume-file ${
                    resumeState.loaded ? "resume-loaded" : "resume-failed"
                  }`}
                >
                  <div className="file-icon">PDF</div>

                  <div className="file-details">
                    <strong>{resumeState.filename}</strong>
                    <span>
                      {resumeState.loading
                        ? "Checking resume..."
                        : resumeState.loaded
                        ? "Resume loaded and ready"
                        : "Resume unavailable"}
                    </span>
                  </div>

                  <span className="file-status">
                    {resumeState.loaded ? "✓" : "!"}
                  </span>
                </div>

                {resumeState.error ? (
                  <p className="inline-error">{resumeState.error}</p>
                ) : (
                  <p className="helper-text">
                    Your resume is read from the local project file. It is not
                    edited or uploaded by JobPilot.
                  </p>
                )}
              </article>

              <article className="input-card job-card">
                <div className="card-heading">
                  <div className="heading-icon job-icon">✦</div>

                  <div>
                    <p className="section-kicker">JOB DESCRIPTION</p>
                    <h3>Role requirements</h3>
                  </div>
                </div>

                <label className="field-label" htmlFor="job-description">
                  Paste the complete job description
                </label>

                <textarea
                  id="job-description"
                  value={jobDescription}
                  onChange={(event) => {
                    setJobDescription(event.target.value);
                    setError("");
                  }}
                  placeholder="Paste the job description here..."
                  rows="9"
                  disabled={isAnalyzing}
                />

                <label className="field-label" htmlFor="job-url">
                  Job posting URL <span>(optional)</span>
                </label>

                <input
                  id="job-url"
                  type="url"
                  value={jobUrl}
                  onChange={(event) => {
                    setJobUrl(event.target.value);
                    setError("");
                  }}
                  placeholder="https://..."
                  disabled={isAnalyzing}
                />

                <button
                  className="primary-button"
                  type="submit"
                  disabled={isAnalyzing || !resumeState.loaded}
                >
                  <span>{isAnalyzing ? "Analyzing..." : "Analyze Job"}</span>
                  <span className="button-arrow">→</span>
                </button>
              </article>
            </div>

            {isAnalyzing ? (
              <div className="loading-panel" aria-live="polite">
                <div className="loading-spinner" />

                <div>
                  <strong>{LOADING_STEPS[loadingStep]}</strong>
                  <p>
                    JobPilot is comparing explicit evidence from both inputs.
                  </p>
                </div>

                <div className="loading-bars" aria-hidden="true">
                  <span />
                  <span />
                  <span />
                </div>
              </div>
            ) : null}

            {error ? (
              <div className="error-panel" role="alert">
                <div className="error-symbol">!</div>

                <div>
                  <strong>Analysis could not start</strong>
                  <p>{error}</p>
                </div>
              </div>
            ) : null}
          </form>
        </section>

        {analysis ? (
          <Results analysis={analysis} onReset={handleReset} />
        ) : (
          <section className="empty-state">
            <div className="empty-orbit">
              <span>✦</span>
            </div>

            <h2>Your analysis will appear here</h2>

            <p>
              Add a job description above to generate a grounded opportunity
              analysis.
            </p>

            <div className="empty-features">
              <span>Match signals</span>
              <span>Skill gaps</span>
              <span>Preparation advice</span>
            </div>
          </section>
        )}
      </main>

      <footer className="footer">
        <span>JobPilot</span>
        <span>Research and analysis assistant</span>
        <span>Never applies automatically</span>
      </footer>
    </div>
  );
}

function Results({ analysis, onReset }) {
  return (
    <section className="results-section" id="analysis-results">
      <div className="results-header">
        <div>
          <p className="section-kicker">ANALYSIS COMPLETE</p>
          <h2>Your opportunity analysis</h2>
          <p>
            This result is an estimate based only on the supplied resume and
            job description.
          </p>
        </div>

        <button className="secondary-button" type="button" onClick={onReset}>
          Analyze another role
        </button>
      </div>

      <div className="score-card">
        <div className="score-content">
          <div
            className="score-ring"
            style={{ "--score": analysis.match_score }}
          >
            <div className="score-ring-inner">
              <strong>{analysis.match_score}</strong>
              <span>/ 100</span>
            </div>
          </div>

          <div className="score-copy">
            <p className="section-kicker">ESTIMATED MATCH SCORE</p>
            <h3>Evidence-based fit estimate</h3>
            <p>
              This is a heuristic signal, not a scientifically exact score or
              hiring decision.
            </p>
          </div>
        </div>

        <div
          className={`confidence-pill ${getConfidenceClass(
            analysis.confidence
          )}`}
        >
          <span className="confidence-dot" />
          {analysis.confidence} confidence
        </div>
      </div>

      <div className="result-layout">
        <ResultCard
          className="summary-card"
          icon="◈"
          kicker="MATCH SUMMARY"
          title="Overall fit"
        >
          <p className="summary-text">{analysis.match_summary}</p>
        </ResultCard>

        <ResultCard icon="✓" kicker="CONFIDENCE" title="How much to trust this">
          <p className="result-paragraph">
            {getConfidenceExplanation(analysis.confidence)}
          </p>
        </ResultCard>

        <ResultCard
          className="wide-card"
          icon="✦"
          kicker="MATCHING SKILLS"
          title="Signals supported by your resume"
        >
          <TagList items={analysis.matching_skills} variant="matching" />
        </ResultCard>

        <ResultCard
          className="wide-card"
          icon="△"
          kicker="SKILL GAPS"
          title="Requirements needing attention"
        >
          <TagList items={analysis.skill_gaps} variant="gap" />
        </ResultCard>

        <ResultCard
          className="wide-card"
          icon="↗️"
          kicker="EXPERIENCE MATCH"
          title="Where your background aligns"
        >
          <BulletList items={analysis.experience_match} />
        </ResultCard>

        <ResultCard
          className="wide-card"
          icon="◎"
          kicker="PREPARATION SUGGESTIONS"
          title="What to do next"
        >
          <BulletList items={analysis.preparation_suggestions} />
        </ResultCard>
      </div>

      <div className="draft-notice">
        <div className="draft-icon">✎</div>

        <div>
          <strong>DRAFT MATERIALS ARE REVIEW-ONLY</strong>
          <p>
            JobPilot does not automatically create, send, submit, or insert
            applications, emails, cover letters, or resume content.
          </p>
        </div>
      </div>
    </section>
  );
}

function ResultCard({ className = "", icon, kicker, title, children }) {
  return (
    <article className={`result-card ${className}`}>
      <div className="result-card-header">
        <div className="result-icon">{icon}</div>

        <div>
          <p className="section-kicker">{kicker}</p>
          <h3>{title}</h3>
        </div>
      </div>

      {children}
    </article>
  );
}

function TagList({ items, variant }) {
  if (!items || items.length === 0) {
    return (
      <div className="no-items">
        No explicit items were identified from the supplied information.
      </div>
    );
  }

  return (
    <div className="tag-list">
      {items.map((item, index) => (
        <span className={`result-tag ${variant}`} key={`${item}-${index}`}>
          {item}
        </span>
      ))}
    </div>
  );
}

function BulletList({ items }) {
  if (!items || items.length === 0) {
    return (
      <div className="no-items">
        No additional points were identified from the supplied information.
      </div>
    );
  }

  return (
    <ul className="bullet-list">
      {items.map((item, index) => (
        <li key={`${item}-${index}`}>{item}</li>
      ))}
    </ul>
  );
}

function getConfidenceClass(confidence) {
  const normalized = String(confidence || "").toLowerCase();

  if (normalized.includes("high")) {
    return "confidence-high";
  }

  if (normalized.includes("low")) {
    return "confidence-low";
  }

  return "confidence-medium";
}

function getConfidenceExplanation(confidence) {
  const normalized = String(confidence || "").toLowerCase();

  if (normalized.includes("high")) {
    return "The supplied job description contains enough concrete requirements to compare against explicit resume evidence.";
  }

  if (normalized.includes("low")) {
    return "The job description or resume evidence is limited, so this result should be treated cautiously.";
  }

  return "Some requirements can be compared directly, but the available information leaves room for uncertainty.";
}

export default App;
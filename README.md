I have already built and tested my JobPilot MVP locally. I want you to create a complete, professional README.md for my existing project.

IMPORTANT:
- Do NOT invent features that my project does not have.
- Do NOT change my code.
- Do NOT create a generic README.
- Base the README strictly on the actual project structure and implementation I provide.
- The README should accurately describe what the current MVP does.
- Keep the documentation professional but easy to understand.
- This README will be pushed to my GitHub repository and may be reviewed as part of my FlyRank FL-07 assignment.

PROJECT NAME:
JobPilot

PROJECT PURPOSE:
JobPilot is a personal AI-powered job search assistant. Its core job is to compare a pasted job description against my resume and provide an estimated job-match analysis.

CURRENT PROJECT STRUCTURE:

jobpilot/
├── backend/
│   ├── app.py
│   ├── requirements.txt
│   └── resume/
│       └── Rahul_Kumar_Resume.pdf
├── frontend/
│   ├── package.json
│   ├── index.html
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       └── style.css
├── .env.example
├── .gitignore
├── README.md
├── BUILD_LOG.md
└── EVAL_RESULTS.md

TECHNOLOGY STACK:

Frontend:
- React
- Vite
- JavaScript
- CSS

Backend:
- Python
- FastAPI
- Uvicorn
- Pydantic
- pypdf
- python-dotenv

AI:
- Google Gemini API
- google-genai Python SDK
- Structured JSON response

CURRENT BACKEND FLOW:

1. FastAPI starts the backend server.
2. The backend loads the Gemini API key from the project-root .env file.
3. The backend reads Rahul_Kumar_Resume.pdf from backend/resume/.
4. pypdf extracts readable text from the resume.
5. The user pastes a job description into the React frontend.
6. The frontend sends the job description to POST /api/analyze.
7. The backend combines the extracted resume text with the job description.
8. Gemini analyzes the job description against the resume.
9. The backend expects structured JSON matching the Pydantic AnalysisResponse schema.
10. The result is returned to the React frontend.
11. The frontend displays the analysis.

CURRENT ANALYSIS OUTPUT:

The backend returns:

- match_score
- match_summary
- matching_skills
- skill_gaps
- experience_match
- preparation_suggestions
- confidence

The match score is an estimate and must NOT be described as scientifically exact.

CURRENT API ENDPOINTS:

GET:
/api/health

Purpose:
Checks whether the backend is running and whether the resume PDF can be loaded.

Example successful response:

{
  "status": "ready",
  "resume_filename": "Rahul_Kumar_Resume.pdf",
  "resume_loaded": true,
  "resume_error": null
}

POST:
/api/analyze

Purpose:
Analyzes a pasted job description against the resume.

The request contains:
- job_description
- optional job_url

IMPORTANT:
The current MVP intentionally does NOT perform URL analysis. If a job URL is supplied, the backend rejects it and asks the user to paste the job description directly.

CURRENT AGENT GUARDRAILS:

The AI instructions tell JobPilot:

- Use only facts explicitly present in the supplied resume.
- Never invent skills.
- Never invent technologies.
- Never invent education.
- Never invent projects.
- Never invent achievements.
- Never invent years of experience.
- Never exaggerate qualifications.
- Matching skills must have explicit resume evidence.
- Skill gaps must be requirements not explicitly supported by the resume.
- A resume-supported skill must not be incorrectly labeled as a gap.
- Separate matching skills, skill gaps, experience match, and preparation suggestions.
- Clearly state uncertainty when information is limited.
- Confidence must be High, Medium, or Low.
- Never apply for a job.
- Never send an email.
- Never upload a resume or personal information.
- Never submit a form.
- Never perform an irreversible external action.
- Do not fetch URLs in the current MVP.
- The current MVP only analyzes pasted job descriptions.

CURRENT MVP SCOPE:

The narrow core job is:

"Compare a job description against my resume and explain how well they match."

The current MVP does NOT:
- Automatically apply to jobs.
- Submit applications.
- Send emails.
- Upload resumes to external job sites.
- Fetch job URLs.
- Perform external irreversible actions.

LOCAL SETUP:

The README should explain how to run the backend and frontend locally on Windows using Git Bash.

Backend commands:

cd ~/Desktop/jobpilot/backend
python -m venv .venv
source .venv/Scripts/activate
python -m pip install -r requirements.txt
python -m uvicorn app:app --reload

Backend runs at:

http://127.0.0.1:8000

Health check:

http://127.0.0.1:8000/api/health

Frontend requires a separate terminal:

cd ~/Desktop/jobpilot/frontend
npm install
npm run dev

Frontend normally runs at:

http://localhost:5173

ENVIRONMENT VARIABLES:

The project uses a root-level .env file.

Expected format:

GEMINI_API_KEY=YOUR_GEMINI_API_KEY

IMPORTANT SECURITY RULES:
- Never put the real Gemini API key in README.md.
- Never put the real API key in .env.example.
- Never commit .env to GitHub.
- Explain that .env should remain private.
- .env.example should contain only a placeholder.

GITHUB:

My repository is:

https://github.com/RahulKumarsb-45/JobPilot

Do not claim that the repository contains anything unless it is actually present.

FL-07 CONTEXT:

This project is being built for the FlyRank General AI Fluency FL-07 assignment "Build the Agent".

The assignment requires:
1. Build on the platform chosen in FL-06.
2. Start with the narrowest core job.
3. Get one complete end-to-end run working.
4. Connect at least one real tool/data source/file/external service.
5. Keep a build log documenting what broke, what changed, and what was cut from the original specification.
6. Record a raw, unedited screen capture of a successful end-to-end run.

For this project, the live data/tool connection is:
- Local resume PDF
- Gemini API

The README should mention this accurately.

SUCCESSFUL END-TO-END FLOW:

The project has been tested successfully locally:

User opens JobPilot
→ Resume is loaded
→ User pastes a job description
→ User clicks Analyze Job
→ React sends request to FastAPI
→ FastAPI reads the resume
→ Gemini analyzes the resume and job description
→ Structured result is returned
→ JobPilot displays the analysis

The successful UI result includes:
- Match Score
- Match Summary
- Matching Skills
- Skill Gaps
- Experience Match
- Preparation Suggestions
- Confidence

DOCUMENTATION REQUIREMENTS:

Create a polished README.md with these sections:

1. Project title
2. Short project description
3. Why JobPilot exists
4. What JobPilot does
5. Key features
6. How the system works
7. Architecture / request flow
8. Technology stack
9. Project structure
10. Backend API endpoints
11. Analysis output
12. AI guardrails
13. MVP limitations
14. Prerequisites
15. Environment setup
16. Backend setup
17. Frontend setup
18. Running the application
19. Testing the health endpoint
20. Testing the analysis flow
21. Example job description
22. Security / API key handling
23. GitHub/development notes
24. FL-07 assignment context
25. Current project status
26. Future improvements

For the architecture section, use a simple ASCII diagram such as:

User
  ↓
React + Vite Frontend
  ↓
FastAPI Backend
  ↓
Resume PDF + Job Description
  ↓
Gemini API
  ↓
Structured Analysis
  ↓
React Results UI

For the testing section, provide a realistic example job description, but clearly label it as an example.

For the security section, emphasize that the real API key must never be committed to GitHub.

For the project status, say that the core MVP has been successfully tested locally, but do NOT claim additional features such as URL scraping, automatic applications, email integration, databases, authentication, or deployment unless they actually exist in the code.

IMPORTANT WRITING STYLE:

- Professional GitHub README.
- Clear headings.
- Useful code blocks.
- Concise but detailed enough for another developer to run the project.
- No unnecessary marketing language.
- No fake claims.
- No invented screenshots.
- No invented metrics.
- No fake test results.
- No fake deployment claims.
- No real API key anywhere.
- Do not modify any project files except README.md.

Before writing the README, inspect the actual project files if they are available and make sure the documentation matches the implementation exactly.

Return the complete README.md content in one Markdown code block so I can copy it directly into VS Code.
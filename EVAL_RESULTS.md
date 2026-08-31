# JobPilot Evaluation Results

All tests are initially marked PENDING.

Run the application locally with your own Gemini API key before changing any result.

Do not fabricate results.

---

## Test 1 — Strong Matching Job

### Input

Paste a backend developer job description containing several technologies explicitly present in the resume:

- Node.js
- Express.js
- REST APIs
- MongoDB
- PostgreSQL
- JWT
- Docker

### Expected Result

- Supported matching technologies are identified.
- No unsupported skills are invented.
- Experience alignment is explained.
- The score is clearly described as an estimate.

### Actual Result

PENDING

### Pass/Fail

PENDING

### Notes

PENDING

---

## Test 2 — Job Requires a Skill Absent From Resume

### Input

Paste a job description requiring Kubernetes.

### Expected Result

- Kubernetes is identified as a skill gap if it is not explicitly present in the resume.
- The agent does not claim Kubernetes experience.
- Other resume-supported requirements may appear as matching skills.

### Actual Result

PENDING

### Pass/Fail

PENDING

### Notes

PENDING

---

## Test 3 — Vague Job Description

### Input

```text
We are looking for a talented developer to join our growing team.
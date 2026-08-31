# Build Log

## Initial Implementation

### Features implemented

- FastAPI backend.
- Runtime PDF parsing with pypdf.
- Resume health-check endpoint.
- Google Gemini integration using google-genai.
- Server-side GEMINI_API_KEY loading.
- Pydantic structured response model.
- Gemini JSON response configuration.
- Defensive response parsing and validation.
- REST endpoint for job analysis.
- React and Vite frontend.
- Premium dark navy and blue interface.
- Responsive layout.
- Resume loaded status.
- Loading state without fake progress percentages.
- Empty state.
- Error state.
- Match score display.
- Matching skills display.
- Skill gaps display.
- Experience match display.
- Preparation suggestions display.
- Confidence display.
- Application safety notice.
- .env.example.
- .gitignore.
- Windows and VS Code setup instructions.
- Pending evaluation documentation.

## Known Limitations

- URL fetching is disabled.
- Job descriptions must be pasted manually.
- No authentication.
- No database.
- No LinkedIn automation.
- No automatic job applications.
- No email automation.
- No external form submission.
- No separate draft-generation chat workflow.

## Deviations from FL-06

### URL functionality

URL access was excluded from the MVP. The pasted job description is the primary and fully supported flow.

This prevents accidental access to unconfirmed URLs and avoids external scraping complexity during the first working implementation.

The optional URL field validates URL syntax but clearly rejects URL analysis.

### Draft materials

Tailored resume bullets, cover letters, and recruiter messages are not automatically generated or sent by this MVP.

The interface clearly marks draft materials as review-only and states that JobPilot does not insert, send, or submit them.

## Evaluation Status

All seven evaluation cases begin as PENDING.

No test result is claimed until the user runs the project locally with a valid Gemini API key.
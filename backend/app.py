import os
from pathlib import Path
from typing import List, Optional

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from google import genai
from google.genai import types
from pydantic import BaseModel, Field, ValidationError
from pypdf import PdfReader


BASE_DIR = Path(__file__).resolve().parent
PROJECT_DIR = BASE_DIR.parent
RESUME_PATH = BASE_DIR / "resume" / "Rahul_Kumar_Resume.pdf"

load_dotenv(PROJECT_DIR / ".env")


app = FastAPI(
    title="JobPilot API",
    description="Personal Job Search Assistant API",
    version="1.0.0",
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://jobpilot-frontend-green.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)


class AnalyzeRequest(BaseModel):
    job_description: str = Field(
        ...,
        min_length=20,
        max_length=30000,
    )
    job_url: Optional[str] = Field(
        default=None,
        max_length=2000,
    )


class AnalysisResponse(BaseModel):
    match_score: int = Field(..., ge=0, le=100)
    match_summary: str = Field(..., min_length=1)
    matching_skills: List[str]
    skill_gaps: List[str]
    experience_match: List[str]
    preparation_suggestions: List[str]
    confidence: str = Field(..., min_length=1)


class HealthResponse(BaseModel):
    status: str
    resume_filename: str
    resume_loaded: bool
    resume_error: Optional[str] = None


def read_resume_text() -> str:
    if not RESUME_PATH.exists():
        raise FileNotFoundError(
            "Resume file is missing. Place Rahul_Kumar_Resume.pdf inside backend/resume/."
        )

    try:
        reader = PdfReader(str(RESUME_PATH))

        if not reader.pages:
            raise ValueError("The resume PDF contains no pages.")

        extracted_pages = []

        for page in reader.pages:
            extracted_pages.append(page.extract_text() or "")

        resume_text = "\n".join(extracted_pages).strip()

        if not resume_text:
            raise ValueError(
                "The resume PDF was opened but no readable text was extracted."
            )

        return resume_text

    except FileNotFoundError:
        raise
    except ValueError:
        raise
    except Exception as exc:
        raise ValueError("The resume PDF could not be parsed.") from exc


def get_resume_error() -> Optional[str]:
    try:
        read_resume_text()
        return None
    except FileNotFoundError as exc:
        return str(exc)
    except ValueError as exc:
        return str(exc)
    except Exception:
        return "The resume could not be read."


def get_gemini_api_key() -> str:
    api_key = os.getenv("GEMINI_API_KEY", "").strip()

    if not api_key:
        raise RuntimeError(
            "GEMINI_API_KEY is missing. Add it to the project root .env file."
        )

    if api_key == "YOUR_GEMINI_API_KEY_HERE":
        raise RuntimeError(
            "GEMINI_API_KEY still contains the placeholder value."
        )

    return api_key


def build_system_instruction() -> str:
    return """
You are JobPilot, a personal job-search analysis assistant for Rahul Kumar.

Compare a job description against the supplied resume and return an honest,
resume-grounded analysis.

Rules:

1. Use only facts explicitly present in the supplied resume.
2. Never invent skills, technologies, education, projects, achievements, or experience.
3. Never invent years of experience.
4. Never exaggerate the candidate's qualifications.
5. Matching skills must be supported by explicit resume evidence.
6. Skill gaps must be job requirements that are not explicitly supported by the resume.
7. Do not label a resume-supported skill as a gap.
8. Separate matching skills, skill gaps, experience match, and preparation suggestions.
9. If the job description is vague or incomplete, explicitly state that information is insufficient.
10. The match score is an estimate, not a scientifically exact measurement.
11. Confidence must be High, Medium, or Low.
12. State uncertainty when the available information is limited.
13. Never apply for a job.
14. Never send an email.
15. Never upload a resume or personal information.
16. Never submit a form.
17. Never perform an irreversible external action.
18. Do not fetch URLs. This MVP analyzes pasted job descriptions only.
19. Return only data matching the supplied response schema.
""".strip()


def build_analysis_prompt(
    resume_text: str,
    job_description: str,
) -> str:
    return f"""
Analyze the job description against the resume below.

RESUME:
----------------
{resume_text}
----------------

JOB DESCRIPTION:
----------------
{job_description}
----------------

Use explicit evidence only.

Score guidance:
- 0 means no meaningful supported alignment.
- 100 means the job description is strongly supported by the resume.
- Use an estimated heuristic score.
- Do not present the score as a scientifically exact result.
- If the job description lacks enough detail, say that information is insufficient
  and use cautious confidence.
""".strip()


def create_gemini_client() -> genai.Client:
    return genai.Client(api_key=get_gemini_api_key())


@app.get("/api/health", response_model=HealthResponse)
def health_check() -> HealthResponse:
    resume_error = get_resume_error()

    return HealthResponse(
        status="ready" if resume_error is None else "error",
        resume_filename=RESUME_PATH.name,
        resume_loaded=resume_error is None,
        resume_error=resume_error,
    )


@app.post("/api/analyze", response_model=AnalysisResponse)
def analyze_job(request: AnalyzeRequest) -> AnalysisResponse:
    job_description = request.job_description.strip()
    job_url = (request.job_url or "").strip()

    if not job_description:
        raise HTTPException(
            status_code=400,
            detail="Please paste a job description before starting the analysis.",
        )

    if len(job_description) < 20:
        raise HTTPException(
            status_code=400,
            detail="The job description is too short. Please provide more information.",
        )

    if job_url:
        raise HTTPException(
            status_code=400,
            detail=(
                "URL analysis is disabled in this MVP. "
                "Paste the job description directly instead."
            ),
        )

    try:
        resume_text = read_resume_text()
    except FileNotFoundError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(
            status_code=422,
            detail="The resume could not be read.",
        ) from exc

    try:
        client = create_gemini_client()
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc

    try:
        response = client.models.generate_content(
            model="gemini-3.6-flash",
            contents=build_analysis_prompt(
                resume_text=resume_text,
                job_description=job_description,
            ),
            config=types.GenerateContentConfig(
                system_instruction=build_system_instruction(),
                temperature=0.2,
                response_mime_type="application/json",
                response_schema=AnalysisResponse,
            ),
        )
    except Exception as exc:
        print("GEMINI ERROR:", repr(exc))
        raise HTTPException(
            status_code=502,
            detail=f"Gemini analysis failed: {exc}",
        ) from exc

    try:
        parsed_result = getattr(response, "parsed", None)

        if isinstance(parsed_result, AnalysisResponse):
            return parsed_result

        if parsed_result is not None:
            return AnalysisResponse.model_validate(parsed_result)

        response_text = getattr(response, "text", None)

        if not response_text:
            raise ValueError("Gemini returned an empty response.")

        return AnalysisResponse.model_validate_json(response_text)

    except (ValidationError, ValueError, TypeError) as exc:
        raise HTTPException(
            status_code=502,
            detail=(
                "Gemini returned an invalid analysis format. "
                "Please try again with a clearer job description."
            ),
        ) from exc
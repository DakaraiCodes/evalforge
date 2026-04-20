import os
import time

from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import func
from openai import OpenAI

from app.database import SessionLocal, engine
from app import models
from app.schemas import PromptRequest, SaveExperimentRequest

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="EvalForge API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
        "https://evalforge.vercel.app",
        "https://evalforge-j67a25p0q-dakaraicodes-projects.vercel.app",
        "https://evalforge-qdohpnc69-dakaraicodes-projects.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# Read the API key only on the backend.
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
openai_client = OpenAI() if OPENAI_API_KEY else None

# Only these models will use the real OpenAI API in Step 9A.
OPENAI_MODELS = {"gpt-4.1-mini", "gpt-4.1"}


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def run_mock_response(prompt: str, model_name: str):
    """Fallback used when the model is unsupported or no API key is available."""
    start_time = time.time()

    fake_output = (
        f"Mock response from {model_name}: "
        f"I received your prompt: '{prompt}'"
    )

    latency_ms = round((time.time() - start_time) * 1000, 2)

    return {
        "model": model_name,
        "output": fake_output,
        "latency_ms": latency_ms,
        "source": "mock",
    }


def run_openai_response(prompt: str, model_name: str):
    """Call the real OpenAI API using the Responses API."""
    start_time = time.time()

    response = openai_client.responses.create(
        model=model_name,
        input=prompt,
    )

    latency_ms = round((time.time() - start_time) * 1000, 2)

    return {
        "model": model_name,
        "output": response.output_text,
        "latency_ms": latency_ms,
        "source": "openai",
    }


@app.get("/")
def read_root():
    return {"message": "EvalForge backend is running"}


@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "openai_configured": bool(OPENAI_API_KEY),
    }


@app.post("/run")
def run_prompt(data: PromptRequest):
    results = []

    for model_name in data.models:
        try:
            if openai_client and model_name in OPENAI_MODELS:
                result = run_openai_response(data.prompt, model_name)
            else:
                result = run_mock_response(data.prompt, model_name)
        except Exception as exc:
            # Fail safely and return a readable error payload instead of crashing the whole comparison.
            result = {
                "model": model_name,
                "output": f"Error calling {model_name}: {str(exc)}",
                "latency_ms": 0,
                "source": "error",
            }

        results.append(result)

    return {
        "prompt": data.prompt,
        "results": results,
    }


@app.post("/save")
def save_experiment(data: SaveExperimentRequest, db: Session = Depends(get_db)):
    saved_count = 0

    for result in data.results:
        experiment = models.ExperimentRun(
            prompt=data.prompt,
            model=result.model,
            output=result.output,
            latency_ms=result.latency_ms,
            correctness=result.correctness,
            clarity=result.clarity,
            usefulness=result.usefulness,
            style=result.style,
            overall=result.overall,
        )
        db.add(experiment)
        saved_count += 1

    db.commit()

    return {
        "message": "Experiment saved successfully",
        "saved_count": saved_count,
    }


@app.get("/experiments")
def get_experiments(db: Session = Depends(get_db)):
    experiments = (
        db.query(models.ExperimentRun)
        .order_by(models.ExperimentRun.created_at.desc())
        .limit(20)
        .all()
    )

    return [
        {
            "id": experiment.id,
            "prompt": experiment.prompt,
            "model": experiment.model,
            "output": experiment.output,
            "latency_ms": experiment.latency_ms,
            "correctness": experiment.correctness,
            "clarity": experiment.clarity,
            "usefulness": experiment.usefulness,
            "style": experiment.style,
            "overall": experiment.overall,
            "created_at": experiment.created_at.isoformat(),
        }
        for experiment in experiments
    ]


@app.get("/dashboard")
def get_dashboard(db: Session = Depends(get_db)):
    total_runs = db.query(models.ExperimentRun).count()

    avg_overall_score = db.query(func.avg(models.ExperimentRun.overall)).scalar()
    avg_latency = db.query(func.avg(models.ExperimentRun.latency_ms)).scalar()

    model_stats = (
        db.query(
            models.ExperimentRun.model,
            func.avg(models.ExperimentRun.overall).label("avg_score"),
            func.avg(models.ExperimentRun.latency_ms).label("avg_latency"),
            func.count(models.ExperimentRun.id).label("run_count"),
        )
        .group_by(models.ExperimentRun.model)
        .all()
    )

    best_model = "--"
    if model_stats:
        best_model_row = max(model_stats, key=lambda row: row.avg_score or 0)
        best_model = best_model_row.model

    return {
        "total_runs": total_runs,
        "avg_overall_score": round(avg_overall_score, 2) if avg_overall_score is not None else None,
        "avg_latency": round(avg_latency, 2) if avg_latency is not None else None,
        "best_model": best_model,
        "model_stats": [
            {
                "model": row.model,
                "avg_score": round(row.avg_score, 2) if row.avg_score is not None else None,
                "avg_latency": round(row.avg_latency, 2) if row.avg_latency is not None else None,
                "run_count": row.run_count,
            }
            for row in model_stats
        ],
    }
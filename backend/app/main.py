from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import time

app = FastAPI(title="EvalForge API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class PromptRequest(BaseModel):
    prompt: str
    model: str


@app.get("/")
def read_root():
    return {"message": "EvalForge backend is running"}


@app.get("/health")
def health_check():
    return {"status": "ok"}


@app.post("/run")
def run_prompt(data: PromptRequest):
    start_time = time.time()

    fake_output = (
        f"Mock response from {data.model}: "
        f"I received your prompt: '{data.prompt}'"
    )

    latency_ms = round((time.time() - start_time) * 1000, 2)

    return {
        "model": data.model,
        "output": fake_output,
        "latency_ms": latency_ms,
    }
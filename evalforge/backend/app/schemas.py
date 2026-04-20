from pydantic import BaseModel
from typing import List


class PromptRequest(BaseModel):
    prompt: str
    models: List[str]


class SaveResultItem(BaseModel):
    model: str
    output: str
    latency_ms: float
    correctness: int
    clarity: int
    usefulness: int
    style: int
    overall: int


class SaveExperimentRequest(BaseModel):
    prompt: str
    results: List[SaveResultItem]
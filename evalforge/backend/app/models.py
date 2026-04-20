from sqlalchemy import Column, Integer, String, Float, DateTime
from datetime import datetime

from app.database import Base


class ExperimentRun(Base):
    __tablename__ = "experiment_runs"

    id = Column(Integer, primary_key=True, index=True)
    prompt = Column(String, nullable=False)
    model = Column(String, nullable=False)
    output = Column(String, nullable=False)
    latency_ms = Column(Float, nullable=False)

    correctness = Column(Integer, nullable=False)
    clarity = Column(Integer, nullable=False)
    usefulness = Column(Integer, nullable=False)
    style = Column(Integer, nullable=False)
    overall = Column(Integer, nullable=False)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
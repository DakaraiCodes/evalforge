# EvalForge

EvalForge is a full-stack LLM evaluation platform for comparing model outputs, scoring responses with a human rubric, saving experiments, and reviewing analytics through a dashboard.

## Live Demo

- Frontend: https://evalforge.vercel.app
- Backend: https://evalforge.onrender.com

## Overview

EvalForge was built to simulate a real internal AI evaluation tool. A user can enter one prompt, run it across multiple models, compare outputs side by side, score each response, save the evaluation, and review historical experiment data through charts and searchable history.

This project was designed to go beyond a basic chatbot by focusing on model comparison, evaluation workflows, persistence, and analytics.

## Features

- Multi-model prompt comparison
- Side-by-side output review
- Manual rubric scoring
  - Correctness
  - Clarity
  - Usefulness
  - Style
  - Overall
- Save experiments to a database
- Search, filter, and sort saved experiment history
- Dashboard analytics
  - Total saved runs
  - Average saved score
  - Average latency
  - Best saved model
- Charts for model score and latency trends
- Real OpenAI API integration for supported models
- Mock fallback mode for unsupported models

## Tech Stack

### Frontend
- React
- Vite
- Tailwind CSS
- Recharts

### Backend
- FastAPI
- SQLAlchemy
- OpenAI Python SDK

### Database
- SQLite for local development
- PostgreSQL for production

### Deployment
- Vercel (frontend)
- Render (backend + PostgreSQL)

## How It Works

1. Enter a prompt
2. Select one or more models
3. Run the evaluation
4. Compare model outputs side by side
5. Score each response using the rubric
6. Save the experiment
7. Review historical runs in the dashboard and history section

## Supported Models

### Real API
- gpt-4.1-mini
- gpt-4.1

### Mock Fallback
- claude-sonnet
- gemini-pro

## Local Development

### 1. Clone the repo

```bash
git clone https://github.com/DakaraiCodes/evalforge.git
cd Evalforge

###2. Backend setup

# EvalForge

EvalForge is a full-stack LLM evaluation platform for comparing model outputs, scoring responses with a human rubric, saving experiments, and reviewing analytics through a dashboard.

## Live Demo

- Frontend: https://evalforge.vercel.app
- Backend: https://evalforge.onrender.com

## Overview

EvalForge was built to simulate a real internal AI evaluation tool. A user can enter one prompt, run it across multiple models, compare outputs side by side, score each response, save the evaluation, and review historical experiment data through charts and searchable history.

This project was designed to go beyond a basic chatbot by focusing on model comparison, evaluation workflows, persistence, and analytics.

## Features

- Multi-model prompt comparison
- Side-by-side output review
- Manual rubric scoring
  - Correctness
  - Clarity
  - Usefulness
  - Style
  - Overall
- Save experiments to a database
- Search, filter, and sort saved experiment history
- Dashboard analytics
  - Total saved runs
  - Average saved score
  - Average latency
  - Best saved model
- Charts for model score and latency trends
- Real OpenAI API integration for supported models
- Mock fallback mode for unsupported models

## Tech Stack

### Frontend
- React
- Vite
- Tailwind CSS
- Recharts

### Backend
- FastAPI
- SQLAlchemy
- OpenAI Python SDK

### Database
- SQLite for local development
- PostgreSQL for production

### Deployment
- Vercel (frontend)
- Render (backend + PostgreSQL)

## How It Works

1. Enter a prompt
2. Select one or more models
3. Run the evaluation
4. Compare model outputs side by side
5. Score each response using the rubric
6. Save the experiment
7. Review historical runs in the dashboard and history section

## Supported Models

### Real API
- gpt-4.1-mini
- gpt-4.1

### Mock Fallback
- claude-sonnet
- gemini-pro

## Local Development

### 1. Clone the repo

```bash
git clone https://github.com/DakaraiCodes/evalforge.git
cd Evalforge

2. Backend setup
cd evalforge/backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
python -m uvicorn app.main:app --reload

Backend runs on:

http://127.0.0.1:8000
3. Frontend setup

Open a second terminal:

cd evalforge/frontend
npm install
npm run dev

Frontend runs on:

http://localhost:5173
Environment Variables
Frontend (evalforge/frontend/.env.local)
VITE_API_BASE_URL=http://127.0.0.1:8000
Backend

Set these environment variables:

OPENAI_API_KEY=your_openai_api_key
DATABASE_URL=your_database_url

Local development falls back to SQLite if DATABASE_URL is not set.

Project Structure
Evalforge/
├── README.md
├── docs/
└── evalforge/
    ├── backend/
    │   ├── app/
    │   │   ├── main.py
    │   │   ├── database.py
    │   │   ├── models.py
    │   │   └── schemas.py
    │   └── requirements.txt
    └── frontend/
        ├── src/
        │   └── App.jsx
        └── package.json

Deployment Notes
Frontend deployed on Vercel
Backend deployed on Render
PostgreSQL used in production
OpenAI API key is stored only on the backend through environment variables
CORS configured for local development and deployed frontend domains
Why This Project Matters

EvalForge demonstrates:

full-stack product development
LLM evaluation workflows
backend API design
database persistence
frontend state management
deployment and environment configuration
secure API integration practices

This project was built as a portfolio piece for software engineering and AI-focused roles.

Future Improvements
Support additional real model providers
Add experiment datasets and batch evaluations
Add authentication and user accounts
Export results to CSV/JSON
Add richer analytics and chart filtering
Add cost tracking per run
Author

Built by Dakarai Mitcham as a portfolio project for software engineering and AI-focused roles.
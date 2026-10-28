<div align="center">

# 🥦 NutriGuide — Nutrition Agentic AI

### Personalized Nutrition Planning powered by IBM Granite · IBM WatsonX

[![Python](https://img.shields.io/badge/Python-3.10%2B-blue?logo=python&logoColor=white)](https://python.org)
[![Flask](https://img.shields.io/badge/Flask-3.0-black?logo=flask&logoColor=white)](https://flask.palletsprojects.com)
[![IBM WatsonX](https://img.shields.io/badge/IBM-WatsonX-0f62fe?logo=ibm&logoColor=white)](https://www.ibm.com/watsonx)
[![IBM Granite](https://img.shields.io/badge/IBM%20Granite-3.3%208B%20Instruct-4589ff)](https://www.ibm.com/granite)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

</div>

---

## 📖 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Architecture](#-architecture)
- [Project Structure](#-project-structure)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Running the Application](#-running-the-application)
- [API Reference](#-api-reference)
- [Agentic Conversation Flow](#-agentic-conversation-flow)
- [AI Ethics & Guardrails](#-ai-ethics--guardrails)
- [Screenshots](#-screenshots)
- [Medical Disclaimer](#️-medical-disclaimer)
- [Contributing](#-contributing)

---

## 🌿 Overview

**NutriGuide** is a web-based **Agentic AI** application that engages users in a guided, multi-turn conversation to collect their personal health profile and generates a fully personalized **7-day nutrition plan** using **IBM Granite 3.3 8B Instruct** via **IBM WatsonX**.

The application follows **AI Ethics principles**, applies **guardrails** to prevent harmful advice, uses a **Helpful, Accurate, and Mindful (HAM)** conversational tone, and appends a **clear medical disclaimer** to every generated plan.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🤖 **Agentic Multi-turn Chat** | Guided 5-step data collection (name → age → diet → medical → location) |
| 🧠 **IBM Granite LLM** | Powered by `ibm/granite-3-3-8b-instruct` via WatsonX REST API |
| 🥗 **Personalized 7-Day Plan** | Culturally-aware meals using locally available foods |
| 🏥 **Medical-aware Planning** | Accounts for diabetes, blood pressure, thyroid, PCOS, and more |
| 🛡️ **AI Guardrails** | Keyword-based safety filters block harmful dietary advice |
| 💬 **Follow-up Q&A** | Multi-turn question answering with full conversation context |
| 📊 **Progress Sidebar** | Real-time profile summary and step progress bar |
| 📱 **Responsive Design** | Works on desktop, tablet, and mobile |
| ⚕️ **Medical Disclaimer** | Appended automatically to every generated plan |
| 🔄 **Session Management** | Per-user sessions with reset capability |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────┐
│                  Web Browser                    │
│         (HTML + CSS + Vanilla JS)               │
└────────────────────┬────────────────────────────┘
                     │ REST API (JSON)
┌────────────────────▼────────────────────────────┐
│              Flask Web Server                   │
│                  app.py                         │
│    /api/session/start  /api/chat  /api/health   │
└────────────────────┬────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────┐
│           Nutrition Agent (agent.py)            │
│  Stage Machine → Guardrails → Plan Generation  │
│      greeting → name → age → diet →            │
│      medical → location → LLM → Q&A            │
└────────────────────┬────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────┐
│         IBM Granite LLM (granite_llm.py)        │
│   IAM Token Exchange → WatsonX REST API Call    │
│     ibm/granite-3-3-8b-instruct on WatsonX      │
└─────────────────────────────────────────────────┘
```

---

## 📁 Project Structure

```
nutrition-ai/
│
├── app.py                  # Flask web server & REST API routes
├── agent.py                # Agentic stage machine, guardrails, orchestration
├── granite_llm.py          # IBM WatsonX / Granite REST API client
├── config.py               # API credentials, model parameters, guardrail keywords
│
├── requirements.txt        # Python dependencies
├── env.example             # Environment variable template (copy to .env)
│
├── templates/
│   └── index.html          # Single-page application (SPA) chat interface
│
└── static/
    ├── css/
    │   └── style.css       # Full responsive UI — IBM blue design system
    └── js/
        └── app.js          # Frontend agent logic, markdown renderer, chip suggestions
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **LLM** | IBM Granite 3.3 8B Instruct (`ibm/granite-3-3-8b-instruct`) |
| **AI Platform** | IBM WatsonX (au-syd endpoint) |
| **Backend** | Python 3.10+ · Flask 3.x |
| **Authentication** | IBM IAM Token Exchange |
| **Frontend** | HTML5 · CSS3 · Vanilla JavaScript |
| **Font** | Inter (Google Fonts) |
| **Deployment** | Gunicorn (production) · Flask dev server |

---

## 📋 Prerequisites

- **Python** 3.10 or higher
- **pip** package manager
- **IBM Cloud** account with WatsonX access
- **IBM WatsonX API Key** and **Project ID**
- Internet connection (for IBM IAM token exchange)

---

## ⚙️ Installation

### 1. Clone the repository

```bash
git clone https://github.com/mayuribotre15/Nutrition-Agent.git
cd Nutrition-Agent
```

### 2. Create and activate a virtual environment

```bash
# Windows
python -m venv venv
venv\Scripts\activate

# macOS / Linux
python3 -m venv venv
source venv/bin/activate
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

---

## 🔧 Configuration

The application credentials are pre-configured in [`config.py`](config.py). To override them using environment variables:

### Copy the environment template

```bash
cp env.example .env
```

### Edit `.env` with your values

```env
IBM_API_KEY=your_ibm_api_key_here
IBM_PROJECT_ID=your_project_id_here
IBM_ENDPOINT=https://au-syd.ml.cloud.ibm.com
SECRET_KEY=your_flask_secret_key
```

### Current WatsonX Configuration

| Parameter | Value |
|---|---|
| Model ID | `ibm/granite-3-3-8b-instruct` |
| Project ID | `d74af373-30ec-4b7c-9447-0bdbd333e1f6` |
| Endpoint | `https://au-syd.ml.cloud.ibm.com` |
| IAM URL | `https://iam.cloud.ibm.com/identity/token` |
| Max Tokens | `1024` |
| Temperature | `0.7` |

---

## ▶️ Running the Application

### Development

```bash
python app.py
```

Open your browser at **[http://localhost:5000](http://localhost:5000)**

### Production (Gunicorn)

```bash
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

---

## 🔗 API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | Serves the web application |
| `POST` | `/api/session/start` | Creates a new agent session → returns `session_id` |
| `POST` | `/api/chat` | Send message to agent → returns AI response + stage + progress |
| `POST` | `/api/session/reset` | Resets agent for a new plan |
| `GET` | `/api/health` | Health check → returns status and model name |

### Example `/api/chat` Request

```json
POST /api/chat
{
  "session_id": "uuid-here",
  "message": "Vegetarian"
}
```

### Example Response

```json
{
  "message": "Great choice — Vegetarian diet noted! ...",
  "stage": "collect_medical",
  "progress": 50
}
```

---

## 🔄 Agentic Conversation Flow

```
👋 Greeting
    ↓
👤 Collect Name  →  validates: letters only, ≥ 2 chars
    ↓
🎂 Collect Age   →  validates: integer, 5–110 years
    ↓
🥗 Collect Diet  →  detects: Veg / Non-Veg / Vegan / Pescatarian / Flexitarian
    ↓
🏥 Medical History  →  free text (diabetes, BP, thyroid, etc.)  |  "none"
    ↓
📍 Location      →  city + country for local food recommendations
    ↓
⚙️  IBM Granite LLM generates 7-day plan  (with medical disclaimer)
    ↓
💬  Follow-up Q&A  →  multi-turn with conversation history context
```

Each stage validates input before advancing. Guardrail check runs on **every user message**.

---

## 🛡️ AI Ethics & Guardrails

### HAM Principles

| Principle | Implementation |
|---|---|
| **Helpful** | Evidence-based, actionable, culturally-aware advice |
| **Accurate** | WHO / ICMR / NIH nutrition guidelines in system prompt |
| **Mindful** | Warm, respectful, inclusive, non-judgmental tone |

### Guardrails

- **Keyword blocklist** — blocks: `overdose`, `starve`, `purge`, `steroids`, `laxative abuse`, `extreme fast`, `poison`, `suicide`, `self-harm`, and more
- **Eating disorder detection** — compassionate redirect to professional support
- **No medical diagnosis** — LLM is instructed never to diagnose or prescribe
- **No miracle claims** — guaranteed outcomes explicitly forbidden
- **Professional referral** — always recommends a registered dietitian or doctor

---

## ⚕️ Medical Disclaimer

> The nutrition information and meal plans provided by this AI assistant are for **general informational and educational purposes only**. They are **not** a substitute for professional medical advice, diagnosis, or treatment.
>
> Always consult a **qualified healthcare provider** or **registered dietitian** before making significant changes to your diet, especially if you have existing medical conditions such as diabetes, hypertension, kidney disease, or are pregnant/breastfeeding.
>
> **In case of a medical emergency, contact emergency services immediately.**

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'Add your feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

<div align="center">
  <p>Built with ❤️ using <strong>IBM Granite</strong> · <strong>IBM WatsonX</strong> · <strong>Flask</strong></p>
</div>

"""
Nutrition Agentic AI Application
Powered by IBM Granite LLM via IBM WatsonX
"""

from flask import Flask, render_template, request, jsonify, session
import uuid
from agent import NutritionAgent
from config import Config

app = Flask(__name__)
app.secret_key = Config.SECRET_KEY

# In-memory session store for demo purposes
sessions = {}


@app.route("/")
def index():
    """Serve the main application page."""
    return render_template("index.html")


@app.route("/api/session/start", methods=["POST"])
def start_session():
    """Initialize a new user session."""
    session_id = str(uuid.uuid4())
    sessions[session_id] = NutritionAgent()
    return jsonify({"session_id": session_id, "message": "Session started successfully."})


@app.route("/api/chat", methods=["POST"])
def chat():
    """Handle user messages within a session."""
    data = request.get_json()
    session_id = data.get("session_id")
    user_message = data.get("message", "").strip()

    if not session_id or session_id not in sessions:
        return jsonify({"error": "Invalid or expired session. Please refresh and start again."}), 400

    if not user_message:
        return jsonify({"error": "Message cannot be empty."}), 400

    agent: NutritionAgent = sessions[session_id]
    response = agent.process_message(user_message)

    return jsonify(response)


@app.route("/api/session/reset", methods=["POST"])
def reset_session():
    """Reset the agent for a new plan."""
    data = request.get_json()
    session_id = data.get("session_id")

    if session_id and session_id in sessions:
        sessions[session_id] = NutritionAgent()

    return jsonify({"message": "Session reset. Ready for a new plan."})


@app.route("/api/health", methods=["GET"])
def health():
    """Health check endpoint."""
    return jsonify({"status": "healthy", "model": Config.MODEL_ID})


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)

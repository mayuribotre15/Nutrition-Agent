"""
Configuration for Nutrition Agentic AI Application
"""

import os


class Config:
    # Flask
    SECRET_KEY = os.environ.get("SECRET_KEY", "nutrition-ai-secret-2024")

    # IBM WatsonX Credentials
    IBM_API_KEY = os.environ.get("IBM_API_KEY", "ISoJbH2YszTaLvO7BfxG_ztb3SeP3m-zjQ1uACZRu1JL")
    IBM_PROJECT_ID = os.environ.get("IBM_PROJECT_ID", "d74af373-30ec-4b7c-9447-0bdbd333e1f6")
    IBM_ENDPOINT = os.environ.get("IBM_ENDPOINT", "https://au-syd.ml.cloud.ibm.com")
    IBM_IAM_URL = "https://iam.cloud.ibm.com/identity/token"

    # IBM Granite Model
    MODEL_ID = "ibm/granite-3-3-8b-instruct"

    # Model Parameters
    MAX_NEW_TOKENS = 1024
    MIN_NEW_TOKENS = 50
    TEMPERATURE = 0.7
    TOP_P = 0.9
    TOP_K = 50
    REPETITION_PENALTY = 1.1

    # Guardrail keywords that trigger safety responses
    HARMFUL_KEYWORDS = [
        "suicide", "self-harm", "overdose", "poison", "starve",
        "extreme fast", "stop eating", "miracle cure", "guaranteed weight loss",
        "illegal", "drug", "steroid", "laxative abuse", "vomit", "purge"
    ]

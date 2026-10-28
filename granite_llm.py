"""
IBM WatsonX Granite LLM Integration Module
Handles authentication and inference calls to IBM Granite model.
"""

import requests
import json
from config import Config


class GraniteLLM:
    """IBM Granite LLM client using WatsonX REST API."""

    def __init__(self):
        self.api_key = Config.IBM_API_KEY
        self.project_id = Config.IBM_PROJECT_ID
        self.endpoint = Config.IBM_ENDPOINT
        self.model_id = Config.MODEL_ID
        self.iam_url = Config.IBM_IAM_URL
        self._token = None

    def _get_iam_token(self) -> str:
        """Retrieve an IBM Cloud IAM access token."""
        headers = {"Content-Type": "application/x-www-form-urlencoded"}
        data = {
            "grant_type": "urn:ibm:params:oauth:grant-type:apikey",
            "apikey": self.api_key,
        }
        response = requests.post(self.iam_url, headers=headers, data=data, timeout=30)
        response.raise_for_status()
        self._token = response.json()["access_token"]
        return self._token

    def generate(self, prompt: str, system_prompt: str = "") -> str:
        """
        Generate a response from IBM Granite via WatsonX Text Generation API.

        Args:
            prompt: The user prompt / conversation turn.
            system_prompt: Optional system-level instruction.

        Returns:
            Generated text string.
        """
        token = self._get_iam_token()

        url = f"{self.endpoint}/ml/v1/text/generation?version=2023-05-29"

        headers = {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "Authorization": f"Bearer {token}",
        }

        # Build the full prompt following Granite's chat template
        if system_prompt:
            full_prompt = (
                f"<|system|>\n{system_prompt}\n"
                f"<|user|>\n{prompt}\n"
                f"<|assistant|>\n"
            )
        else:
            full_prompt = f"<|user|>\n{prompt}\n<|assistant|>\n"

        payload = {
            "model_id": self.model_id,
            "input": full_prompt,
            "parameters": {
                "decoding_method": "sample",
                "max_new_tokens": Config.MAX_NEW_TOKENS,
                "min_new_tokens": Config.MIN_NEW_TOKENS,
                "temperature": Config.TEMPERATURE,
                "top_p": Config.TOP_P,
                "top_k": Config.TOP_K,
                "repetition_penalty": Config.REPETITION_PENALTY,
                "stop_sequences": ["<|user|>", "<|system|>"],
            },
            "project_id": self.project_id,
        }

        response = requests.post(url, headers=headers, json=payload, timeout=60)
        response.raise_for_status()

        result = response.json()
        generated_text = result["results"][0]["generated_text"].strip()
        return generated_text

    def generate_with_history(self, messages: list, system_prompt: str = "") -> str:
        """
        Generate a response from IBM Granite using a multi-turn conversation history.

        Args:
            messages: List of dicts with 'role' (user/assistant) and 'content' keys.
            system_prompt: Optional system-level instruction.

        Returns:
            Generated text string.
        """
        token = self._get_iam_token()
        url = f"{self.endpoint}/ml/v1/text/generation?version=2023-05-29"

        headers = {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "Authorization": f"Bearer {token}",
        }

        # Build multi-turn prompt
        full_prompt = ""
        if system_prompt:
            full_prompt += f"<|system|>\n{system_prompt}\n"

        for msg in messages:
            role = msg.get("role", "user")
            content = msg.get("content", "")
            if role == "user":
                full_prompt += f"<|user|>\n{content}\n"
            elif role == "assistant":
                full_prompt += f"<|assistant|>\n{content}\n"

        full_prompt += "<|assistant|>\n"

        payload = {
            "model_id": self.model_id,
            "input": full_prompt,
            "parameters": {
                "decoding_method": "sample",
                "max_new_tokens": Config.MAX_NEW_TOKENS,
                "min_new_tokens": Config.MIN_NEW_TOKENS,
                "temperature": Config.TEMPERATURE,
                "top_p": Config.TOP_P,
                "top_k": Config.TOP_K,
                "repetition_penalty": Config.REPETITION_PENALTY,
                "stop_sequences": ["<|user|>", "<|system|>"],
            },
            "project_id": self.project_id,
        }

        response = requests.post(url, headers=headers, json=payload, timeout=60)
        response.raise_for_status()

        result = response.json()
        generated_text = result["results"][0]["generated_text"].strip()
        return generated_text

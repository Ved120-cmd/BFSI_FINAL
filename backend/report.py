"""
report.py  –  AI Report Generation using Ollama (local LLM)
=============================================================
Uses Ollama running locally with gemma (or any other model).

Install Ollama: https://ollama.com/download
Pull model:     ollama pull gemma3
Run Ollama:     ollama serve   (runs on http://localhost:11434)

Endpoint:
  POST /api/report  → generates AI analysis report using local LLM
"""

import requests
from flask import request, jsonify


OLLAMA_URL   = "http://localhost:11434/api/generate"
OLLAMA_MODEL = "gemma3"   # change to "llama3", "mistral", "phi3" etc. if preferred


def build_prompt(data: dict) -> str:
    name         = data.get("customer_name", "N/A")
    policy_no    = data.get("policy_number", "N/A")
    policy_type  = data.get("policy_type", "N/A")
    age          = data.get("age", "N/A")
    gender       = data.get("gender", "N/A")
    region       = data.get("region", "N/A")
    tenure       = data.get("tenure_years", "N/A")
    premium      = data.get("annual_premium", "N/A")
    claims       = data.get("claim_count", "N/A")
    satisfaction = data.get("satisfaction_score", "N/A")

    churn_risk   = data.get("churn_risk", "N/A")
    churn_prob   = data.get("churn_prob", "N/A")
    loyalty_tier = data.get("loyalty_tier", "N/A")
    loyalty_prob = data.get("loyalty_prob", "N/A")
    fraud_alert  = data.get("fraud_alert", "N/A")
    fraud_prob   = data.get("fraud_prob", "N/A")

    return f"""You are an expert insurance analytics consultant at AssureGuard.
You have just run three ML models on a customer and must explain the results
clearly to a non-technical insurance manager.

CUSTOMER PROFILE
----------------
Name           : {name}
Policy Number  : {policy_no}
Policy Type    : {policy_type}
Age            : {age}
Gender         : {gender}
Region         : {region}
Tenure         : {tenure} years
Annual Premium : Rs.{premium}
Claim Count    : {claims}
Satisfaction   : {satisfaction}/10

MODEL PREDICTIONS
-----------------
Churn Risk     : {churn_risk} ({churn_prob}%)
Loyalty Tier   : {loyalty_tier} ({loyalty_prob}%)
Fraud Alert    : {fraud_alert} ({fraud_prob}%)

SCORING RULES
-------------
Churn risk is HIGH when satisfaction <= 5, OR claims/year >= 2, OR tenure < 1.5 years.
Loyalty is CHAMPION when tenure >= 3 years AND satisfaction >= 7 AND claims/year <= 1.
Fraud alert rises with claim count, low tenure, and unusual claim patterns.

YOUR TASK
---------
Write a structured report with these EXACT sections:

## Executive Summary
2-3 sentence plain-English overview of this customer's risk profile.

## Why Churn Risk is {churn_risk} ({churn_prob}%)
Explain which specific customer attributes drove this score.
Reference exact values (e.g. "satisfaction of {satisfaction}/10").
Use bullet points for the key drivers.

## Why Loyalty is {loyalty_tier} ({loyalty_prob}%)
Explain which attributes support or undermine loyalty.
Be specific about what would need to change to move to the next tier.

## Why Fraud Probability is {fraud_alert} ({fraud_prob}%)
Explain what patterns drove this score.

## Recommended Actions
Give 3-5 concrete, prioritised actions the insurance manager should take.
Format as numbered list. Be specific (e.g. "Call within 48 hours").

## Risk Rating
End with a single line:
Overall Risk: [LOW / MEDIUM / HIGH / CRITICAL]

Keep tone professional but human. Avoid jargon. Total length: 350-500 words.
"""


def call_ollama(prompt: str) -> str:
    """Call Ollama's local API and return the generated text."""
    payload = {
        "model":  OLLAMA_MODEL,
        "prompt": prompt,
        "stream": False,
        "options": {
            "temperature": 0.7,
            "num_predict": 1024,
        }
    }
    resp = requests.post(OLLAMA_URL, json=payload, timeout=120)
    resp.raise_for_status()
    return resp.json().get("response", "").strip()


def register_report_route(app):
    from flask_cors import cross_origin

    @app.route("/api/report", methods=["POST", "OPTIONS"])
    @cross_origin()
    def generate_report():
        if request.method == "OPTIONS":
            return {}, 200

        data = request.get_json(force=True)
        if not data:
            return jsonify({"error": "No JSON body"}), 400

        required = ["churn_risk", "churn_prob", "loyalty_tier",
                    "loyalty_prob", "fraud_alert", "fraud_prob"]
        missing = [k for k in required if k not in data]
        if missing:
            return jsonify({"error": f"Missing fields: {missing}"}), 400

        try:
            prompt      = build_prompt(data)
            report_text = call_ollama(prompt)
            return jsonify({"report": report_text, "model": OLLAMA_MODEL})

        except requests.exceptions.ConnectionError:
            return jsonify({
                "error": (
                    f"Cannot connect to Ollama at {OLLAMA_URL}. "
                    "Make sure Ollama is running: run 'ollama serve' in a terminal."
                )
            }), 503

        except requests.exceptions.Timeout:
            return jsonify({"error": "Ollama timed out. Try a smaller/faster model."}), 504

        except Exception as e:
            import traceback
            traceback.print_exc()
            return jsonify({"error": str(e)}), 500
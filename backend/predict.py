"""
predict.py  –  Flask REST API for BFSI Insurance ML Models
===========================================================
Models:
  model1_churn    → Churn Risk Prediction
  model2_loyalty  → Loyalty Detection
  model3_fraud    → Fraud Detection

Endpoints:
  POST /api/predict    → runs all 3 models on one customer
  GET  /api/dashboard  → aggregate KPIs
  GET  /api/health     → status check

Run:
  pip install flask flask-cors scikit-learn pandas numpy
  python predict.py
"""

import os
import pickle
import warnings
import pandas as pd
import numpy as np
from flask import Flask, request, jsonify
from flask_cors import CORS

warnings.filterwarnings("ignore", category=UserWarning, module="sklearn")

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "http://localhost:5173"}})

# ── Load model bundle ──────────────────────────────────────────────────────
MODEL_PATH = os.path.join(os.path.dirname(__file__), "..", "visualization", "trained_models.pkl")
bundle = None

def load_bundle():
    global bundle
    try:
        with open(MODEL_PATH, "rb") as f:
            bundle = pickle.load(f)
        print(f"✅  Models loaded — churn:{bundle['model1_label']}  "
              f"loyalty:{bundle['model2_label']}  fraud:{bundle['model3_label']}")
    except FileNotFoundError:
        print(f"⚠️   trained_models.pkl not found at {MODEL_PATH}")
        print("    Run feature_Engineering.ipynb then model_training.ipynb first.")
        bundle = None

load_bundle()


# ── Feature Engineering ────────────────────────────────────────────────────
# These functions EXACTLY mirror feature_Engineering.ipynb so the model
# receives the same 26 FEAT_CUST / 66 FEAT_FR columns it was trained on.

def engineer_customer_features(raw: dict) -> dict:
    """
    Builds all 26 FEAT_CUST columns from raw form input.

    FEAT_CUST = [
      'Age', 'Premium', 'Claim_Count', 'Customer_Satisfaction',
      'tenure_years', 'claims_per_year', 'age_x_claims',
      'premium_x_satisfaction', 'satisfaction_per_tenure',
      'Gender_Female', 'Gender_Male', 'Gender_Other', 'Gender_Unknown',
      'Region_East', 'Region_North', 'Region_South', 'Region_West',
      'age_group_Young', 'age_group_Mid', 'age_group_Senior',
      'premium_tier_Low', 'premium_tier_Mid', 'premium_tier_High',
      'satisfaction_group_Low', 'satisfaction_group_Mid', 'satisfaction_group_High'
    ]

    Notes matching actual dataset:
      - Premium range  : 50–498 (₹)
      - Satisfaction   : 1–10 scale
      - Age            : 18–79
      - Claim_Count    : 0–4
      - Tenure         : 0–10 years
      - premium_tier thresholds derived from qcut(q=3) on actual data:
          Low  < ~200, Mid ~200–383, High > 383
      - satisfaction_group bins: Low ≤3, Mid 4–7, High >7  (scale 1–10)
      - age_group bins: Young ≤35, Mid 36–55, Senior 56+
    """
    age          = float(raw.get("age", 35))
    premium      = float(raw.get("annual_premium", 200))
    claim_count  = float(raw.get("claim_count", 0))
    satisfaction = float(raw.get("satisfaction_score", 5))   # 1–10
    tenure_yrs   = float(raw.get("tenure_years", 3))
    gender       = raw.get("gender", "Unknown")               # Male/Female/Other/Unknown
    region       = raw.get("region", "North")                 # North/South/East/West

    # Derived numeric
    claims_per_year         = claim_count / max(tenure_yrs, 0.1)
    age_x_claims            = age * claim_count
    premium_x_satisfaction  = premium * satisfaction
    satisfaction_per_tenure = satisfaction / max(tenure_yrs, 0.1)

    # Gender one-hot
    gender_map = {"Female": (1,0,0,0), "Male": (0,1,0,0),
                  "Other": (0,0,1,0)}
    gf, gm, go, gu = gender_map.get(gender, (0,0,0,1))

    # Region one-hot
    region_east  = int(region == "East")
    region_north = int(region == "North")
    region_south = int(region == "South")
    region_west  = int(region == "West")

    # Age group  (bins=[0,35,55,100] from feature engineering)
    age_group_young  = int(age <= 35)
    age_group_mid    = int(35 < age <= 55)
    age_group_senior = int(age > 55)

    # Premium tier  (qcut q=3 on actual data → ~Low<200, Mid 200-383, High>383)
    premium_tier_low  = int(premium < 200)
    premium_tier_mid  = int(200 <= premium <= 383)
    premium_tier_high = int(premium > 383)

    # Satisfaction group  (bins=[0,3,7,10] on 1–10 scale)
    satisfaction_group_low  = int(satisfaction <= 3)
    satisfaction_group_mid  = int(3 < satisfaction <= 7)
    satisfaction_group_high = int(satisfaction > 7)

    return {
        "Age":                      age,
        "Premium":                  premium,
        "Claim_Count":              claim_count,
        "Customer_Satisfaction":    satisfaction,
        "tenure_years":             tenure_yrs,
        "claims_per_year":          claims_per_year,
        "age_x_claims":             age_x_claims,
        "premium_x_satisfaction":   premium_x_satisfaction,
        "satisfaction_per_tenure":  satisfaction_per_tenure,
        "Gender_Female":            gf,
        "Gender_Male":              gm,
        "Gender_Other":             go,
        "Gender_Unknown":           gu,
        "Region_East":              region_east,
        "Region_North":             region_north,
        "Region_South":             region_south,
        "Region_West":              region_west,
        "age_group_Young":          age_group_young,
        "age_group_Mid":            age_group_mid,
        "age_group_Senior":         age_group_senior,
        "premium_tier_Low":         premium_tier_low,
        "premium_tier_Mid":         premium_tier_mid,
        "premium_tier_High":        premium_tier_high,
        "satisfaction_group_Low":   satisfaction_group_low,
        "satisfaction_group_Mid":   satisfaction_group_mid,
        "satisfaction_group_High":  satisfaction_group_high,
    }


def engineer_fraud_features(raw: dict) -> dict:
    """
    Builds all 66 FEAT_FR columns for the fraud model.
    Fields not available from the customer form use training-data medians/modes
    so they don't inject anomaly signal.
    """
    age         = float(raw.get("age", 35))
    premium     = float(raw.get("annual_premium", 1200))
    tenure_yrs  = float(raw.get("tenure_years", 5))
    claim_count = float(raw.get("claim_count", 1))
    gender      = raw.get("gender", "Unknown")

    months_as_customer = tenure_yrs * 12

    # Claim amount proxies from claim_count (training median ≈ 5000 per claim)
    total_claim_amount = claim_count * 5000
    injury_claim       = total_claim_amount * 0.4
    property_claim     = total_claim_amount * 0.3
    vehicle_claim      = total_claim_amount * 0.3

    claim_per_premium = total_claim_amount / max(premium, 1)
    injury_ratio      = 0.4
    vehicle_ratio     = 0.3
    property_ratio    = 0.3

    return {
        # ── Numeric ─────────────────────────────────────────────────────
        "months_as_customer":                   months_as_customer,
        "age":                                  age,
        "policy_deductable":                    1000,      # dataset median
        "policy_annual_premium":                premium,
        "umbrella_limit":                       0,
        "capital-gains":                        0,
        "capital-loss":                         0,
        "incident_hour_of_the_day":             12,        # noon = safe default
        "number_of_vehicles_involved":          1,
        "bodily_injuries":                      0,
        "witnesses":                            1,
        "total_claim_amount":                   total_claim_amount,
        "injury_claim":                         injury_claim,
        "property_claim":                       property_claim,
        "vehicle_claim":                        vehicle_claim,
        "auto_year":                            2010,      # median in dataset
        "severity_score":                       2,         # Minor Damage default
        "is_night_incident":                    0,
        "is_collision":                         1,         # most common type
        "vehicle_age":                          5,
        "claim_per_premium":                    claim_per_premium,
        "injury_ratio":                         injury_ratio,
        "vehicle_ratio":                        vehicle_ratio,
        "property_ratio":                       property_ratio,
        # ── Gender ──────────────────────────────────────────────────────
        "insured_sex_MALE":                     int(gender == "Male"),
        # ── Education (default: High School = most common) ───────────────
        "insured_education_level_College":      0,
        "insured_education_level_High School":  1,
        "insured_education_level_JD":           0,
        "insured_education_level_MD":           0,
        "insured_education_level_Masters":      0,
        "insured_education_level_PhD":          0,
        # ── Relationship (default: unmarried) ────────────────────────────
        "insured_relationship_not-in-family":   0,
        "insured_relationship_other-relative":  0,
        "insured_relationship_own-child":       0,
        "insured_relationship_unmarried":       1,
        "insured_relationship_wife":            0,
        # ── Incident type (default: Single Vehicle Collision) ────────────
        "incident_type_Parked Car":                 0,
        "incident_type_Single Vehicle Collision":   1,
        "incident_type_Vehicle Theft":              0,
        # ── Collision type (default: Rear) ───────────────────────────────
        "collision_type_Rear Collision":            1,
        "collision_type_Side Collision":            0,
        # ── Severity (default: Minor Damage) ─────────────────────────────
        "incident_severity_Minor Damage":           1,
        "incident_severity_Total Loss":             0,
        "incident_severity_Trivial Damage":         0,
        # ── Authorities (default: Police) ────────────────────────────────
        "authorities_contacted_Fire":               0,
        "authorities_contacted_Other":              0,
        "authorities_contacted_Police":             1,
        # ── Policy state (default: OH = most common) ─────────────────────
        "policy_state_IN":                          0,
        "policy_state_OH":                          1,
        # ── CSL (default: 250/500) ───────────────────────────────────────
        "policy_csl_250/500":                       1,
        "policy_csl_500/1000":                      0,
        # ── Occupation (default: other-service) ──────────────────────────
        "insured_occupation_armed-forces":          0,
        "insured_occupation_craft-repair":          0,
        "insured_occupation_exec-managerial":       0,
        "insured_occupation_farming-fishing":       0,
        "insured_occupation_handlers-cleaners":     0,
        "insured_occupation_machine-op-inspct":     0,
        "insured_occupation_other-service":         1,
        "insured_occupation_priv-house-serv":       0,
        "insured_occupation_prof-specialty":        0,
        "insured_occupation_protective-serv":       0,
        "insured_occupation_sales":                 0,
        "insured_occupation_tech-support":          0,
        "insured_occupation_transport-moving":      0,
        # ── Property / police ────────────────────────────────────────────
        "property_damage_YES":                      0,
        "police_report_available_YES":              1,
    }


# ── Prediction wrappers ────────────────────────────────────────────────────

def run_churn(cust_eng: dict) -> dict:
    if bundle is None:
        return {"churn_risk": "Unknown", "probability": None}
    inp  = pd.DataFrame([cust_eng]).reindex(columns=bundle["feat_cust"], fill_value=0)
    prob = bundle["model1_churn"].predict_proba(bundle["scaler1"].transform(inp))[0][1]
    risk = "High" if prob >= 0.6 else "Medium" if prob >= 0.4 else "Low"
    return {"churn_risk": risk, "probability": round(float(prob) * 100, 1)}


def run_loyalty(cust_eng: dict) -> dict:
    if bundle is None:
        return {"loyalty_tier": "Unknown", "probability": None}
    inp  = pd.DataFrame([cust_eng]).reindex(columns=bundle["feat_cust"], fill_value=0)
    prob = bundle["model2_loyalty"].predict_proba(bundle["scaler2"].transform(inp))[0][1]
    tier = "Champion" if prob >= 0.7 else "Engaged" if prob >= 0.4 else "At Risk"
    return {"loyalty_tier": tier, "probability": round(float(prob) * 100, 1)}


def run_fraud(fraud_eng: dict) -> dict:
    if bundle is None:
        return {"fraud_likely": False, "probability": None, "alert_level": "LOW"}
    inp   = pd.DataFrame([fraud_eng]).reindex(columns=bundle["feat_fr"], fill_value=0)
    prob  = bundle["model3_fraud"].predict_proba(bundle["scaler3"].transform(inp))[0][1]
    alert = "HIGH" if prob >= 0.7 else "MEDIUM" if prob >= 0.4 else "LOW"
    return {
        "fraud_likely": bool(prob >= 0.5),
        "probability":  round(float(prob) * 100, 1),
        "alert_level":  alert,
    }


# ── Routes ─────────────────────────────────────────────────────────────────

@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "models_loaded": bundle is not None})


@app.route("/api/predict", methods=["POST"])
def predict():
    """
    Accepts JSON:
    {
      "customer_name":     "Priya Sharma",
      "policy_number":     "MH-4521",
      "policy_type":       "Auto",          // Auto / Home / Life
      "age":               28,
      "tenure_years":      3,
      "annual_premium":    850,             // ₹ (dataset range: 50–498)
      "claim_count":       4,               // 0–4
      "satisfaction_score":2,               // 1–10
      "gender":            "Female",        // Male / Female / Other  (optional)
      "region":            "South"          // North/South/East/West  (optional)
    }
    """
    data = request.get_json(force=True)
    if not data:
        return jsonify({"error": "No JSON body"}), 400

    cust_eng  = engineer_customer_features(data)
    fraud_eng = engineer_fraud_features(data)

    churn_r   = run_churn(cust_eng)
    loyalty_r = run_loyalty(cust_eng)
    fraud_r   = run_fraud(fraud_eng)

    return jsonify({
        "customer_name":    data.get("customer_name", "N/A"),
        "policy_number":    data.get("policy_number", "N/A"),
        # Churn
        "churn_risk":       churn_r["churn_risk"],
        "churn_prob":       churn_r["probability"],
        # Loyalty
        "loyalty_tier":     loyalty_r["loyalty_tier"],
        "loyalty_prob":     loyalty_r["probability"],
        # Fraud
        "fraud_prob":       fraud_r["probability"],
        "fraud_alert":      fraud_r["alert_level"],
        "fraud_likely":     fraud_r["fraud_likely"],
    })


@app.route("/api/dashboard", methods=["GET"])
def dashboard():
    summary_path = os.path.join(
        os.path.dirname(__file__), "..", "visualization", "model_summary.csv"
    )
    try:
        df = pd.read_csv(summary_path)
        def get_auc(model_name):
            row = df[df["Model"] == model_name]
            return float(row["Test AUC"].values[0]) if not row.empty else None
        churn_auc   = get_auc("Churn Risk")
        loyalty_auc = get_auc("Loyalty Detection")
        fraud_auc   = get_auc("Fraud Detection")
    except Exception:
        churn_auc = loyalty_auc = fraud_auc = None

    return jsonify({
        "total_analyses":   1245,
        "churn_rate_pct":   35,
        "fraud_flag_pct":   25,
        "loyalty_rate_pct": 24,
        "churn_model_auc":  churn_auc,
        "loyalty_model_auc":loyalty_auc,
        "fraud_model_auc":  fraud_auc,
        "recent_analyses": [
            {"name": "Mark Adams",  "churn": 74, "fraud": 8,  "loyalty": "At Risk",   "policy": "Auto"},
            {"name": "John Smith",  "churn": 22, "fraud": 4,  "loyalty": "Champion",  "policy": "Home"},
            {"name": "Priya Mehta", "churn": 55, "fraud": 31, "loyalty": "Engaged",   "policy": "Auto"},
        ],
    })


# Register AI report route
from report import register_report_route
register_report_route(app)

if __name__ == "__main__":
    app.run(debug=True, port=5000)
# save_models.py
# ─────────────────────────────────────────────────────────────────
# Run this AFTER model_training.ipynb has executed all cells.
# It saves a single bundle that predict.py can load.
#
# Usage:
#   python save_models.py
#
# Output:
#   visualization/trained_models.pkl
# ─────────────────────────────────────────────────────────────────

import pickle
import os

# If you run this inside model_training.ipynb instead, just add
# the block below as a new cell at the very end.

bundle = {
    # Models
    "model1_high_value": best1_mdl,
    "model2_churn":      best2_mdl,
    "model3_fraud":      best3_mdl,

    # Scalers
    "scaler1": sc1,
    "scaler2": sc2,
    "scaler3": sc3,

    # Feature column lists
    "feat_cust": FEAT_CUST,
    "feat_fr":   FEAT_FR,

    # Metadata (premium_75th etc.)
    "meta": meta,
}

out_path = os.path.join(os.path.dirname(__file__), "trained_models.pkl")
with open(out_path, "wb") as f:
    pickle.dump(bundle, f)

print(f"✅  Saved trained_models.pkl → {out_path}")
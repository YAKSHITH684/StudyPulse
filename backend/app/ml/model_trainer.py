import os
import json
import joblib
import numpy as np
import pandas as pd
from xgboost import XGBClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    classification_report,
    roc_auc_score,
    confusion_matrix,
    brier_score_loss,
    precision_score,
    recall_score
)
from sklearn.calibration import calibration_curve
import shap

from .feature_engineering import FEATURE_COLUMNS

MODEL_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "data", "models")

class RiskModelTrainer:
    def __init__(self, model_version: str = "v1.0.0"):
        self.model_version = model_version
        self.model = None
        self.explainer = None
        self.feature_columns = FEATURE_COLUMNS
        self.metrics = {}
        os.makedirs(MODEL_DIR, exist_ok=True)

    def train(self, features_df: pd.DataFrame, test_size: float = 0.25, random_state: int = 42):
        """
        Trains an XGBoost classifier optimized for high-risk recall.
        We frame prediction as estimating risk probability where target is binary high/medium risk vs low risk,
        or multi-class with calibrated high-risk probability.
        For student dropout early-warning, binary or ordinal probability (At-Risk prob: 0.0 to 1.0)
        provides optimal calibration and direct SHAP tree-attribution.
        """
        X = features_df[self.feature_columns].copy()
        # Binary target: 1 if High or Medium risk (need intervention), 0 if Low risk
        # Also preserve high-risk specific label for recall evaluation
        y_binary = (features_df["ground_truth_risk"] >= 1).astype(int)
        y_high = (features_df["ground_truth_risk"] == 2).astype(int)

        X_train, X_test, y_train, y_test, y_high_train, y_high_test = train_test_split(
            X, y_binary, y_high, test_size=test_size, random_state=random_state, stratify=y_binary
        )

        # Calculate class weight to heavily penalize missing high-risk students (high-risk recall optimization)
        neg_count = (y_train == 0).sum()
        pos_count = (y_train == 1).sum()
        scale_pos = max(1.0, float(neg_count / max(1, pos_count)) * 1.3)

        self.model = XGBClassifier(
            n_estimators=120,
            max_depth=4,
            learning_rate=0.06,
            subsample=0.85,
            colsample_bytree=0.85,
            scale_pos_weight=scale_pos,
            eval_metric="logloss",
            random_state=random_state
        )

        self.model.fit(X_train, y_train)

        # Probabilities on test set
        test_probs = self.model.predict_proba(X_test)[:, 1]
        test_preds = (test_probs >= 0.40).astype(int)  # Tuned operating threshold for high recall

        # Model evaluation metrics according to Section 7:
        # Recall, Precision@Top-K, Calibration, ROC-AUC
        roc_auc = float(roc_auc_score(y_binary.iloc[X_test.index], test_probs))
        recall_overall = float(recall_score(y_test, test_preds, zero_division=0))
        precision_overall = float(precision_score(y_test, test_preds, zero_division=0))
        brier_loss = float(brier_score_loss(y_test, test_probs))

        # High-risk specific recall
        high_risk_test_preds = (test_probs >= 0.65).astype(int)
        high_risk_recall = float(recall_score(y_high_test, high_risk_test_preds, zero_division=0))

        # Precision@Top-K (e.g. Top 20% ranked students)
        k = max(1, int(len(test_probs) * 0.20))
        top_k_indices = np.argsort(test_probs)[::-1][:k]
        precision_at_k = float(y_test.iloc[top_k_indices].mean())

        # Calibration curve (fraction of positives vs mean predicted value)
        prob_true, prob_pred = calibration_curve(y_test, test_probs, n_bins=5, strategy='uniform')
        calibration_data = [
            {"bin": i + 1, "predicted_probability": round(float(p), 3), "actual_probability": round(float(t), 3)}
            for i, (p, t) in enumerate(zip(prob_pred, prob_true))
        ]

        # Confusion Matrix
        cm = confusion_matrix(y_test, test_preds).tolist()

        # SHAP Explainer
        self.explainer = shap.TreeExplainer(self.model)

        self.metrics = {
            "model_version": self.model_version,
            "training_samples": len(X_train),
            "test_samples": len(X_test),
            "roc_auc": round(roc_auc, 3),
            "recall": round(recall_overall, 3),
            "precision": round(precision_overall, 3),
            "high_risk_recall": round(high_risk_recall, 3),
            "precision_at_top_20": round(precision_at_k, 3),
            "brier_score": round(brier_loss, 3),
            "confusion_matrix": cm,
            "calibration_curve": calibration_data,
            "trained_at": pd.Timestamp.now().isoformat()
        }

        self.save_artifacts()
        return self.metrics

    def save_artifacts(self):
        """Saves model, explainer and metadata to disk."""
        model_path = os.path.join(MODEL_DIR, f"model_{self.model_version}.joblib")
        explainer_path = os.path.join(MODEL_DIR, f"explainer_{self.model_version}.joblib")
        metrics_path = os.path.join(MODEL_DIR, f"metrics_{self.model_version}.json")
        latest_meta_path = os.path.join(MODEL_DIR, "latest_model.json")

        joblib.dump(self.model, model_path)
        joblib.dump(self.explainer, explainer_path)

        with open(metrics_path, "w") as f:
            json.dump(self.metrics, f, indent=2)

        with open(latest_meta_path, "w") as f:
            json.dump({
                "model_version": self.model_version,
                "model_path": model_path,
                "explainer_path": explainer_path,
                "metrics": self.metrics
            }, f, indent=2)

        print(f"Model and explainer successfully saved to {MODEL_DIR}")

    @classmethod
    def load_latest(cls):
        """Loads latest saved model and explainer."""
        latest_meta_path = os.path.join(MODEL_DIR, "latest_model.json")
        if not os.path.exists(latest_meta_path):
            return None
        with open(latest_meta_path, "r") as f:
            meta = json.load(f)
        trainer = cls(model_version=meta["model_version"])
        trainer.model = joblib.load(meta["model_path"])
        trainer.explainer = joblib.load(meta["explainer_path"])
        trainer.metrics = meta.get("metrics", {})
        return trainer

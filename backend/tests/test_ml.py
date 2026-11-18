import pytest
import numpy as np
import pandas as pd
from app.ml.data_generator import generate_synthetic_school_data
from app.ml.feature_engineering import extract_student_features, FEATURE_COLUMNS
from app.ml.model_trainer import RiskModelTrainer
from app.ml.explainer import ShapExplainerService
from app.ml.simulator import simulate_what_if
from app.ml.interventions_rules import recommend_interventions

def test_data_generator_output():
    st_df, att_df, mk_df, bh_df, eng_df = generate_synthetic_school_data(num_students=30, num_weeks=8, seed=123)
    assert len(st_df) == 30
    assert len(att_df) > 0
    assert len(mk_df) > 0
    assert len(bh_df) > 0
    assert len(eng_df) > 0

def test_feature_engineering():
    st_df, att_df, mk_df, bh_df, eng_df = generate_synthetic_school_data(num_students=20, num_weeks=8, seed=42)
    features_df = extract_student_features(st_df, att_df, mk_df, bh_df, eng_df)
    assert len(features_df) == 20
    for col in FEATURE_COLUMNS:
        assert col in features_df.columns
        assert not features_df[col].isnull().any()

def test_model_training_and_metrics():
    st_df, att_df, mk_df, bh_df, eng_df = generate_synthetic_school_data(num_students=60, num_weeks=8, seed=42)
    features_df = extract_student_features(st_df, att_df, mk_df, bh_df, eng_df)
    trainer = RiskModelTrainer(model_version="test_v1")
    metrics = trainer.train(features_df)

    assert "recall" in metrics
    assert "high_risk_recall" in metrics
    assert "precision_at_top_20" in metrics
    assert "calibration_curve" in metrics
    assert len(metrics["calibration_curve"]) > 0

def test_shap_explainer_produces_exact_three_reasons():
    st_df, att_df, mk_df, bh_df, eng_df = generate_synthetic_school_data(num_students=40, num_weeks=8, seed=42)
    features_df = extract_student_features(st_df, att_df, mk_df, bh_df, eng_df)
    trainer = RiskModelTrainer(model_version="test_v2")
    trainer.train(features_df)

    explainer = ShapExplainerService(trainer.explainer, FEATURE_COLUMNS)
    sample_row = features_df.iloc[0]
    prob = 0.78
    tier = "High"

    reasons = explainer.explain_student(sample_row, prob, tier)
    assert len(reasons) == 3, "Spec requires EXACTLY three understandable contributing reasons"
    for r in reasons:
        assert "rank" in r
        assert "feature" in r
        assert "explanation" in r
        assert len(r["explanation"]) > 10

def test_what_if_simulator():
    st_df, att_df, mk_df, bh_df, eng_df = generate_synthetic_school_data(num_students=40, num_weeks=8, seed=42)
    features_df = extract_student_features(st_df, att_df, mk_df, bh_df, eng_df)
    trainer = RiskModelTrainer(model_version="test_v3")
    trainer.train(features_df)

    sample_row = features_df.iloc[0]
    result = simulate_what_if(
        trainer.model,
        sample_row,
        FEATURE_COLUMNS,
        {"attendance_delta": 15.0, "marks_delta": 10.0}
    )
    assert "baseline_probability" in result
    assert "simulated_probability" in result
    assert "risk_reduction_percentage" in result

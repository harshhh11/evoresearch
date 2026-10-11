# experiment.py — Executable Main Research Entrypoint
import time
from data import load_and_preprocess_data
from model import build_model_pipeline
from evaluate import evaluate_predictions

def main():
    print("=== EvolveX Executable Research Run ===")
    print(f"Experiment ID: 3d7190d6-d02a-4b3c-822d-475688881418")
    print(f"Domain: general_ai | Model: Ridge")
    
    t0 = time.time()
    X_train, X_val, y_train, y_val, features = load_and_preprocess_data("data.csv", target_col="bandgap_energy_ev")
    
    model = build_model_pipeline(model_family="Ridge", task_type="regression")
    model.fit(X_train, y_train)
    
    preds = model.predict(X_val)
    metrics = evaluate_predictions(y_val, preds, task_type="regression")
    
    duration = time.time() - t0
    print(f"Run Completed in {duration:.2f}s")
    print(f"Metrics: {metrics}")

if __name__ == "__main__":
    main()

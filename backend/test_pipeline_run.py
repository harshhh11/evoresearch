import urllib.request
import json

BASE_URL = "http://127.0.0.1:8000"

def run_test():
    # 1. Fetch datasets
    with urllib.request.urlopen(f"{BASE_URL}/api/datasets") as r:
        datasets = json.loads(r.read().decode("utf-8"))

    nomad_ds = next(d for d in datasets if "NOMAD" in d["name"])
    matbench_ds = next(d for d in datasets if "Matbench" in d["name"])

    with urllib.request.urlopen(f"{BASE_URL}/api/projects") as r:
        projects = json.loads(r.read().decode("utf-8"))
    project_id = projects[0]["id"]

    # 2. NOMAD 2018 Experiment
    print("=== RUNNING NOMAD 2018 EXPERIMENT (Task A1: bandgap_energy_ev) ===")
    exp_payload = {
        "project_id": project_id,
        "dataset_id": nomad_ds["id"],
        "name": "NOMAD Band Gap Regression Baseline",
        "target_column": "bandgap_energy_ev",
        "task_type": "regression",
        "model_family": "Ridge",
        "baseline_model": "DummyRegressor",
        "candidate_models": ["DummyRegressor", "Ridge", "RandomForestRegressor"],
        "cpu_budget_seconds": 180.0,
        "memory_mode": "baseline"
    }
    req = urllib.request.Request(
        f"{BASE_URL}/api/experiments",
        data=json.dumps(exp_payload).encode("utf-8"),
        headers={"Content-Type": "application/json"}
    )
    with urllib.request.urlopen(req) as r:
        exp_n = json.loads(r.read().decode("utf-8"))
    exp_n_id = exp_n["id"]
    print(f"Created Experiment ID: {exp_n_id}")

    req_start = urllib.request.Request(
        f"{BASE_URL}/api/experiments/{exp_n_id}/start",
        data=b"",
        headers={"Content-Type": "application/json"}
    )
    with urllib.request.urlopen(req_start) as r:
        start_res = json.loads(r.read().decode("utf-8"))
    print("Training finished:", start_res)

    with urllib.request.urlopen(f"{BASE_URL}/api/experiments/{exp_n_id}/metrics") as r:
        metrics = json.loads(r.read().decode("utf-8"))
    print(f"Metrics recorded ({len(metrics)} entries):")
    for m in metrics:
        print(f"  * {m['metric_name']}: {m['metric_value']} {m['metric_unit']}")

    with urllib.request.urlopen(f"{BASE_URL}/api/experiments/{exp_n_id}/resource-profile") as r:
        profiles = json.loads(r.read().decode("utf-8"))
    for p in profiles:
        print(f"Resource profile: Elapsed={p['elapsed_time_s']}s, Rows processed={p['rows_processed']}")

    # 3. Matbench Experiment
    print("\n=== RUNNING MATBENCH EXPERIMENT (Task B: gap expt) ===")
    mb_payload = {
        "project_id": project_id,
        "dataset_id": matbench_ds["id"],
        "name": "Matbench Experimental Band Gap Baseline",
        "target_column": "gap expt",
        "task_type": "regression",
        "model_family": "Ridge",
        "baseline_model": "DummyRegressor",
        "candidate_models": ["DummyRegressor", "Ridge", "RandomForestRegressor"],
        "cpu_budget_seconds": 180.0,
        "memory_mode": "baseline"
    }
    req_mb = urllib.request.Request(
        f"{BASE_URL}/api/experiments",
        data=json.dumps(mb_payload).encode("utf-8"),
        headers={"Content-Type": "application/json"}
    )
    with urllib.request.urlopen(req_mb) as r:
        exp_mb = json.loads(r.read().decode("utf-8"))
    exp_mb_id = exp_mb["id"]
    print(f"Created Matbench Experiment ID: {exp_mb_id}")

    req_mb_start = urllib.request.Request(
        f"{BASE_URL}/api/experiments/{exp_mb_id}/start",
        data=b"",
        headers={"Content-Type": "application/json"}
    )
    with urllib.request.urlopen(req_mb_start) as r:
        mb_start_res = json.loads(r.read().decode("utf-8"))
    print("Matbench training finished:", mb_start_res)

    with urllib.request.urlopen(f"{BASE_URL}/api/experiments/{exp_mb_id}/metrics") as r:
        mb_metrics = json.loads(r.read().decode("utf-8"))
    print(f"Matbench Metrics recorded ({len(mb_metrics)} entries):")
    for m in mb_metrics:
        print(f"  * {m['metric_name']}: {m['metric_value']} {m['metric_unit']}")

    # 4. Optuna Study on NOMAD
    print("\n=== RUNNING BOUNDED OPTUNA OPTIMIZATION ON NOMAD ===")
    opt_payload = {
        "experiment_id": exp_n_id,
        "model_name": "Ridge",
        "objective": "mae",
        "direction": "minimize",
        "total_trials": 8,
        "cpu_budget_seconds": 60.0,
        "memory_mode": "baseline"
    }
    req_opt = urllib.request.Request(
        f"{BASE_URL}/api/optimization/start",
        data=json.dumps(opt_payload).encode("utf-8"),
        headers={"Content-Type": "application/json"}
    )
    with urllib.request.urlopen(req_opt) as r:
        opt_res = json.loads(r.read().decode("utf-8"))
    print("Optuna study results:", opt_res)

    # 5. Scientific Evaluation (Condition A vs B vs C)
    print("\n=== RUNNING 3-CONDITION SCIENTIFIC EVALUATION ON NOMAD ===")
    eval_payload = {
        "project_id": project_id,
        "name": "Controlled 3-Condition Evaluation on NOMAD",
        "dataset_id": nomad_ds["id"],
        "cpu_budget_seconds": 30.0,
        "trials_per_condition": 6
    }
    req_eval = urllib.request.Request(
        f"{BASE_URL}/api/evaluations/run",
        data=json.dumps(eval_payload).encode("utf-8"),
        headers={"Content-Type": "application/json"}
    )
    with urllib.request.urlopen(req_eval) as r:
        eval_res = json.loads(r.read().decode("utf-8"))
    print("Condition A (Standard Optuna):", eval_res["condition_a"]["completion_rate"], "% completion")
    print("Condition B (Success-Only Memory):", eval_res["condition_b"]["completion_rate"], "% completion")
    print("Condition C (Failure-and-Recovery Memory):", eval_res["condition_c"]["completion_rate"], "% completion")
    print("Conclusion:", eval_res["conclusion"])

if __name__ == "__main__":
    run_test()

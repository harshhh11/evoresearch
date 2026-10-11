import sqlite3
import os

db_path = os.path.join(os.path.dirname(__file__), "evoresearch.db")
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

def add_col_if_missing(table, col, col_type):
    try:
        cursor.execute(f"PRAGMA table_info({table})")
        cols = [row[1] for row in cursor.fetchall()]
        if col not in cols:
            print(f"Adding {col} to {table}...")
            cursor.execute(f"ALTER TABLE {table} ADD COLUMN {col} {col_type}")
    except Exception as e:
        print(f"Error adding {col} to {table}: {e}")

# Projects columns
add_col_if_missing("projects", "domain", "VARCHAR(128) DEFAULT 'general_ai'")
add_col_if_missing("projects", "domain_metadata", "TEXT DEFAULT '{}'")

# Datasets columns
add_col_if_missing("datasets", "domain", "VARCHAR(128) DEFAULT 'general_ai'")
add_col_if_missing("datasets", "domain_metadata", "TEXT DEFAULT '{}'")
add_col_if_missing("datasets", "slug", "VARCHAR(255) DEFAULT ''")
add_col_if_missing("datasets", "source_name", "VARCHAR(255) DEFAULT ''")
add_col_if_missing("datasets", "source_url", "TEXT DEFAULT ''")
add_col_if_missing("datasets", "license_notes", "TEXT DEFAULT ''")
add_col_if_missing("datasets", "dataset_version", "VARCHAR(64) DEFAULT '1.0.0'")
add_col_if_missing("datasets", "clean_file_path", "VARCHAR(512) DEFAULT ''")
add_col_if_missing("datasets", "target_columns", "TEXT DEFAULT '[]'")
add_col_if_missing("datasets", "feature_schema", "TEXT DEFAULT '[]'")
add_col_if_missing("datasets", "missing_value_summary", "TEXT DEFAULT '{}'")
add_col_if_missing("datasets", "quality_report", "TEXT DEFAULT '{}'")
add_col_if_missing("datasets", "content_hash", "VARCHAR(64) DEFAULT ''")
add_col_if_missing("datasets", "status", "VARCHAR(64) DEFAULT 'ACTIVE'")
add_col_if_missing("datasets", "updated_at", "DATETIME")

# Experiments columns
add_col_if_missing("experiments", "domain", "VARCHAR(128) DEFAULT 'general_ai'")
add_col_if_missing("experiments", "domain_metadata", "TEXT DEFAULT '{}'")
add_col_if_missing("experiments", "execution_stage", "VARCHAR(64) DEFAULT 'DRAFT'")
add_col_if_missing("experiments", "paper_reference", "TEXT DEFAULT ''")
add_col_if_missing("experiments", "hypothesis", "TEXT DEFAULT ''")
add_col_if_missing("experiments", "research_question", "TEXT DEFAULT ''")
add_col_if_missing("experiments", "hardware_requirements", "TEXT DEFAULT '{}'")
add_col_if_missing("experiments", "compute_provider", "VARCHAR(128) DEFAULT 'local'")
add_col_if_missing("experiments", "reproducibility_status", "VARCHAR(64) DEFAULT 'REPRODUCIBLE'")
add_col_if_missing("experiments", "dataset_version_id", "VARCHAR(36)")
add_col_if_missing("experiments", "target_column", "VARCHAR(128) DEFAULT ''")
add_col_if_missing("experiments", "model_family", "VARCHAR(128) DEFAULT 'Ridge'")
add_col_if_missing("experiments", "optimization_method", "VARCHAR(64) DEFAULT 'optuna_tpe'")
add_col_if_missing("experiments", "memory_mode", "VARCHAR(64) DEFAULT 'baseline'")
add_col_if_missing("experiments", "split_strategy", "VARCHAR(64) DEFAULT 'holdout_train_val'")
add_col_if_missing("experiments", "started_at", "DATETIME")
add_col_if_missing("experiments", "completed_at", "DATETIME")

conn.commit()
conn.close()

from backend.database import engine, Base
import backend.models_db
Base.metadata.create_all(bind=engine)
print("Local SQLite migration applied successfully!")

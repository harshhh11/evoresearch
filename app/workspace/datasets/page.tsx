"use client";

import { useEffect, useState } from "react";
import { api, Dataset } from "@/lib/api";
import {
  Database,
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  Table,
  Eye,
  Info,
  Layers,
} from "lucide-react";

export default function DatasetsPage() {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [selectedDataset, setSelectedDataset] = useState<Dataset | null>(null);
  const [preview, setPreview] = useState<Record<string, any>[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [uploadModal, setUploadModal] = useState(false);

  // Upload form state
  const [uploadName, setUploadName] = useState("");
  const [uploadDesc, setUploadDesc] = useState("");
  const [uploadTarget, setUploadTarget] = useState("");
  const [uploadTask, setUploadTask] = useState("classification");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const loadDatasets = async () => {
    try {
      const list = await api.getDatasets();
      setDatasets(list);
      if (list.length && !selectedDataset) {
        loadPreview(list[0]);
      }
    } catch (err) {
      console.error("Failed to load datasets:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadPreview = async (ds: Dataset) => {
    setSelectedDataset(ds);
    setPreviewLoading(true);
    try {
      const res = await api.getDataset(ds.id);
      setPreview(res.preview);
    } catch (err) {
      console.error("Failed to load preview:", err);
    } finally {
      setPreviewLoading(false);
    }
  };

  useEffect(() => {
    loadDatasets();
  }, []);

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile || !uploadName) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", uploadFile);
      formData.append("name", uploadName);
      formData.append("description", uploadDesc);
      formData.append("target_col", uploadTarget);
      formData.append("task_type", uploadTask);

      const res = await fetch("/api/datasets/upload", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Upload failed");
      }
      const newDs = await res.json();
      setUploadModal(false);
      setUploadName("");
      setUploadDesc("");
      setUploadTarget("");
      setUploadFile(null);
      await loadDatasets();
      loadPreview(newDs);
    } catch (err: any) {
      alert(err.message || "Failed to upload dataset");
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: "60px 0", textAlign: "center", font: "400 12px var(--mono)", color: "#8c9c91" }}>
        INDEXING DATASET LIBRARY REPOSITORY...
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", borderBottom: "1px solid rgba(226, 239, 229, 0.08)", paddingBottom: 20 }}>
        <div>
          <div style={{ font: "500 10px/1 var(--mono)", color: "#B69A72", letterSpacing: "0.14em", marginBottom: 8 }}>
            DATA ARCHITECTURE // 004
          </div>
          <h1 style={{ margin: 0, font: "600 24px/1.2 var(--body)", color: "#F2F0E8" }}>
            Dataset Library & Schema Diagnostics
          </h1>
          <p style={{ margin: "6px 0 0", font: "400 12px/1.5 var(--body)", color: "#AAA99F" }}>
            Deterministic tabular benchmarks and uploaded datasets with immutable snapshots and leakage-free split profiles.
          </p>
        </div>

        <button
          onClick={() => setUploadModal(true)}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "9px 18px",
            background: "#B69A72",
            border: "1px solid #B69A72",
            color: "#101110",
            font: "600 10px/1 var(--mono)",
            letterSpacing: "0.08em",
            borderRadius: 3,
            cursor: "pointer"
          }}
        >
          <Upload size={13} />
          <span>UPLOAD CSV DATASET</span>
        </button>
      </div>

      {/* Dataset Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(290px, 1fr))", gap: 16 }}>
        {datasets.map((ds) => {
          const isSelected = selectedDataset?.id === ds.id;
          return (
            <div
              key={ds.id}
              onClick={() => loadPreview(ds)}
              className="research-card"
              style={{
                cursor: "pointer",
                borderColor: isSelected ? "#B69A72" : "rgba(226, 239, 229, 0.12)",
                background: isSelected ? "rgba(182, 154, 114, 0.04)" : "rgba(12, 18, 15, 0.65)"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                <span style={{ font: "600 12px var(--mono)", color: "#F2F0E8" }}>{ds.name}</span>
                <span className="status-tag status-tag--running">{ds.task_type.toUpperCase()}</span>
              </div>

              <p style={{ font: "400 11px/1.5 var(--body)", color: "#AAA99F", minHeight: 34, margin: "0 0 14px" }}>
                {ds.description || "No description provided."}
              </p>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, font: "400 10px var(--mono)", borderTop: "1px solid rgba(226, 239, 229, 0.06)", paddingTop: 10 }}>
                <span style={{ color: "#7e9084" }}>ROWS: <strong style={{ color: "#F2F0E8" }}>{ds.row_count}</strong></span>
                <span style={{ color: "#7e9084" }}>COLS: <strong style={{ color: "#F2F0E8" }}>{ds.col_count}</strong></span>
                <span style={{ color: "#7e9084" }}>TARGET: <strong style={{ color: "#a7e9e8" }}>{ds.target_col}</strong></span>
                <span style={{ color: "#B69A72", textAlign: "right" }}>{isSelected ? "ACTIVE INSPECTOR" : "SELECT →"}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Active Dataset Schema & Preview Inspector */}
      {selectedDataset && (
        <div className="research-card">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Eye size={15} color="#B69A72" />
              <span style={{ font: "600 12px var(--mono)", color: "#F2F0E8", letterSpacing: "0.06em" }}>
                SCHEMA INSPECTION // {selectedDataset.name.toUpperCase()}
              </span>
            </div>
            <span style={{ font: "400 9px var(--mono)", color: "#7e9084" }}>
              FIRST 10 SAMPLES PREVIEW
            </span>
          </div>

          {previewLoading ? (
            <div style={{ padding: "30px 0", textAlign: "center", font: "400 11px var(--mono)", color: "#7e9084" }}>
              STREAMING ROWS FROM STORAGE...
            </div>
          ) : preview.length === 0 ? (
            <div style={{ padding: "30px 0", textAlign: "center", font: "400 11px var(--mono)", color: "#7e9084" }}>
              Preview unavailable for this dataset.
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table className="mono-table">
                <thead>
                  <tr>
                    {Object.keys(preview[0]).map((col) => (
                      <th key={col} style={{ color: col === selectedDataset.target_col ? "#B69A72" : "#8c9c91" }}>
                        {col} {col === selectedDataset.target_col && "(TARGET)"}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {preview.map((row, idx) => (
                    <tr key={idx}>
                      {Object.entries(row).map(([k, val], cellIdx) => (
                        <td key={cellIdx} style={{ color: k === selectedDataset.target_col ? "#B69A72" : "#F2F0E8" }}>
                          {val !== null && val !== undefined ? String(val) : <em style={{ color: "#ff8b8b" }}>NaN</em>}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Upload CSV Modal */}
      {uploadModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0, 0, 0, 0.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, backdropFilter: "blur(8px)" }}>
          <div style={{ background: "#0a0e0c", border: "1px solid rgba(182, 154, 114, 0.2)", borderRadius: 4, padding: 32, maxWidth: 520, width: "90%" }}>
            <h2 style={{ margin: "0 0 16px", font: "600 18px var(--body)", color: "#F2F0E8" }}>Upload CSV Dataset</h2>
            <form onSubmit={handleUploadSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={{ display: "block", font: "500 10px var(--mono)", color: "#7e9084", marginBottom: 6 }}>
                  DATASET NAME
                </label>
                <input
                  type="text"
                  required
                  value={uploadName}
                  onChange={(e) => setUploadName(e.target.value)}
                  placeholder="e.g. Microcontroller Battery Degradation"
                  style={{ width: "100%", padding: "10px 12px", background: "#101110", border: "1px solid rgba(226, 239, 229, 0.15)", borderRadius: 3, color: "#F2F0E8", font: "400 12px var(--mono)" }}
                />
              </div>

              <div>
                <label style={{ display: "block", font: "500 10px var(--mono)", color: "#7e9084", marginBottom: 6 }}>
                  DESCRIPTION
                </label>
                <textarea
                  rows={2}
                  value={uploadDesc}
                  onChange={(e) => setUploadDesc(e.target.value)}
                  placeholder="Edge IoT sensory telemetry..."
                  style={{ width: "100%", padding: "10px 12px", background: "#101110", border: "1px solid rgba(226, 239, 229, 0.15)", borderRadius: 3, color: "#F2F0E8", font: "400 12px var(--body)" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div>
                  <label style={{ display: "block", font: "500 10px var(--mono)", color: "#7e9084", marginBottom: 6 }}>
                    TARGET COLUMN
                  </label>
                  <input
                    type="text"
                    required
                    value={uploadTarget}
                    onChange={(e) => setUploadTarget(e.target.value)}
                    placeholder="e.g. status or target"
                    style={{ width: "100%", padding: "10px 12px", background: "#101110", border: "1px solid rgba(226, 239, 229, 0.15)", borderRadius: 3, color: "#F2F0E8", font: "400 12px var(--mono)" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", font: "500 10px var(--mono)", color: "#7e9084", marginBottom: 6 }}>
                    TASK TYPE
                  </label>
                  <select
                    value={uploadTask}
                    onChange={(e) => setUploadTask(e.target.value)}
                    style={{ width: "100%", padding: "10px 12px", background: "#101110", border: "1px solid rgba(226, 239, 229, 0.15)", borderRadius: 3, color: "#F2F0E8", font: "400 12px var(--mono)" }}
                  >
                    <option value="classification">Classification</option>
                    <option value="regression">Regression</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: "block", font: "500 10px var(--mono)", color: "#7e9084", marginBottom: 6 }}>
                  CSV FILE
                </label>
                <input
                  type="file"
                  accept=".csv"
                  required
                  onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                  style={{ width: "100%", color: "#AAA99F", font: "400 11px var(--mono)" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 12 }}>
                <button
                  type="button"
                  onClick={() => setUploadModal(false)}
                  style={{ padding: "8px 16px", background: "transparent", border: "1px solid rgba(226, 239, 229, 0.15)", color: "#AAA99F", borderRadius: 3, cursor: "pointer", font: "500 10px var(--mono)" }}
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  style={{ padding: "8px 18px", background: "#B69A72", border: "none", color: "#101110", borderRadius: 3, cursor: "pointer", font: "600 10px var(--mono)" }}
                >
                  {uploading ? "UPLOADING..." : "UPLOAD DATASET"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

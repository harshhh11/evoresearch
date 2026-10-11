"use client";

import { useEffect, useState } from "react";
import { api, ResearchPaper } from "@/lib/api";
import {
  BookOpen,
  ExternalLink,
  Search,
  Sparkles,
  Tag,
  FileText,
  Bookmark,
  Cpu,
} from "lucide-react";

export default function PapersPage() {
  const [papers, setPapers] = useState<ResearchPaper[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [paperInput, setPaperInput] = useState("");
  const [parsing, setParsing] = useState(false);
  const [parsedSpec, setParsedSpec] = useState<any>(null);
  const [computeRoute, setComputeRoute] = useState<any>(null);

  useEffect(() => {
    async function load() {
      try {
        const list = await api.getPapers();
        setPapers(list);
      } catch (err) {
        console.error("Failed to load papers:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="py-16 text-center font-mono text-[12px] text-[#68766D]">
        FETCHING SCIENTIFIC LITERATURE CORPUS...
      </div>
    );
  }

  const filtered = papers.filter((p) => {
    return (
      !search ||
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.authors.toLowerCase().includes(search.toLowerCase()) ||
      p.problem.toLowerCase().includes(search.toLowerCase()) ||
      p.abstract.toLowerCase().includes(search.toLowerCase())
    );
  });

  const handleParseAndRoute = async () => {
    if (!paperInput.trim()) return;
    setParsing(true);
    try {
      const spec = await api.parsePaper({ paper_text: paperInput });
      setParsedSpec(spec);

      const route = await api.routeCompute({
        domain: spec.domain,
        sample_count: 50000,
        model_family: spec.proposed_models[0] || "MobileNetV2",
        execution_strategy: "Hybrid",
        cpu_budget_seconds: 180.0
      });
      setComputeRoute(route);
    } catch (err) {
      console.error("Paper parse or compute route failed:", err);
    } finally {
      setParsing(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-[1500px] mx-auto text-[#26352D] pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#DFE5DC]">
        <div>
          <div className="font-mono text-[10.5px] text-[#176B4D] uppercase tracking-[0.14em] font-semibold mb-1">
            SCIENTIFIC GROUNDING & RESEARCH INTAKE
          </div>
          <h1 className="font-serif text-[28px] sm:text-[32px] font-bold text-[#26352D] tracking-[-0.01em] m-0">
            Research Papers & Theoretical Foundations
          </h1>
          <p className="font-sans text-[13.5px] text-[#68766D] mt-1 m-0 max-w-[720px]">
            Curated literature in edge ML, multi-fidelity resource allocation, hyperparameter optimization, and automated failure recovery.
          </p>
        </div>

        <div className="relative w-full sm:w-[260px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#68766D]" />
          <input
            type="text"
            placeholder="Search literature corpus..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-[36px] pl-9 pr-3 bg-[#FFFFFF] border border-[#DFE5DC] rounded-[8px] text-[12.5px] text-[#26352D] placeholder-[#68766D] focus:outline-none focus:border-[#176B4D] font-sans"
          />
        </div>
      </div>

      {/* AI Paper Intake & Automated Compute Router Panel */}
      <div className="p-5 rounded-[12px] bg-[#FFFFFF] border border-[#DFE5DC] flex flex-col gap-3.5 shadow-xs">
        <div className="flex items-center justify-between border-b border-[#DFE5DC] pb-2.5">
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-[#176B4D]" />
            <span className="font-serif text-[16px] font-bold text-[#26352D]">
              AI Paper Intake & Kaggle Compute Router
            </span>
          </div>
          <span className="font-mono text-[11px] font-semibold text-[#176B4D] bg-[#E8F5EC] border border-[rgba(23,107,77,0.3)] px-2.5 py-1 rounded-[6px]">
            Kaggle API Token: Active
          </span>
        </div>

        <textarea
          rows={3}
          placeholder="Paste research paper abstract, methodology, or model details here to extract spec & compute route..."
          value={paperInput}
          onChange={(e) => setPaperInput(e.target.value)}
          className="w-full bg-[#F8F6EF] border border-[#DFE5DC] rounded-[8px] p-3 text-[13px] text-[#26352D] placeholder-[#68766D] focus:outline-none focus:border-[#176B4D] font-sans"
        />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <span className="text-[12px] text-[#68766D] font-sans">
            Extracts domain spec, identifies local GPU bottlenecks & routes heavy workloads to Kaggle API.
          </span>
          <button
            type="button"
            onClick={handleParseAndRoute}
            disabled={parsing || !paperInput.trim()}
            className="px-4 py-2 rounded-[8px] bg-[#176B4D] hover:bg-[#12543C] text-[#FFFFFF] font-mono text-[11.5px] font-semibold transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 shadow-xs shrink-0"
          >
            <Sparkles size={14} />
            <span>{parsing ? "EXTRACTING & ROUTING..." : "PARSE PAPER & ROUTE COMPUTE"}</span>
          </button>
        </div>

        {/* Extracted Specification & Compute Route Result */}
        {parsedSpec && (
          <div className="mt-2 pt-3 border-t border-[#DFE5DC] flex flex-col gap-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3.5 rounded-[8px] bg-[#F8F6EF] border border-[#DFE5DC]">
                <div className="font-mono text-[10.5px] text-[#176B4D] font-bold mb-1 uppercase">EXTRACTED RESEARCH SPEC</div>
                <div className="font-serif text-[15px] font-bold text-[#26352D] mb-1">{parsedSpec.title}</div>
                <div className="font-mono text-[11px] text-[#176B4D] font-semibold mb-1">Domain: {parsedSpec.domain}</div>
                <div className="font-sans text-[12.5px] text-[#68766D]">{parsedSpec.research_objective}</div>
              </div>

              {computeRoute && (
                <div className="p-3.5 rounded-[8px] bg-[#E8F5EC] border border-[rgba(23,107,77,0.3)]">
                  <div className="font-mono text-[10.5px] text-[#176B4D] font-bold mb-1 uppercase">RECOMMENDED COMPUTE ROUTE</div>
                  <div className="font-serif text-[15px] font-bold text-[#176B4D] mb-1">
                    {computeRoute.recommended_provider}
                  </div>
                  <div className="font-mono text-[11.5px] text-[#26352D] mb-2.5">
                    Est. RAM: {computeRoute.estimated_resource_usage?.estimated_ram_mb} MB | Budget: {computeRoute.estimated_resource_usage?.cpu_budget_seconds}s
                  </div>
                  <div>
                    <a
                      href={`/api/compute/download-notebook/exp_paper_spec`}
                      download
                      className="px-3 py-1.5 rounded-[6px] bg-[#176B4D] text-[#FFFFFF] font-mono text-[11px] font-semibold inline-flex items-center gap-1.5 hover:bg-[#12543C] transition-all"
                    >
                      <FileText size={13} />
                      <span>DOWNLOAD KAGGLE NOTEBOOK (.ipynb)</span>
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Papers Stream */}
      <div className="flex flex-col gap-4">
        {filtered.map((p) => {
          let tagList: string[] = [];
          try {
            tagList = JSON.parse(p.tags || "[]");
          } catch {}

          return (
            <div key={p.id} className="p-5 rounded-[12px] bg-[#FFFFFF] border border-[#DFE5DC] flex flex-col gap-3 shadow-xs">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-serif text-[17px] font-bold text-[#26352D] m-0 leading-snug">
                    {p.title}
                  </h2>
                  <div className="font-mono text-[11.5px] text-[#68766D] mt-1">
                    {p.authors} ({p.year}) — <span className="text-[#176B4D] font-semibold">{p.venue}</span>
                  </div>
                </div>

                {p.doi_url && (
                  <a
                    href={p.doi_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] bg-[#F8F6EF] border border-[#DFE5DC] text-[#176B4D] hover:bg-[#E6F0E9] font-mono text-[10.5px] font-semibold transition-all shrink-0"
                  >
                    <span>OPEN DOI</span>
                    <ExternalLink size={12} />
                  </a>
                )}
              </div>

              <p className="font-sans text-[13px] text-[#68766D] m-0 leading-relaxed">
                {p.abstract}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3.5 rounded-[8px] bg-[#F8F6EF] border border-[#DFE5DC]">
                <div>
                  <div className="font-mono text-[10px] text-[#68766D] uppercase font-semibold mb-0.5">RESEARCH PROBLEM:</div>
                  <div className="font-sans text-[12.5px] text-[#26352D] font-medium">{p.problem}</div>
                </div>
                <div>
                  <div className="font-mono text-[10px] text-[#68766D] uppercase font-semibold mb-0.5">PROPOSED METHOD:</div>
                  <div className="font-sans text-[12.5px] text-[#26352D] font-medium">{p.method}</div>
                </div>
                <div>
                  <div className="font-mono text-[10px] text-[#176B4D] uppercase font-semibold mb-0.5">CORE FINDINGS:</div>
                  <div className="font-sans text-[12.5px] text-[#176B4D] font-semibold">{p.findings}</div>
                </div>
                <div>
                  <div className="font-mono text-[10px] text-[#B54747] uppercase font-semibold mb-0.5">LIMITATIONS:</div>
                  <div className="font-sans text-[12.5px] text-[#B54747] font-medium">{p.limitations}</div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-[#DFE5DC]">
                <div className="font-mono text-[11.5px] text-[#176B4D] font-medium">
                  <strong>RELEVANCE TO EVORESEARCH:</strong> {p.relevance_to_evoresearch}
                </div>

                <div className="flex gap-1.5">
                  {tagList.map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-0.5 rounded-[5px] bg-[#F8F6EF] border border-[#DFE5DC] font-mono text-[10px] text-[#68766D]"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

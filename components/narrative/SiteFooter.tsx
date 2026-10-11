import Link from "next/link";

const navLinks = [
  { label: "Product", href: "#overview" },
  { label: "Capabilities", href: "#capabilities" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Experiments", href: "/workspace/experiments" },
  { label: "Datasets", href: "/workspace/datasets" },
  { label: "System Status", href: "/workspace/status" },
];

export function SiteFooter() {
  return (
    <footer className="site-footer" style={{ background: "#FFFFFF", borderTop: "1px solid #DFE5DC", padding: "40px 24px 24px", marginTop: 60 }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", flexDirection: "column", gap: 32 }}>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-start", gap: 24 }}>
          <div>
            <div style={{ font: "700 18px var(--font-primary), serif", color: "#176B4D", marginBottom: 6 }}>
              EvolveX
            </div>
            <div style={{ font: "400 13px var(--font-primary), serif", color: "#68766D", maxWidth: 360 }}>
              An AI-powered research & experimentation environment that transforms research questions into reproducible experiments through intelligent agent orchestration.
            </div>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 40 }}>
            <div>
              <div style={{ font: "600 11px var(--mono)", color: "#176B4D", marginBottom: 10, letterSpacing: "0.08em" }}>NAVIGATION</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {navLinks.map((item) => (
                  <a key={item.label} href={item.href} style={{ font: "400 12px var(--font-primary), serif", color: "#26352D", textDecoration: "none" }}>
                    {item.label}
                  </a>
                ))}
              </div>
            </div>

            <div>
              <div style={{ font: "600 11px var(--mono)", color: "#176B4D", marginBottom: 10, letterSpacing: "0.08em" }}>RESEARCH WORKSPACE</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <Link href="/workspace/experiments/new" style={{ font: "400 12px var(--font-primary), serif", color: "#26352D", textDecoration: "none" }}>
                  Start New Experiment
                </Link>
                <Link href="/workspace/knowledge-graph" style={{ font: "400 12px var(--font-primary), serif", color: "#26352D", textDecoration: "none" }}>
                  Knowledge Graph
                </Link>
                <Link href="/workspace/analytics" style={{ font: "400 12px var(--font-primary), serif", color: "#26352D", textDecoration: "none" }}>
                  Analytics Dashboard
                </Link>
                <Link href="/workspace/reports" style={{ font: "400 12px var(--font-primary), serif", color: "#26352D", textDecoration: "none" }}>
                  Scientific Reports
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #DFE5DC", paddingTop: 16, font: "400 11px var(--mono)", color: "#68766D" }}>
          <span>© {new Date().getFullYear()} EVOLVEX RESEARCH PLATFORM · LIGHT THEME</span>
          <span>CLOSED-LOOP MULTI-AGENT EXECUTION ENGINE</span>
        </div>
      </div>
    </footer>
  );
}

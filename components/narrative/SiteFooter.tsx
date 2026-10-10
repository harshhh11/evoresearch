const destinations = [
  { label: "Overview", href: "#overview" },
  { label: "Research Methodology", href: "#methodology" },
  { label: "Experiments", href: "#experiments" },
  { label: "Documentation", href: "#evidence" },
];

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-topline"><span>EVORESEARCH / RESEARCH SYSTEM 001</span><span>AN ENVIRONMENT FOR WHAT COMES NEXT</span></div>
      <div className="footer-bottomline">
        <nav aria-label="Footer navigation" className="footer-links">
          {destinations.map((item) => <a key={item.label} href={item.href}>{item.label}</a>)}
          <span title="No public team destination is configured">Team</span>
          <span title="No repository URL is configured">GitHub</span>
        </nav>
        <span className="footer-note">ILLUSTRATIVE INTERFACE · NO LIVE EXPERIMENT DATA</span>
      </div>
    </footer>
  );
}

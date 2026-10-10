import { motion } from "framer-motion";

export function HeroSection() {
  return (
    <section className="hero-section scene-stage scene-stage--hero" id="overview" data-scene data-mode="unknown" aria-labelledby="hero-title">
      <div className="hero-identity">
        <span>EVOLVEX — AN EVOLVING AI RESEARCH ENVIRONMENT</span>
        <span>DJSCE ELEVATE 1.0 / PS-03</span>
      </div>
      <div className="hero-copy scene-copy">
        <span className="scene-eyebrow"><span>01 / 07</span><i aria-hidden="true" />CLOSED-LOOP RESEARCH</span>
        <h1 className="hero-headline" id="hero-title">
          <span>RESEARCH THAT</span>
          <span>LEARNS FROM</span>
          <span>EVERY EXPERIMENT.</span>
        </h1>
        <p className="hero-description">An adaptive AI research environment for materials science.<br className="desktop-break" /> Transforming experimental failure into persistent knowledge to guide better subsequent trials.</p>
        <div className="hero-actions">
          <motion.a className="button button--primary" href="/workspace" whileHover={{ x: 3 }} whileTap={{ scale: 0.985 }}>
            OPEN RESEARCH WORKSPACE <span aria-hidden="true">↗</span>
          </motion.a>
          <a className="button button--quiet" href="/workspace/evolution">EXPLORE THE WORKFLOW <span aria-hidden="true">→</span></a>
        </div>
      </div>
      <div className="hero-bottomline"><span>EVOLVEX</span><span>RESEARCH INPUT → REASONING → EXECUTION → MEMORY</span><span>SCROLL TO BEGIN <i aria-hidden="true">↓</i></span></div>
      <div className="hero-coordinate" aria-hidden="true"><span>48° 51′ 24.0″ N</span><span>FIELD / OPEN</span></div>
    </section>
  );
}

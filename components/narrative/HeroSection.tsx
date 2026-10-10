import { motion } from "framer-motion";

export function HeroSection() {
  return (
    <section className="hero-section scene-stage scene-stage--hero" id="overview" data-scene data-mode="unknown" aria-labelledby="hero-title">
      <div className="hero-identity">
        <span>AN EVOLVING AI RESEARCH ENVIRONMENT</span>
        <span>RESEARCH SYSTEM / 001</span>
      </div>
      <div className="hero-copy scene-copy">
        <span className="scene-eyebrow"><span>01 / 07</span><i aria-hidden="true" />THE UNKNOWN</span>
        <h1 className="hero-headline" id="hero-title">
          <span>RESEARCH</span>
          <span>DOESN’T END</span>
          <span>AT THE FIRST RUN.</span>
        </h1>
        <p className="hero-description">Every experiment leaves behind a question.<br className="desktop-break" /> Every failure leaves behind evidence.</p>
        <div className="hero-actions">
          <motion.a className="button button--primary" href="#workspace" whileHover={{ x: 3 }} whileTap={{ scale: 0.985 }}>
            ENTER THE WORKSPACE <span aria-hidden="true">↗</span>
          </motion.a>
          <a className="button button--quiet" href="#methodology">EXPLORE THE SYSTEM <span aria-hidden="true">↓</span></a>
        </div>
      </div>
      <div className="hero-bottomline"><span>EVORESEARCH</span><span>TRACE THE RUN / TRACE THE REASON</span><span>SCROLL TO BEGIN <i aria-hidden="true">↓</i></span></div>
      <div className="hero-coordinate" aria-hidden="true"><span>48° 51′ 24.0″ N</span><span>FIELD / OPEN</span></div>
    </section>
  );
}

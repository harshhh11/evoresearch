import type { ResearchScene } from "@/lib/research-scenes";

type ResearchNarrativeSectionProps = {
  scene: ResearchScene;
  index: number;
};

function Headline({ text, id }: { text: string; id: string }) {
  return (
    <h2 className="scene-headline" id={id}>
      {text.split("\n").map((line) => <span key={line}>{line}</span>)}
    </h2>
  );
}

function SceneDetail({ mode }: { mode: ResearchScene["mode"] }) {
  if (mode === "pathways") {
    return (
      <div className="process-rail" aria-label="Question to plan to execution">
        {["QUESTION", "PLAN", "EXECUTION"].map((item, index) => (
          <div className="process-step" key={item}>
            <span className="process-index">0{index + 1}</span><span>{item}</span>
            {index < 2 && <i aria-hidden="true">→</i>}
          </div>
        ))}
      </div>
    );
  }

  if (mode === "evidence") {
    return (
      <div className="record-stack" aria-label="Illustrative experiment record">
        <div className="record-panel record-panel--back"><span>DATASET / VERSIONED</span><i /></div>
        <div className="record-panel record-panel--front">
          <div className="record-heading"><span>RUN RECORD</span><span>DEMO DATA</span></div>
          <div className="record-id">EXP–0042 <span>·</span> REPRODUCIBLE</div>
          <div className="record-row"><span>CONFIGURATION</span><b>LOCKED</b></div>
          <div className="record-row"><span>CODE VERSION</span><b>TRACEABLE</b></div>
          <div className="record-row"><span>EXECUTION LOG</span><b>RETAINED</b></div>
        </div>
      </div>
    );
  }

  if (mode === "recovery") {
    return (
      <div className="recovery-example">
        <div className="recovery-title"><span>ILLUSTRATIVE RECORD</span><span>DEMO DATA</span></div>
        <div className="recovery-flow">
          <div><span>ERROR</span><p>Missing-value preprocessing</p></div>
          <div><span>REPAIR</span><p>Apply validated imputation</p></div>
          <div><span>OUTCOME</span><p>Re-run passed validation</p></div>
        </div>
      </div>
    );
  }

  if (mode === "budget") {
    return (
      <div className="candidate-list">
        <div className="candidate-heading"><span>TRIAL COMPARISON</span><span>ILLUSTRATIVE ALLOCATION / DEMO DATA</span></div>
        {["CANDIDATE 01", "CANDIDATE 02", "CANDIDATE 03"].map((candidate, index) => (
          <div className={`candidate-row candidate-row--${index + 1}`} key={candidate}>
            <span>{candidate}</span><div className="candidate-track"><i /></div><span>CPU-TIME</span>
          </div>
        ))}
      </div>
    );
  }

  if (mode === "collaboration") {
    return (
      <div className="collaboration-note">
        <span className="collab-node collab-node--one" />
        <span className="collab-node collab-node--two" />
        <span className="collab-node collab-node--three" />
        <span className="collab-link" />
        <span>ISOLATED RUNS <b>→</b> SHARED EVIDENCE</span>
      </div>
    );
  }

  return null;
}

export function ResearchNarrativeSection({ scene, index }: ResearchNarrativeSectionProps) {
  return (
    <section className={`scene-stage scene-stage--${scene.mode}`} id={scene.id} data-scene data-mode={scene.mode} aria-labelledby={`scene-title-${index}`}>
      <div className="scene-copy">
        <div className="scene-eyebrow"><span>{String(index + 1).padStart(2, "0")} / 07</span><i aria-hidden="true" />{scene.eyebrow}</div>
        <Headline text={scene.title} id={`scene-title-${index}`} />
        <p className="scene-description">{scene.description}</p>
        <SceneDetail mode={scene.mode} />
        <div className="scene-labels" aria-label="Research concepts">
          {scene.labels.map((label, labelIndex) => (
            <span key={label}><i aria-hidden="true">{String(labelIndex + 1).padStart(2, "0")}</i>{label}</span>
          ))}
        </div>
      </div>
      <span className="scene-index-ghost" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
    </section>
  );
}

# EvoResearch website implementation plan

## Product scope and delivery

Build the requested seven-stage, responsive EvoResearch landing page as an original, cinematic AI research environment. The new managed workspace is empty; preserve the user-requested stack: Next.js App Router, React, TypeScript, Three.js through React Three Fiber and drei, GSAP ScrollTrigger, Tailwind CSS, and Framer Motion for restrained interface transitions. This is a frontend-only demo: do not invent an API, production workspace, actual experiment counts, benchmarks, or measured CPU state. Label sample interface records/status as illustrative demo content. Use in-page destinations for navigation and do not fabricate external links.

## Design direction

- **Design movement:** cinematic digital-science editorialism, drawing on the supplied Flora reference's darkness, restraint, starfield depth, suspended focal glow, fine connecting filament, and continuous scroll composition while giving EvoResearch an original scientific identity. Translate the lone botanical-looking light into a dark-centered, branching research structure; do not recreate a flower, dandelion, or stem.
- **Core principles:** evidence before spectacle; one evolving visual rather than seven disconnected scenes; precise editorial hierarchy; restrained, legible motion.
- **Color philosophy:** near-black `#050706` gives the Research Core room to emerge, with a barely-there midnight-blue atmospheric falloff and restrained star-like points informed by the supplied screenshot; soft white `#E8EDE8` keeps long-form copy calm and readable; pale green `#B5FF8A` marks active knowledge and is the signature brand color; muted cyan and silver encode structure/depth, with rare warm-gold details. Keep panels translucent and borders quiet; avoid purple/neon gradients.
- **Layout paradigm:** a long, nearly full-viewport narrative with a persistent, sticky WebGL canvas and carefully placed asymmetric text compositions. Like the supplied reference's visual hierarchy, place a restrained oversized headline opposite a suspended focal glow; reinterpret its thin descending thread as multiple fine branching research filaments. Compact floating navigation and technical annotations frame, rather than compete with, the central sculpture; sections are narrative beats, not card-grid pages.
- **Signature elements:** (1) a dark-centered procedural Research Core with filaments and drifting evidence points; (2) fine registration lines, section indices and monospaced research metadata; (3) a small geometric aperture/branching mark echoed in navigation and transitions.
- **Interaction philosophy:** scrolling is the camera path through one scientific object; pointer movement is a subtle secondary influence; CTAs and nav move to meaningful in-page destinations where no real app endpoint is configured.
- **Animation:** map the seven story beats to one stable GSAP ScrollTrigger timeline. Animate a shared progress value and camera/scene parameters; pass scene uniforms through R3F's `useFrame` loop without per-frame React state. Keep deterministic BufferGeometry as the base, then use GPU vertex shaders to morph both spherical particles and branching filaments through pathways, evidence layers, diagnostics/recovery, candidate networks, collaboration, and a settled final state. Use slow idle motion and subtle pointer parallax, restrained text reveals, no flashes or shake, and honor `prefers-reduced-motion`. A separate `gsap.matchMedia` path keeps current-section status updated while freezing scene geometry/camera and removing reveals. Lower quality at the 720px mobile breakpoint, on low-powered devices, and when motion is reduced; recalculate on resize/preference changes.
- **Typography system:** pair a geometric editorial display face (Space Grotesk) with a highly readable sans face (Inter) and a monospace face (IBM Plex Mono) for statuses, stage labels, IDs and metadata; use responsive clamp-based display sizing, deliberate line breaks and generous spacing.
- **Brand essence:** an evolving research environment for ML researchers who need experiments to be reproducible, resource-aware, and informed by prior evidence; **curious, rigorous, connective**.
- **Brand voice:** concise, evidence-minded statements with confident restraint; examples: “Every experiment leaves behind a question.” and “Failure is data. Recovery is knowledge.”
- **Wordmark & logo:** EVORESEARCH wordmark beside a small custom geometric branching aperture, a split circular orbit with an open gap and three connected nodes; use the same original mark for the floating navigation and project identity.
- **Signature brand color:** luminous pale green `#B5FF8A`.

## Implementation and project structure

- `app/layout.tsx`: document metadata, global font variables, and shared page shell.
- `app/page.tsx`: composed landing-page route and section anchors.
- `app/globals.css`: Tailwind directives/utilities plus editorial layout, dark atmosphere, responsive and reduced-motion rules.
- `components/navigation/FloatingNavigation.tsx`: wordmark/mark, compact section links, demo-only system status and workspace CTA.
- `components/narrative/ResearchNarrative.tsx`: the seven narrative beats, headings, copy, labels, example diagnostics, resource-comparison illustration, final CTA and minimal footer.
- `components/scene/CinematicCanvas.tsx`: client-only responsive R3F Canvas, camera, lighting and graceful WebGL fallback.
- `components/scene/ResearchCore.tsx`: orchestrate the persistent camera, scene lighting, particle core and diagnostic signal.
- `components/scene/ParticleField.tsx`: create the deterministic spherical particle field and stage-aware GPU deformation; dispose geometries/materials.
- `components/scene/FilamentField.tsx`: build one branching BufferGeometry with per-vertex path metadata and GPU morphs for the research stages, plus the surrounding starfield.
- `components/scene/ScrollSceneController.tsx`: use GSAP/ScrollTrigger and `gsap.matchMedia` to synchronize scene progress, current-section status, text reveals, pointer input, reduced-motion handling and cleanup.
- `components/scene/useLowPowerRendering.ts`: share the 720px, reduced-motion and device-capability policy between canvas DPR and particle counts, responding to viewport/preference changes.
- `lib/research-scenes.ts`: typed seven-stage copy, labels and visual targets; keep interface/demo content distinct from real data.
- `public/manus-routes.json`: static manifest declaring the single current page route.
- `public/`: only small original brand assets if needed; the hero sculpture remains real procedural WebGL, not a replacement image.

The Canvas and animation controller are client-only and dynamically loaded to keep page content available if WebGL is unavailable. Keep the visible narrative semantic and readable independently of the canvas. Render the main geometry with a few BufferGeometry/Points/Line objects rather than large React object counts. Simplify particles and avoid expensive bloom on mobile/low-power contexts. The hero and all scenes reuse the same Research Core instance and scroll progress, preserving visual continuity.

## Build workflow and constraints

The project has no pre-existing framework, package manifest, installed dependencies, reusable components, or live data service. After approval: pin the package manager and lifecycle-script policy before installation; create the Next.js application structure and complete route manifest before the first server start; register TypeScript diagnostics; install only the dependencies needed for the requested stack; implement the full page and original procedural core; create/upload the geometric logo asset if needed for required project metadata; run the configured dev server on port 3000, verify the route manifest and preview, inspect desktop/mobile layout and the main scroll experience, resolve actionable diagnostics, and preserve a reproducible lockfile. The project is not authorized for publication; publishing remains off. The final handoff will use the Preview URL unless the user later requests and authorizes publication.

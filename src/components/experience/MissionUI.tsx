import { useMemo, useState } from "react";
import { ArrowRight, Check, Compass, Flag, MapPin, RotateCcw } from "lucide-react";
import { HoloPanel } from "@/components/ui/HoloPanel";
import { MISSIONS, type MissionDefinition, type MissionId, type MissionStep } from "@/lib/missions";

export function MissionPicker({
  onClose,
  onStart,
  completed,
}: {
  onClose: () => void;
  onStart: (id: MissionId) => void;
  completed: MissionId[];
}) {
  return (
    <HoloPanel
      title="CHOOSE AN EXPEDITION"
      subtitle="three stops · about 2–3 minutes"
      accent="#527c68"
      onClose={onClose}
    >
      <p className="mission-intro">
        Choose the lens that matches the role. Both routes use the same island and finish with a
        concise evidence recap.
      </p>
      <div className="mission-picker-grid">
        {Object.values(MISSIONS).map((mission) => (
          <button
            key={mission.id}
            className="mission-route-card"
            style={{ "--mission-accent": mission.accent } as React.CSSProperties}
            onClick={() => onStart(mission.id)}
          >
            <span className="mission-route-icon">
              <Compass />
            </span>
            <span className="mission-route-copy">
              <small>
                {completed.includes(mission.id) ? `✓ ${mission.stamp}` : "GUIDED FIELD ROUTE"}
              </small>
              <strong>{mission.title}</strong>
              <span>{mission.description}</span>
              <em>
                {mission.steps
                  .map((step) =>
                    step.zone === "queans"
                      ? "QueANS"
                      : step.zone === "rag"
                        ? "RAG Agent"
                        : step.zone[0]!.toUpperCase() + step.zone.slice(1),
                  )
                  .join("  →  ")}
              </em>
            </span>
            <ArrowRight />
          </button>
        ))}
      </div>
      <p className="mission-simulation-note">
        Simulations use curated local examples and are not connected to production data.
      </p>
    </HoloPanel>
  );
}

export function MissionHUD({
  mission,
  stepIndex,
  distance,
  lightweight,
  onOpen,
  onStop,
}: {
  mission: MissionDefinition;
  stepIndex: number;
  distance: number;
  lightweight: boolean;
  onOpen: () => void;
  onStop: () => void;
}) {
  const step = mission.steps[stepIndex]!;
  return (
    <aside
      className="mission-hud"
      style={{ "--mission-accent": mission.accent } as React.CSSProperties}
      aria-live="polite"
    >
      <div className="mission-hud-top">
        <span>
          FIELD ROUTE · {stepIndex + 1}/{mission.steps.length}
        </span>
        <button onClick={onStop}>Exit mission</button>
      </div>
      <strong>{step.title}</strong>
      <p>{step.objective}</p>
      <div className="mission-hud-meta">
        <span>
          <MapPin /> {lightweight ? "Lightweight route" : `${Math.round(distance)} m away`}
        </span>
        {lightweight && (
          <button onClick={onOpen}>
            Open next stop <ArrowRight />
          </button>
        )}
      </div>
      <div
        className="mission-progress"
        aria-label={`Mission progress: step ${stepIndex + 1} of ${mission.steps.length}`}
      >
        {mission.steps.map((_, index) => (
          <i key={index} className={index <= stepIndex ? "active" : ""} />
        ))}
      </div>
    </aside>
  );
}

export function MissionStepAction({
  mission,
  step,
  onComplete,
}: {
  mission: MissionDefinition;
  step: MissionStep;
  onComplete: () => void;
}) {
  if (step.challenge === "confidence-gate") return <ConfidenceChallenge onComplete={onComplete} />;
  if (step.challenge === "tenant-route") return <TenantChallenge onComplete={onComplete} />;
  return (
    <section
      className="mission-evidence"
      style={{ "--mission-accent": mission.accent } as React.CSSProperties}
    >
      <span>MISSION EVIDENCE</span>
      <p>{step.evidence}</p>
      <button onClick={onComplete}>
        <Check /> Log this evidence and continue
      </button>
    </section>
  );
}

type Decision = "approve" | "review";
function ConfidenceChallenge({ onComplete }: { onComplete: () => void }) {
  const cards = useMemo(
    () => [
      {
        id: "q1",
        confidence: 94,
        excerpt: "Photosynthesis converts light energy into chemical energy.",
        expected: "approve" as Decision,
      },
      {
        id: "q2",
        confidence: 61,
        excerpt: "The scan is partially obscured near the answer key.",
        expected: "review" as Decision,
      },
      {
        id: "q3",
        confidence: 88,
        excerpt: "Mitochondria generate most cellular ATP.",
        expected: "approve" as Decision,
      },
    ],
    [],
  );
  const [answers, setAnswers] = useState<Record<string, Decision>>({});
  const [checked, setChecked] = useState(false);
  const correct = cards.every((card) => answers[card.id] === card.expected);
  return (
    <section className="mission-challenge">
      <span>PORTFOLIO SIMULATION · CONFIDENCE GATE</span>
      <h3>Which results can proceed?</h3>
      <p>
        Approve well-supported output. Send uncertain or obscured extraction to a person for review.
      </p>
      <div className="decision-list">
        {cards.map((card) => (
          <fieldset key={card.id}>
            <legend>
              <b>{card.confidence}% confidence</b>
              <span>{card.excerpt}</span>
            </legend>
            <div>
              {(["approve", "review"] as Decision[]).map((decision) => (
                <button
                  key={decision}
                  aria-pressed={answers[card.id] === decision}
                  onClick={() => {
                    setChecked(false);
                    setAnswers((value) => ({ ...value, [card.id]: decision }));
                  }}
                >
                  {decision === "approve" ? "Approve" : "Send to review"}
                </button>
              ))}
            </div>
          </fieldset>
        ))}
      </div>
      {checked && (
        <p className={correct ? "challenge-success" : "challenge-error"} role="status">
          {correct
            ? "Quality gate passed. High-confidence evidence proceeds; uncertainty reaches human review."
            : "Not quite. The obscured 61% result needs human review; the supported results can proceed."}
        </p>
      )}
      {checked && correct ? (
        <button className="challenge-primary" onClick={onComplete}>
          <Check /> Log verified decision
        </button>
      ) : (
        <button
          className="challenge-primary"
          disabled={Object.keys(answers).length !== cards.length}
          onClick={() => setChecked(true)}
        >
          Check decisions
        </button>
      )}
    </section>
  );
}

function TenantChallenge({ onComplete }: { onComplete: () => void }) {
  const [choice, setChoice] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const options = [
    "Trust the tenant ID supplied by the browser and query the shared table.",
    "Verify the session, derive tenant membership on the server, then run a tenant-scoped query.",
    "Fetch all records and filter them in the React client after the response arrives.",
  ];
  const correct = choice === 1;
  return (
    <section className="mission-challenge">
      <span>PORTFOLIO SIMULATION · REQUEST ROUTE</span>
      <h3>Protect a multi-tenant request</h3>
      <p>
        An authenticated user requests candidate records for their organization. Choose the safe
        path.
      </p>
      <div className="architecture-options">
        {options.map((option, index) => (
          <button
            key={option}
            aria-pressed={choice === index}
            onClick={() => {
              setChoice(index);
              setChecked(false);
            }}
          >
            <b>0{index + 1}</b>
            <span>{option}</span>
          </button>
        ))}
      </div>
      {checked && (
        <p className={correct ? "challenge-success" : "challenge-error"} role="status">
          {correct
            ? "Safe route selected: authorization and tenant scope are enforced before the database query."
            : "That path exposes trust or data-isolation risk. Tenant identity must be derived and enforced on the server."}
        </p>
      )}
      {checked && correct ? (
        <button className="challenge-primary" onClick={onComplete}>
          <Check /> Log architecture decision
        </button>
      ) : (
        <button
          className="challenge-primary"
          disabled={choice === null}
          onClick={() => setChecked(true)}
        >
          Check route
        </button>
      )}
    </section>
  );
}

export function MissionRecap({
  mission,
  onClose,
  onAnother,
}: {
  mission: MissionDefinition;
  onClose: () => void;
  onAnother: () => void;
}) {
  return (
    <HoloPanel
      title="EXPEDITION COMPLETE"
      subtitle={mission.stamp}
      accent={mission.accent}
      onClose={onClose}
    >
      <div
        className="mission-recap"
        style={{ "--mission-accent": mission.accent } as React.CSSProperties}
      >
        <div className="passport-stamp">
          <Flag />
          <span>{mission.stamp}</span>
        </div>
        <h3>{mission.shortTitle} evidence collected.</h3>
        <p>This route connected Tejas’s project work to the engineering practices behind it.</p>
        <ul>
          {mission.skills.map((skill) => (
            <li key={skill}>
              <Check /> {skill}
            </li>
          ))}
        </ul>
        <div className="mission-recap-actions">
          <a href="/AI-Tejas-Resume-July-2026.pdf" target="_blank" rel="noreferrer">
            View résumé <ArrowRight />
          </a>
          <a href="mailto:tejasprasad43@gmail.com">
            Contact Tejas <ArrowRight />
          </a>
          <button onClick={onAnother}>
            <RotateCcw /> Explore another route
          </button>
          <button onClick={onClose}>Return to free drive</button>
        </div>
      </div>
    </HoloPanel>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { lazy, Suspense, useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowUpRight,
  ArrowDown,
  ArrowRight,
  RotateCcw,
  Volume2,
  VolumeX,
  Settings2,
  HelpCircle,
  X,
  Compass,
  MoveUpRight,
  Sun,
  Moon,
  FileText,
  Mail,
} from "lucide-react";
import { MotionConfig } from "motion/react";
import { PROJECTS, SOCIALS } from "@/data/portfolio";
import { ZONES, type ZoneId } from "@/components/3d/zones";
import type { Telemetry } from "@/components/3d/Scene";
import { PanelRouter } from "@/components/experience/PanelRouter";
import { HelpOverlay } from "@/components/ui/HelpOverlay";
import { SettingsPanel } from "@/components/ui/SettingsPanel";
import { MobileControls } from "@/components/ui/MobileControls";
import { ToastStack, type Toast } from "@/components/ui/Toasts";
import { SelectedWork } from "@/components/playground/SelectedWork";
import { IslandFallback } from "@/components/playground/IslandFallback";
import { SceneBoundary } from "@/components/playground/SceneBoundary";
import { useDeviceCapabilities } from "@/hooks/useDeviceCapabilities";
import { useSettings } from "@/hooks/useSettings";
import { useGameControls, clearDrivingControls } from "@/hooks/useGameControls";
import { activateDrivingAudio } from "@/lib/drivingAudio";
import { useAchievements } from "@/hooks/useAchievements";
import { useMissions } from "@/hooks/useMissions";
import { MISSIONS, type MissionId } from "@/lib/missions";
import { MissionHUD, MissionPicker, MissionRecap } from "@/components/experience/MissionUI";
import { seedTier, useQualityScaler } from "@/hooks/useQualityScaler";
import { RESUME_URL, RESUME_FILENAME } from "@/lib/resume";
const Scene = lazy(() => import("@/components/3d/Scene"));
const DESCRIPTION =
  "Interactive portfolio of B R Tejas Prasad, a Bengaluru engineer seeking AI engineering and full-stack roles. Explore document intelligence, RAG, secure product systems, and a 3D island.";

const SITE = "https://tejas-playground.tejasprasad43.chatgpt.site";
const OG_IMAGE = `${SITE}/og-preview.jpg`;

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Tejas — An engineer’s playground | B R Tejas Prasad" },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: "Tejas — AI & Full-Stack Engineer in Bengaluru" },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "profile" },
      { property: "og:url", content: `${SITE}/` },
      { property: "og:image", content: OG_IMAGE },
      { name: "twitter:card", content: "summary_large_image" },
      {
        name: "twitter:title",
        content: "Tejas — AI & Full-Stack Engineer in Bengaluru",
      },
      { name: "twitter:description", content: DESCRIPTION },
      { name: "twitter:image", content: OG_IMAGE },
    ],
    links: [{ rel: "canonical", href: `${SITE}/` }],

    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Person",
          name: "B R Tejas Prasad",
          jobTitle: "AI and Full-Stack Software Engineer",
          address: { "@type": "PostalAddress", addressLocality: "Bengaluru", addressCountry: "IN" },
          email: "mailto:tejasprasad43@gmail.com",
          sameAs: [
            "https://github.com/tejasprasadd",
            "https://www.linkedin.com/in/b-r-tejas-prasad/",
          ],
        }),
      },
    ],
  }),
  component: Index,
});

function Index() {
  const caps = useDeviceCapabilities(),
    { settings, update, timeOfDay, audioError } = useSettings();
  const [exploring, setExploring] = useState(false),
    [optIn, setOptIn] = useState(false),
    [failed, setFailed] = useState(false),
    [ready, setReady] = useState(false),
    [requested3D, setRequested3D] = useState(false),
    [pendingDrive, setPendingDrive] = useState(false),
    [pendingMissionZone, setPendingMissionZone] = useState<ZoneId | null>(null);
  const [openZone, setOpenZone] = useState<ZoneId | null>(null),
    [nearZone, setNearZone] = useState<ZoneId | null>(null),
    [help, setHelp] = useState(false),
    [config, setConfig] = useState(false),
    [missionPicker, setMissionPicker] = useState(false),
    [missionPaused, setMissionPaused] = useState(false),
    [resetKey, setResetKey] = useState(0);
  const [telemetry, setTelemetry] = useState<Telemetry>({ speed: 0, x: 0, z: 18, airborne: false }),
    [toasts, setToasts] = useState<Toast[]>([]);
  const [inView, setInView] = useState(true),
    hero = useRef<HTMLElement>(null);
  const visited = useRef(new Set<string>()),
    toastTimers = useRef<number[]>([]);
  const toast = useCallback((text: string, tone: Toast["tone"] = "info") => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t.slice(-2), { id, text, tone }]);
    toastTimers.current.push(
      window.setTimeout(() => setToasts((t) => t.filter((v) => v.id !== id)), 2800),
    );
  }, []);
  useEffect(() => () => toastTimers.current.forEach(clearTimeout), []);
  const {
    unlocked,
    unlock,
    reset: resetAchievements,
  } = useAchievements((label) => toast(label, "achievement"));
  const auto = useQualityScaler(seedTier(caps));
  const missions = useMissions();
  useEffect(() => {
    if (caps.ready) auto.reset(seedTier(caps));
  }, [caps.ready, caps.lowPower]);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry?.isIntersecting ?? true),
      { threshold: 0.05 },
    );
    if (hero.current) observer.observe(hero.current);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (!exploring) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [exploring]);
  const onReady = useCallback(() => setReady(true), []),
    onFailure = useCallback(() => {
      setFailed(true);
      setPendingDrive(false);
      if (missions.activeStep) setOpenZone(missions.activeStep.zone);
      else setExploring(false);
    }, [missions.activeStep]);
  useEffect(() => {
    if (!pendingDrive || !ready) return;
    setPendingDrive(false);
    setExploring(true);
    setMissionPaused(true);
    unlock("system_booted");
  }, [pendingDrive, ready, unlock]);
  useEffect(() => {
    if (!pendingDrive || !caps.ready || caps.webgl) return;
    setPendingDrive(false);
    toast("3D is unavailable here. You can explore the work below.");
  }, [pendingDrive, caps.ready, caps.webgl, toast]);
  useEffect(() => {
    if (!caps.ready || !pendingMissionZone) return;
    if (!caps.webgl) setOpenZone(pendingMissionZone);
    setPendingMissionZone(null);
  }, [caps.ready, caps.webgl, pendingMissionZone]);
  const openPanel = useCallback(
    (id: ZoneId) => {
      setOpenZone(id);
      if (id === "about") unlock("first_contact");
      if (id === "queans") unlock("ai_architect");
      if (id === "edulens") unlock("data_analyst");
      if (PROJECTS.some((p) => p.id === id)) {
        visited.current.add(id);
        if (visited.current.size === PROJECTS.length) unlock("project_explorer");
      }
    },
    [unlock],
  );
  const reset = useCallback(() => {
    clearDrivingControls();
    setResetKey((k) => k + 1);
    setNearZone(null);
    setTelemetry({ speed: 0, x: 0, z: 18, airborne: false });
    setOpenZone(null);
    setHelp(false);
    setConfig(false);
    toast("Back on the road. Props reset, too.");
  }, [toast]);
  useEffect(() => {
    if (audioError) toast(audioError);
  }, [audioError, toast]);
  const busy = !!openZone || help || config || missionPicker || !!missions.recap;
  useGameControls({
    enabled: exploring && !busy,
    onInteract: () => nearZone && openPanel(nearZone),
    onReset: reset,
    onEscape: () => {
      setOpenZone(null);
      setHelp(false);
      setConfig(false);
    },
    onToggleMute: () => update({ sound: !settings.sound }),
  });
  const can3D = requested3D && caps.ready && caps.webgl && !failed && (!caps.lowPower || optIn);
  const startDrive = () => {
    if (settings.sound || settings.music) void activateDrivingAudio();
    if (failed || (caps.ready && !caps.webgl)) {
      document.getElementById("work")?.scrollIntoView({ behavior: "smooth" });
      toast("3D is unavailable here. The work is just below.");
      return;
    }
    setRequested3D(true);
    setOptIn(true);
    if (!ready) {
      setPendingDrive(true);
      return;
    }
    setExploring(true);
    setMissionPaused(true);
    unlock("system_booted");
  };
  const startMission = (id: MissionId) => {
    if (settings.sound || settings.music) void activateDrivingAudio();
    setRequested3D(true);
    setOptIn(true);
    missions.start(id);
    setMissionPaused(false);
    setMissionPicker(false);
    setExploring(true);
    unlock("system_booted");
    if (failed || (caps.ready && !caps.webgl)) setOpenZone(MISSIONS[id].steps[0]!.zone);
    else if (!caps.ready) setPendingMissionZone(MISSIONS[id].steps[0]!.zone);
  };
  const resumeMission = () => {
    if (!missions.state.active || !missions.activeStep) {
      setMissionPicker(true);
      return;
    }
    if (settings.sound || settings.music) void activateDrivingAudio();
    setRequested3D(true);
    setOptIn(true);
    setMissionPaused(false);
    setExploring(true);
    if (failed || (caps.ready && !caps.webgl)) setOpenZone(missions.activeStep.zone);
    else if (!caps.ready) setPendingMissionZone(missions.activeStep.zone);
  };
  const near = ZONES.find((z) => z.id === nearZone);
  const missionTarget = missionPaused ? null : (missions.activeStep?.zone ?? null);
  const missionZone = missionTarget ? ZONES.find((zone) => zone.id === missionTarget) : null;
  const missionDistance = missionZone
    ? Math.hypot(telemetry.x - missionZone.position[0], telemetry.z - missionZone.position[2])
    : 0;
  const recapMission = missions.recap ? MISSIONS[missions.recap] : null;
  return (
    <MotionConfig reducedMotion="user">
      <div className={`playground ${exploring ? "is-exploring" : ""}`} data-island-time={timeOfDay}>
        <a className="skip-link" href="/portfolio">
          Skip to standard portfolio
        </a>
        <header className="site-header">
          <Link to="/" className="wordmark" onClick={() => setExploring(false)}>
            tejas<span>®</span>
          </Link>
          <nav aria-label="Main navigation">
            <button onClick={() => openPanel("about")}>About</button>
            <a href="#work" onClick={() => setExploring(false)}>
              Selected work
            </a>
            <button onClick={() => openPanel("contact")}>
              Let’s talk <ArrowUpRight size={14} />
            </button>
          </nav>
          <a
            className="resume-link"
            href={RESUME_URL}
            target="_blank"
            rel="noreferrer"
            download={RESUME_FILENAME}
          >
            Résumé <ArrowUpRight size={15} />
          </a>
        </header>
        <section ref={hero} className="hero" aria-label="An engineer’s playground">
          <div className="scene-stage">
            {can3D ? (
              <SceneBoundary
                fallback={<IslandFallback timeOfDay={timeOfDay} />}
                onFailure={onFailure}
              >
                <Suspense fallback={<IslandFallback timeOfDay={timeOfDay} />}>
                  <Scene
                    quality={settings.quality === "auto" ? auto.tier : settings.quality}
                    reduceMotion={settings.reduceMotion}
                    resetKey={resetKey}
                    exploring={exploring}
                    paused={busy || (!inView && !exploring)}
                    sound={settings.sound}
                    music={settings.music}
                    timeOfDay={timeOfDay}
                    onReset={reset}
                    activeZone={nearZone}
                    missionTarget={missionTarget}
                    onNearZone={setNearZone}
                    onSelectZone={openPanel}
                    onTelemetry={setTelemetry}
                    onReady={onReady}
                    onFailure={onFailure}
                    onFrame={settings.quality === "auto" ? auto.sample : undefined}
                  />
                </Suspense>
              </SceneBoundary>
            ) : (
              <IslandFallback timeOfDay={timeOfDay} />
            )}
          </div>
          {!exploring && (
            <>
              <div className="hero-copy">
                <p className="eyebrow">
                  <span className="status-dot" /> An engineer’s playground
                </p>
                <h1>
                  Serious code.
                  <br />
                  Playful <span>mind.</span>
                </h1>
                <p className="hero-role">AI engineering <span>·</span> Full-stack engineering <span>·</span> Bengaluru, India</p>
                <p className="hero-intro">
                  I’m Tejas. I build reliable AI systems and full-stack software that turn complex problems into useful experiences.
                </p>
                <div className="hero-routes" aria-label="Choose a role-focused route">
                  <button onClick={() => startMission("ai")}>
                    <span>01 / Guided route</span>
                    <strong>AI engineering</strong>
                    <ArrowUpRight size={17} />
                  </button>
                  <button onClick={() => startMission("fullstack")}>
                    <span>02 / Guided route</span>
                    <strong>Full-stack systems</strong>
                    <ArrowUpRight size={17} />
                  </button>
                </div>
                <div className="hero-actions">
                  {missions.state.active && <button className="secondary-action" onClick={resumeMission}><Compass size={15} /> Resume your mission <ArrowRight size={15} /></button>}
                  <button
                    className="secondary-action"
                    onClick={startDrive}
                    disabled={pendingDrive}
                  >
                    {pendingDrive ? "Preparing the island…" : "Free drive in 3D"}
                    <MoveUpRight size={15} />
                  </button>
                  <a className="text-link" href="/portfolio">
                    Read the portfolio <ArrowRight size={15} />
                  </a>
                </div>
                <div className="hero-quicklinks">
                  <a href={RESUME_URL} target="_blank" rel="noopener noreferrer" download={RESUME_FILENAME}><FileText size={15} /> Résumé</a>
                  <a href={`mailto:${SOCIALS.email}`}><Mail size={15} /> Contact</a>
                </div>
                <div className="location-note">
                  <span>BASED IN BENGALURU, INDIA</span>
                  <span>BUILDING FOR EVERYWHERE</span>
                </div>
              </div>
              <div className="world-note">
                <span className="note-arrow">↙</span>
                <span>
                  A small world.
                  <br />A lot to explore.
                </span>
              </div>
              <div className="hero-bottom">
                <a href="#work">
                  <span className="scroll-icon">
                    <ArrowDown size={13} />
                  </span>{" "}
                  Scroll to discover
                </a>
                <span>
                  {failed || !caps.webgl
                    ? "Lightweight view · Explore the projects below"
                    : !requested3D
                      ? "Lightweight view · 3D is optional"
                      : "Drag to look around · Click a landmark"}
                </span>
                <span className="edition">PORTFOLIO / 2026</span>
              </div>
            </>
          )}
          {exploring && (
            <>
              <div className="drive-title">
                <p className="eyebrow">You’re in the driver’s seat</p>
                <h2>Follow your curiosity.</h2>
                <button className="text-link" onClick={() => setExploring(false)}>
                  <X size={14} /> Back to the portfolio
                </button>
              </div>
              <div className="drive-tools">
                <button
                  aria-label={
                    timeOfDay === "night" ? "Switch island to day" : "Switch island to night"
                  }
                  title={timeOfDay === "night" ? "Switch to day" : "Switch to night"}
                  onClick={() => update({ timeOfDay: timeOfDay === "night" ? "day" : "night" })}
                >
                  {timeOfDay === "night" ? <Sun /> : <Moon />}
                </button>
                <button
                  aria-label={settings.sound ? "Mute sound" : "Enable sound"}
                  aria-pressed={settings.sound}
                  title={settings.sound ? "Mute sound (M)" : "Enable sound (M)"}
                  onClick={() => update({ sound: !settings.sound })}
                >
                  {settings.sound ? <Volume2 /> : <VolumeX />}
                </button>
                <button
                  aria-label="Reset jeep and props"
                  title="Reset jeep and props (R)"
                  onClick={reset}
                >
                  <RotateCcw />
                </button>
                <button aria-label="Help and controls" onClick={() => setHelp(true)}>
                  <HelpCircle />
                </button>
                <button aria-label="Settings" onClick={() => setConfig(true)}>
                  <Settings2 />
                </button>
              </div>
              <nav className="destination-nav" aria-label="Explore destinations">
                {ZONES.map((z) => (
                  <button
                    key={z.id}
                    onClick={() => openPanel(z.id)}
                    className={nearZone === z.id || missionTarget === z.id ? "active" : ""}
                  >
                    {z.sub === "Project" ? z.label : z.sub}
                  </button>
                ))}
              </nav>
              <div className="drive-map" aria-label="Island map">
                <svg viewBox="-50 -50 100 100">
                  <circle r="46" fill="#aec1a0" />
                  <circle r="24" fill="none" stroke="#e7dab9" strokeWidth="8" />
                  {ZONES.map((z) => (
                    <circle
                      key={z.id}
                      cx={z.position[0]}
                      cy={z.position[2]}
                      r="2.3"
                      fill={z.color}
                    />
                  ))}
                  <circle
                    cx={telemetry.x}
                    cy={telemetry.z}
                    r="3"
                    fill="#e16b43"
                    stroke="white"
                    strokeWidth="1.5"
                  />
                </svg>
                <span>THE PLAYGROUND</span>
              </div>
              <div className="drive-speed">
                <strong>{Math.round(telemetry.speed).toString().padStart(2, "0")}</strong>
                <span>KM/H</span>
                <p>
                  {telemetry.airborne ? "A little airtime!" : "Go ahead. Take the scenic route."}
                </p>
              </div>
              <div className="driving-hint">
                {near ? (
                  <button onClick={() => openPanel(near.id)}>
                    Explore {near.sub === "Project" ? near.label : near.sub} <kbd>E</kbd>{" "}
                    <ArrowUpRight size={15} />
                  </button>
                ) : (
                  <>
                    <span>
                      <kbd>W A S D</kbd> Drive
                    </span>
                    <span>
                      <kbd>SHIFT</kbd> Boost
                    </span>
                    <span>
                      <kbd>SPACE</kbd> Drift
                    </span>
                    <span>
                      <kbd>V</kbd> Hop
                    </span>
                  </>
                )}
              </div>
              {!missionPaused &&
                missions.activeMission &&
                missions.state.active &&
                missions.activeStep && (
                  <MissionHUD
                    mission={missions.activeMission}
                    stepIndex={missions.state.active.step}
                    distance={missionDistance}
                    lightweight={!can3D}
                    onOpen={() => openPanel(missions.activeStep!.zone)}
                    onStop={() => {
                      setMissionPaused(true);
                      toast("Mission paused. Free drive is still open.");
                    }}
                  />
                )}
              {caps.touch && !busy && (
                <MobileControls onInteract={() => nearZone && openPanel(nearZone)} />
              )}
            </>
          )}
        </section>
        {!exploring && <SelectedWork onOpen={openPanel} />}
        {openZone && (
          <PanelRouter
            zone={openZone}
            onClose={() => setOpenZone(null)}
            onSocial={() => unlock("network_connected")}
            missionId={missions.state.active?.id ?? null}
            missionStep={missions.activeStep ?? null}
            onMissionStepComplete={() => {
              const completedZone = missions.activeStep?.zone;
              if (!completedZone) return;
              missions.advance(completedZone);
              setMissionPaused(false);
              setOpenZone(null);
              toast("Evidence logged. Your next waypoint is active.", "achievement");
            }}
          />
        )}
        {missionPicker && (
          <MissionPicker
            completed={missions.state.completed}
            onClose={() => setMissionPicker(false)}
            onStart={startMission}
          />
        )}
        {recapMission && (
          <MissionRecap
            mission={recapMission}
            onClose={missions.closeRecap}
            onAnother={() => {
              missions.closeRecap();
              setMissionPicker(true);
            }}
          />
        )}
        {help && (
          <HelpOverlay
            unlocked={unlocked}
            completedMissions={missions.state.completed}
            activeMission={missions.activeMission}
            onChooseMission={() => {
              setHelp(false);
              setMissionPicker(true);
            }}
            onClose={() => setHelp(false)}
          />
        )}
        {config && (
          <SettingsPanel
            mode="3d"
            settings={settings}
            update={update}
            onClose={() => setConfig(false)}
            onResetAchievements={() => {
              resetAchievements();
              missions.reset();
              visited.current.clear();
            }}
            onResetScene={reset}
            onSwitchMode={() => {
              window.location.href = "/portfolio";
            }}
          />
        )}
        <ToastStack toasts={toasts} />
      </div>
    </MotionConfig>
  );
}

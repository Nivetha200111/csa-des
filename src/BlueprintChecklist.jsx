import confetti from "canvas-confetti";
import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useState } from "react";

const examBlueprint = [
  {
    id: "bp-1",
    domain: 1,
    title: "Platform Overview and Navigation",
    weight: 7,
    topics: [
      { id: "bp-1-1", label: "ServiceNow Platform overview" },
      { id: "bp-1-2", label: "Platform capabilities and services" },
      { id: "bp-1-3", label: "The ServiceNow Instance" },
      { id: "bp-1-4", label: "Next Experience Unified Navigation" },
    ],
  },
  {
    id: "bp-2",
    domain: 2,
    title: "Instance Configuration",
    weight: 10,
    topics: [
      { id: "bp-2-1", label: "Installing applications and plugins" },
      { id: "bp-2-2", label: "Personalizing/customizing the instance" },
      { id: "bp-2-3", label: "Common user interfaces in the Platform" },
    ],
  },
  {
    id: "bp-3",
    domain: 3,
    title: "Configuring Applications for Collaboration",
    weight: 20,
    topics: [
      { id: "bp-3-1", label: "Lists, Filters, and Tags" },
      { id: "bp-3-2", label: "List and Form anatomy" },
      { id: "bp-3-3", label: "Form Configuration" },
      { id: "bp-3-4", label: "Form templates and saving options" },
      { id: "bp-3-5", label: "Advanced Form Configuration" },
      { id: "bp-3-6", label: "Task Management" },
      { id: "bp-3-7", label: "Visual Task Boards (VTBs)" },
      { id: "bp-3-8", label: "Visualizations, Dashboards, and Platform Analytics" },
      { id: "bp-3-9", label: "Notifications" },
    ],
  },
  {
    id: "bp-4",
    domain: 4,
    title: "Self Service & Automation",
    weight: 20,
    topics: [
      { id: "bp-4-1", label: "Knowledge Management" },
      { id: "bp-4-2", label: "Service Catalog" },
      { id: "bp-4-3", label: "Workflow Studio" },
      { id: "bp-4-4", label: "Virtual Agent" },
    ],
  },
  {
    id: "bp-5",
    domain: 5,
    title: "Database Management and Platform Security",
    weight: 30,
    topics: [
      { id: "bp-5-1", label: "Data Schema" },
      { id: "bp-5-2", label: "Application/Access Control" },
      { id: "bp-5-3", label: "Importing Data" },
      { id: "bp-5-4", label: "CMDB and CSDM" },
      { id: "bp-5-5", label: "Security Center" },
      { id: "bp-5-6", label: "Shared Responsibility Model" },
    ],
  },
  {
    id: "bp-6",
    domain: 6,
    title: "Data Migration and Integration",
    weight: 13,
    topics: [
      { id: "bp-6-1", label: "UI Policies" },
      { id: "bp-6-2", label: "Business Rules" },
      { id: "bp-6-3", label: "System update sets" },
      { id: "bp-6-4", label: "Scripting in ServiceNow" },
    ],
  },
];

/* Topics already finished before the plan starts */
const preCheckedTopics = ["bp-5-3", "bp-5-4"];

const studyPlan = [
  {
    id: "eve",
    day: "Evening Before",
    timeLabel: "6:30 PM - Midnight",
    blocks: [
      { id: "eve-w", time: "6:30 - 8:00 PM", title: "🏋️ Workout", topicIds: [], isWorkout: true },
      { id: "eve-1", time: "8:00 - 9:00 PM", title: "Platform & Config Warm-up", topicIds: ["bp-1-1", "bp-2-1", "bp-1-4", "bp-6-1"] },
      { id: "eve-2", time: "9:10 - 10:10 PM", title: "Instance Behaviour & Logic", topicIds: ["bp-1-3", "bp-2-2", "bp-6-2", "bp-2-3"] },
      { id: "eve-3", time: "10:20 - 11:20 PM", title: "Capabilities & Migration", topicIds: ["bp-1-2", "bp-6-3", "bp-6-4"] },
      { id: "eve-4", time: "11:20 PM - 12:00", title: "Evening Review", topicIds: [] },
    ],
  },
  {
    id: "main",
    day: "Main Day",
    timeLabel: "9 AM - 8:30 PM",
    blocks: [
      { id: "main-1", time: "9:00 - 10:30", title: "Forms, Lists & Schema", topicIds: ["bp-5-1", "bp-3-1", "bp-3-2", "bp-3-3", "bp-3-4"] },
      { id: "main-2", time: "10:40 - 12:00", title: "Advanced Config & ACLs", topicIds: ["bp-3-5", "bp-5-2", "bp-3-6", "bp-3-7"] },
      { id: "main-w", time: "12:00 - 1:30", title: "🏋️ Workout", topicIds: [], isWorkout: true },
      { id: "main-3", time: "1:30 - 3:30", title: "Self Service & Dashboards", topicIds: ["bp-4-1", "bp-4-2", "bp-3-8", "bp-3-9"] },
      { id: "main-4", time: "3:45 - 5:45", title: "Automation & Security", topicIds: ["bp-4-3", "bp-4-4", "bp-5-5", "bp-5-6"] },
      { id: "main-5", time: "6:00 - 6:45", title: "Revisit Imports & CMDB", topicIds: ["bp-5-3", "bp-5-4"] },
      { id: "main-6", time: "7:00 - 8:30", title: "Final Review & Mock", topicIds: [] },
    ],
  },
];

const STORAGE_KEY = "csa-blueprint-checklist";

function readChecklist() {
  const defaults = Object.fromEntries(preCheckedTopics.map((id) => [id, true]));
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaults;
    const parsed = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return defaults;
    return { ...defaults, ...parsed };
  } catch {
    return defaults;
  }
}

function fireCoinBurst(originX = 0.5, originY = 0.5) {
  confetti({
    particleCount: 35,
    spread: 50,
    startVelocity: 22,
    ticks: 100,
    colors: ["#ffd700", "#ffed4a", "#f7d74e", "#fff8dc"],
    scalar: 0.7,
    zIndex: 2500,
    origin: { x: originX, y: originY },
  });
}

function fireWorldClear() {
  const duration = 1200;
  const end = Date.now() + duration;
  const colors = ["#e52521", "#049cd8", "#fbd000", "#43b047", "#ffffff"];
  (function frame() {
    confetti({ particleCount: 4, angle: 60, spread: 55, origin: { x: 0 }, colors, zIndex: 2500 });
    confetti({ particleCount: 4, angle: 120, spread: 55, origin: { x: 1 }, colors, zIndex: 2500 });
    if (Date.now() < end) requestAnimationFrame(frame);
  })();
}

function fireGameClear() {
  const duration = 3000;
  const end = Date.now() + duration;
  const colors = ["#e52521", "#049cd8", "#fbd000", "#43b047", "#f8a8d8"];
  (function frame() {
    confetti({ particleCount: 6, angle: 60, spread: 70, origin: { x: 0, y: 0.6 }, colors, zIndex: 2500 });
    confetti({ particleCount: 6, angle: 120, spread: 70, origin: { x: 1, y: 0.6 }, colors, zIndex: 2500 });
    confetti({ particleCount: 4, angle: 90, spread: 100, origin: { x: 0.5, y: 0.3 }, colors, zIndex: 2500 });
    if (Date.now() < end) requestAnimationFrame(frame);
  })();
}

const pageVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.5, staggerChildren: 0.08 } },
};

const worldVariants = {
  hidden: { opacity: 0, y: 40 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] },
  }),
};

export default function BlueprintChecklist({ onBack }) {
  const [checked, setChecked] = useState(readChecklist);
  const [showGuide, setShowGuide] = useState(false);
  const [justCleared, setJustCleared] = useState(null); // world id that was just cleared
  const [gameComplete, setGameComplete] = useState(false);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(checked));
  }, [checked]);

  const totalTopics = useMemo(() => examBlueprint.reduce((s, d) => s + d.topics.length, 0), []);
  const completedTopics = useMemo(() => Object.values(checked).filter(Boolean).length, [checked]);
  const overallPercent = totalTopics ? Math.round((completedTopics / totalTopics) * 100) : 0;
  const score = completedTopics * 1000;

  const domainProgress = useCallback(
    (domain) => {
      const done = domain.topics.filter((t) => checked[t.id]).length;
      return { done, total: domain.topics.length, percent: Math.round((done / domain.topics.length) * 100) };
    },
    [checked]
  );

  const completedWorlds = useMemo(
    () => examBlueprint.filter((d) => domainProgress(d).percent === 100).length,
    [domainProgress]
  );

  const currentLevelId = useMemo(() => {
    for (const domain of examBlueprint) {
      for (const topic of domain.topics) {
        if (!checked[topic.id]) return topic.id;
      }
    }
    return null;
  }, [checked]);

  const currentWorldNum = useMemo(() => {
    for (let i = 0; i < examBlueprint.length; i++) {
      if (examBlueprint[i].topics.some((t) => !checked[t.id])) return i + 1;
    }
    return 6;
  }, [checked]);

  const toggle = useCallback(
    (topicId, event) => {
      setChecked((prev) => {
        const wasDone = prev[topicId];
        const next = { ...prev, [topicId]: !wasDone };

        if (!wasDone) {
          // Level cleared!
          const rect = event?.currentTarget?.getBoundingClientRect();
          if (rect) {
            const ox = rect.left / window.innerWidth + rect.width / (2 * window.innerWidth);
            const oy = rect.top / window.innerHeight;
            fireCoinBurst(ox, oy);
          } else {
            fireCoinBurst();
          }

          // Check if world is now cleared
          const domain = examBlueprint.find((d) => d.topics.some((t) => t.id === topicId));
          if (domain) {
            const allDone = domain.topics.every((t) => (t.id === topicId ? true : next[t.id]));
            if (allDone) {
              setJustCleared(domain.id);
              setTimeout(() => setJustCleared(null), 2500);
              setTimeout(fireWorldClear, 200);
            }
          }

          // Check if ALL topics are now done
          const totalDone = Object.values(next).filter(Boolean).length;
          if (totalDone >= totalTopics) {
            setTimeout(() => {
              setGameComplete(true);
              fireGameClear();
            }, 600);
          }
        }

        return next;
      });
    },
    [totalTopics]
  );

  const resetAll = () => {
    const defaults = Object.fromEntries(preCheckedTopics.map((id) => [id, true]));
    setChecked(defaults);
    setGameComplete(false);
    setJustCleared(null);
  };

  return (
    <motion.main
      key="blueprint"
      className="mario-game"
      variants={pageVariants}
      initial="hidden"
      animate="show"
      exit={{ opacity: 0 }}
    >
      {/* Decorative clouds */}
      <div className="mario-sky" aria-hidden="true">
        <div className="mario-cloud mario-cloud--1" />
        <div className="mario-cloud mario-cloud--2" />
        <div className="mario-cloud mario-cloud--3" />
        <div className="mario-cloud mario-cloud--4" />
      </div>

      {/* HUD */}
      <div className="mario-hud">
        <div className="mario-hud__cell">
          <span className="mario-hud__label">SCORE</span>
          <span className="mario-hud__value">{String(score).padStart(6, "0")}</span>
        </div>
        <div className="mario-hud__cell">
          <span className="mario-hud__label">COINS</span>
          <span className="mario-hud__value">{completedTopics}/{totalTopics}</span>
        </div>
        <div className="mario-hud__cell">
          <span className="mario-hud__label">WORLD</span>
          <span className="mario-hud__value">{currentWorldNum}-1</span>
        </div>
        <div className="mario-hud__cell">
          <span className="mario-hud__label">STARS</span>
          <span className="mario-hud__value">{completedWorlds}/6</span>
        </div>
      </div>

      {/* Title Card */}
      <motion.section className="mario-title-card" variants={worldVariants} custom={0}>
        <div className="mario-title-card__pre">SUPER</div>
        <h1 className="mario-title-card__title">CSA WORLD</h1>
        <p className="mario-title-card__sub">
          Clear all 30 levels across 6 worlds to earn your ServiceNow CSA
        </p>
        <div className="mario-overall-bar">
          <div className="mario-overall-bar__label">
            <span>COURSE PROGRESS</span>
            <span>{overallPercent}%</span>
          </div>
          <div className="mario-bar">
            <motion.div
              className="mario-bar__fill"
              animate={{ width: `${overallPercent}%` }}
              transition={{ type: "spring", stiffness: 100, damping: 16 }}
            />
          </div>
        </div>
      </motion.section>

      {/* World Map */}
      <div className="mario-world-map">
        {examBlueprint.map((domain, worldIndex) => {
          const worldNum = worldIndex + 1;
          const progress = domainProgress(domain);
          const isCleared = progress.percent === 100;
          const wasJustCleared = justCleared === domain.id;

          return (
            <motion.div
              key={domain.id}
              className={`mario-world${isCleared ? " mario-world--cleared" : ""}${wasJustCleared ? " mario-world--celebrating" : ""}`}
              variants={worldVariants}
              custom={worldIndex + 1}
            >
              {/* World Header */}
              <div className="mario-world__banner">
                <span className="mario-world__number">WORLD {worldNum}</span>
                <span className="mario-world__name">{domain.title}</span>
                <span className="mario-world__weight">{domain.weight}%</span>
                <span className="mario-world__status">
                  {isCleared ? "CLEAR!" : `${progress.done}/${progress.total}`}
                </span>
              </div>

              {/* Level Path */}
              <div className="mario-world__path">
                <div className="mario-path-start">
                  <span>START</span>
                </div>

                {domain.topics.map((topic, levelIndex) => {
                  const isDone = checked[topic.id];
                  const isCurrent = topic.id === currentLevelId;
                  const levelId = `${worldNum}-${levelIndex + 1}`;

                  return (
                    <div className="mario-level-group" key={topic.id}>
                      <div className={`mario-path-segment${isDone || (levelIndex === 0 && progress.done > 0) ? " mario-path-segment--active" : ""}`} />
                      <div className="mario-level-wrapper">
                        <AnimatePresence>
                          {isCurrent && (
                            <motion.div
                              className="mario-pointer"
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0 }}
                            >
                              <span className="mario-pointer__arrow" />
                            </motion.div>
                          )}
                        </AnimatePresence>
                        <motion.button
                          type="button"
                          className={`mario-block${isDone ? " mario-block--done" : ""}${isCurrent ? " mario-block--current" : ""}`}
                          onClick={(e) => toggle(topic.id, e)}
                          whileTap={{ scale: 0.85 }}
                          animate={
                            isDone
                              ? { scale: [1, 1.15, 1], transition: { duration: 0.3 } }
                              : {}
                          }
                          title={topic.label}
                        >
                          <span className="mario-block__symbol">
                            {isDone ? "\u2605" : "?"}
                          </span>
                        </motion.button>
                        <div className="mario-level-id">{levelId}</div>
                        <div className="mario-level-name">{topic.label}</div>
                      </div>
                    </div>
                  );
                })}

                {/* Path to Castle */}
                <div className={`mario-path-segment${isCleared ? " mario-path-segment--active" : ""}`} />

                {/* Castle */}
                <div className={`mario-castle${isCleared ? " mario-castle--cleared" : ""}`}>
                  <div className="mario-castle__turrets">
                    <div className="mario-castle__turret" />
                    <div className="mario-castle__turret" />
                    <div className="mario-castle__turret" />
                  </div>
                  <div className="mario-castle__body">
                    <div className="mario-castle__door" />
                  </div>
                  {isCleared && (
                    <motion.div
                      className="mario-castle__flag"
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ type: "spring", stiffness: 200, damping: 12 }}
                    >
                      <span className="mario-castle__flag-star">{"\u2605"}</span>
                    </motion.div>
                  )}
                </div>
              </div>

              {/* World Clear Banner */}
              <AnimatePresence>
                {wasJustCleared && (
                  <motion.div
                    className="mario-world-clear"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ type: "spring", stiffness: 200, damping: 14 }}
                  >
                    WORLD {worldNum} CLEAR!
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Pipe connector to next world */}
              {worldIndex < examBlueprint.length - 1 && (
                <div className="mario-pipe">
                  <div className="mario-pipe__lip" />
                  <div className="mario-pipe__shaft" />
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Game Complete Screen */}
      <AnimatePresence>
        {gameComplete && (
          <motion.section
            className="mario-victory"
            initial={{ opacity: 0, scale: 0.8, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ type: "spring", stiffness: 150, damping: 14 }}
          >
            <div className="mario-victory__pre">THANK YOU!</div>
            <h2 className="mario-victory__title">COURSE CLEAR!</h2>
            <p className="mario-victory__sub">
              All 30 topics completed. You are ready for the CSA exam.
            </p>
            <div className="mario-victory__score">
              FINAL SCORE: {String(score).padStart(6, "0")}
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* Strategy Guide Toggle */}
      <motion.section className="mario-guide-section" variants={worldVariants} custom={7}>
        <button
          type="button"
          className="mario-guide-toggle"
          onClick={() => setShowGuide((p) => !p)}
        >
          {showGuide ? "HIDE STRATEGY GUIDE" : "SHOW STRATEGY GUIDE"}
        </button>

        <AnimatePresence>
          {showGuide && (
            <motion.div
              className="mario-guide"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.35 }}
            >
              {studyPlan.map((dayPlan) => (
                <div key={dayPlan.id} className="mario-guide__day">
                  <div className="mario-guide__day-header">
                    <span>{dayPlan.day}</span>
                    <span>{dayPlan.timeLabel}</span>
                  </div>
                  {dayPlan.blocks.map((block) => {
                    const blockDone =
                      block.topicIds.length > 0 &&
                      block.topicIds.every((id) => checked[id]);
                    return (
                      <div
                        key={block.id}
                        className={`mario-guide__block${blockDone ? " mario-guide__block--done" : ""}${block.isWorkout ? " mario-guide__block--workout" : ""}`}
                      >
                        <span className="mario-guide__block-time">{block.time}</span>
                        <span className="mario-guide__block-title">{block.title}</span>
                        {block.topicIds.length > 0 && (
                          <span className="mario-guide__block-progress">
                            {block.topicIds.filter((id) => checked[id]).length}/{block.topicIds.length}
                          </span>
                        )}
                        {block.isWorkout && (
                          <span className="mario-guide__block-workout-badge">1.5h</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.section>

      {/* Controls */}
      <div className="mario-controls">
        <motion.button
          type="button"
          className="mario-btn mario-btn--reset"
          onClick={resetAll}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          RESTART GAME
        </motion.button>
      </div>
    </motion.main>
  );
}

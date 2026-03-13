import confetti from "canvas-confetti";
import { AnimatePresence, motion } from "framer-motion";
import { Fragment, useCallback, useEffect, useMemo, useState } from "react";

/* ── Exam blueprint (kept for topic label + domain lookups) ── */

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

/* ── Study plan (schedule-based: the game is driven by this) ── */

const studyPlan = [
  {
    id: "eve",
    day: "Evening Before",
    timeLabel: "9:30 PM – 12:30 AM",
    blocks: [
      { id: "eve-1", time: "9:30 – 10:20 PM", title: "Platform & Config Warm-up", topicIds: ["bp-1-1", "bp-2-1", "bp-1-4", "bp-6-1"] },
      { id: "eve-2", time: "10:30 – 11:20 PM", title: "Instance Behaviour & Logic", topicIds: ["bp-1-3", "bp-2-2", "bp-6-2", "bp-2-3"] },
      { id: "eve-3", time: "11:30 PM – 12:10 AM", title: "Capabilities & Migration", topicIds: ["bp-1-2", "bp-6-3", "bp-6-4"] },
      { id: "eve-4", time: "12:10 – 12:30 AM", title: "Evening Review", topicIds: [] },
    ],
  },
  {
    id: "main",
    day: "Main Day",
    timeLabel: "8 AM – 7:30 PM",
    blocks: [
      { id: "main-1", time: "8:00 – 9:30", title: "Forms, Lists & Schema", topicIds: ["bp-5-1", "bp-3-1", "bp-3-2", "bp-3-3", "bp-3-4"] },
      { id: "main-2", time: "9:40 – 11:00", title: "Advanced Config & ACLs", topicIds: ["bp-3-5", "bp-5-2", "bp-3-6", "bp-3-7"] },
      { id: "main-w", time: "11:00 – 12:30", title: "Workout", topicIds: [], isWorkout: true },
      { id: "main-3", time: "12:30 – 2:30", title: "Self Service & Dashboards", topicIds: ["bp-4-1", "bp-4-2", "bp-3-8", "bp-3-9"] },
      { id: "main-4", time: "2:45 – 4:45", title: "Automation & Security", topicIds: ["bp-4-3", "bp-4-4", "bp-5-5", "bp-5-6"] },
      { id: "main-5", time: "5:00 – 5:45", title: "Revisit Imports & CMDB", topicIds: ["bp-5-3", "bp-5-4"] },
      { id: "main-6", time: "6:00 – 7:30", title: "Final Review & Mock", topicIds: [] },
    ],
  },
];

/* ── Helpers ── */

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

/* ══════════════════════════════════════════
   Component
   ══════════════════════════════════════════ */

export default function BlueprintChecklist({ onBack }) {
  const [checked, setChecked] = useState(readChecklist);
  const [showGuide, setShowGuide] = useState(false);
  const [justCleared, setJustCleared] = useState(null);
  const [gameComplete, setGameComplete] = useState(false);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(checked));
  }, [checked]);

  /* ── Topic lookup map ── */
  const topicMap = useMemo(() => {
    const map = {};
    examBlueprint.forEach((d) =>
      d.topics.forEach((t) => {
        map[t.id] = { label: t.label, domain: d.title };
      })
    );
    return map;
  }, []);

  /* ── Study blocks that carry topics (the "zones") ── */
  const studyBlocksWithTopics = useMemo(
    () => studyPlan.flatMap((day) => day.blocks.filter((b) => b.topicIds.length > 0)),
    []
  );

  /* ── Totals ── */
  const totalTopics = useMemo(
    () => studyPlan.reduce((s, day) => s + day.blocks.reduce((s2, b) => s2 + b.topicIds.length, 0), 0),
    []
  );
  const completedTopics = useMemo(() => Object.values(checked).filter(Boolean).length, [checked]);
  const overallPercent = totalTopics ? Math.round((completedTopics / totalTopics) * 100) : 0;
  const score = completedTopics * 1000;

  /* ── Day progress ── */
  const dayProgress = useCallback(
    (day) => {
      const allIds = day.blocks.flatMap((b) => b.topicIds);
      const done = allIds.filter((id) => checked[id]).length;
      return {
        done,
        total: allIds.length,
        percent: allIds.length ? Math.round((done / allIds.length) * 100) : 0,
      };
    },
    [checked]
  );

  /* ── Block progress ── */
  const blockProgress = useCallback(
    (block) => {
      if (!block.topicIds.length) return { done: 0, total: 0, percent: 100 };
      const done = block.topicIds.filter((id) => checked[id]).length;
      return {
        done,
        total: block.topicIds.length,
        percent: Math.round((done / block.topicIds.length) * 100),
      };
    },
    [checked]
  );

  /* ── Completed worlds (days) ── */
  const completedWorlds = useMemo(
    () => studyPlan.filter((day) => dayProgress(day).percent === 100).length,
    [dayProgress]
  );

  /* ── Completed zones (study blocks with all topics done) ── */
  const completedZones = useMemo(
    () => studyBlocksWithTopics.filter((b) => b.topicIds.every((id) => checked[id])).length,
    [checked, studyBlocksWithTopics]
  );
  const totalZones = studyBlocksWithTopics.length;

  /* ── Current level (first unchecked topic in schedule order) ── */
  const currentLevelId = useMemo(() => {
    for (const day of studyPlan) {
      for (const block of day.blocks) {
        for (const topicId of block.topicIds) {
          if (!checked[topicId]) return topicId;
        }
      }
    }
    return null;
  }, [checked]);

  /* ── Current world num ── */
  const currentWorldNum = useMemo(() => {
    for (let i = 0; i < studyPlan.length; i++) {
      const allIds = studyPlan[i].blocks.flatMap((b) => b.topicIds);
      if (allIds.some((id) => !checked[id])) return i + 1;
    }
    return studyPlan.length;
  }, [checked]);

  /* ── Toggle ── */
  const toggle = useCallback(
    (topicId, event) => {
      setChecked((prev) => {
        const wasDone = prev[topicId];
        const next = { ...prev, [topicId]: !wasDone };

        if (!wasDone) {
          const rect = event?.currentTarget?.getBoundingClientRect();
          if (rect) {
            const ox = rect.left / window.innerWidth + rect.width / (2 * window.innerWidth);
            const oy = rect.top / window.innerHeight;
            fireCoinBurst(ox, oy);
          } else {
            fireCoinBurst();
          }

          // Check if a day (world) is now cleared
          const day = studyPlan.find((d) =>
            d.blocks.some((b) => b.topicIds.includes(topicId))
          );
          if (day) {
            const allDayIds = day.blocks.flatMap((b) => b.topicIds);
            const allDone = allDayIds.every((id) =>
              id === topicId ? true : next[id]
            );
            if (allDone) {
              setJustCleared(day.id);
              setTimeout(() => setJustCleared(null), 2500);
              setTimeout(fireWorldClear, 200);
            }
          }

          // Check game complete
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

  /* ── Reset ── */
  const resetAll = () => {
    const defaults = Object.fromEntries(preCheckedTopics.map((id) => [id, true]));
    setChecked(defaults);
    setGameComplete(false);
    setJustCleared(null);
  };

  /* ══════════════════════════════════════════
     Render
     ══════════════════════════════════════════ */

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
          <span className="mario-hud__value">
            {completedTopics}/{totalTopics}
          </span>
        </div>
        <div className="mario-hud__cell">
          <span className="mario-hud__label">WORLD</span>
          <span className="mario-hud__value">{currentWorldNum}-1</span>
        </div>
        <div className="mario-hud__cell">
          <span className="mario-hud__label">ZONES</span>
          <span className="mario-hud__value">
            {completedZones}/{totalZones}
          </span>
        </div>
      </div>

      {/* Title Card */}
      <motion.section className="mario-title-card" variants={worldVariants} custom={0}>
        <div className="mario-title-card__pre">SUPER</div>
        <h1 className="mario-title-card__title">CSA WORLD</h1>
        <p className="mario-title-card__sub">
          Clear all 30 levels across 2 worlds to earn your ServiceNow CSA
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

      {/* ── World Map (schedule-driven) ── */}
      <div className="mario-world-map">
        {studyPlan.map((day, worldIndex) => {
          const worldNum = worldIndex + 1;
          const progress = dayProgress(day);
          const isCleared = progress.percent === 100;
          const wasJustCleared = justCleared === day.id;
          let levelCounter = 0;

          return (
            <motion.div
              key={day.id}
              className={`mario-world${isCleared ? " mario-world--cleared" : ""}${wasJustCleared ? " mario-world--celebrating" : ""}`}
              variants={worldVariants}
              custom={worldIndex + 1}
            >
              {/* World Header */}
              <div className="mario-world__banner">
                <span className="mario-world__number">WORLD {worldNum}</span>
                <span className="mario-world__name">{day.day}</span>
                <span className="mario-world__weight">{day.timeLabel}</span>
                <span className="mario-world__status">
                  {isCleared ? "CLEAR!" : `${progress.done}/${progress.total}`}
                </span>
              </div>

              {/* Level Path */}
              <div className="mario-world__path">
                <div className="mario-path-start">
                  <span>START</span>
                </div>

                {day.blocks.map((block) => {
                  const bProg = blockProgress(block);
                  const blockCleared = bProg.percent === 100;

                  /* ── Workout / Review rest stops ── */
                  if (block.isWorkout || block.topicIds.length === 0) {
                    return (
                      <div key={block.id} className="mario-level-group">
                        <div className="mario-path-segment mario-path-segment--active" />
                        <div
                          className={`mario-rest-stop${block.isWorkout ? " mario-rest-stop--workout" : " mario-rest-stop--review"}`}
                        >
                          <div className="mario-rest-stop__icon">
                            {block.isWorkout ? "🏋️" : "📋"}
                          </div>
                          <div className="mario-rest-stop__label">
                            {block.isWorkout ? "WORKOUT" : block.title.toUpperCase()}
                          </div>
                          <div className="mario-rest-stop__time">{block.time}</div>
                        </div>
                      </div>
                    );
                  }

                  /* ── Study block with topics ── */
                  return (
                    <Fragment key={block.id}>
                      {/* Zone marker (block banner on the path) */}
                      <div className="mario-path-segment" />
                      <div
                        className={`mario-zone-marker${blockCleared ? " mario-zone-marker--cleared" : ""}`}
                      >
                        <span className="mario-zone-marker__flag">⚑</span>
                        <span className="mario-zone-marker__title">{block.title}</span>
                        <span className="mario-zone-marker__time">{block.time}</span>
                        <span className="mario-zone-marker__progress">
                          {bProg.done}/{bProg.total}
                        </span>
                      </div>

                      {/* Topic ? blocks */}
                      {block.topicIds.map((topicId) => {
                        levelCounter++;
                        const info = topicMap[topicId];
                        const isDone = checked[topicId];
                        const isCurrent = topicId === currentLevelId;
                        const levelId = `${worldNum}-${levelCounter}`;

                        return (
                          <div className="mario-level-group" key={topicId}>
                            <div
                              className={`mario-path-segment${isDone ? " mario-path-segment--active" : ""}`}
                            />
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
                                onClick={(e) => toggle(topicId, e)}
                                whileTap={{ scale: 0.85 }}
                                animate={
                                  isDone
                                    ? { scale: [1, 1.15, 1], transition: { duration: 0.3 } }
                                    : {}
                                }
                                title={info?.label || topicId}
                              >
                                <span className="mario-block__symbol">
                                  {isDone ? "\u2605" : "?"}
                                </span>
                              </motion.button>
                              <div className="mario-level-id">{levelId}</div>
                              <div className="mario-level-name">
                                {info?.label || topicId}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </Fragment>
                  );
                })}

                {/* Path to Castle */}
                <div
                  className={`mario-path-segment${isCleared ? " mario-path-segment--active" : ""}`}
                />

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
              {worldIndex < studyPlan.length - 1 && (
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
      <motion.section className="mario-guide-section" variants={worldVariants} custom={3}>
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
                            {block.topicIds.filter((id) => checked[id]).length}/
                            {block.topicIds.length}
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

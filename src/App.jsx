import confetti from "canvas-confetti";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import practiceQuestionData from "./data/csaQuestions.json";

const initialDays = [
  {
    id: 1,
    title: "Day 1",
    focus: "Core refresh",
    tasks: [
      { id: "d1-r", label: "Revise core concepts", done: false },
      { id: "d1-p", label: "Do practical work in PDI", done: false },
      { id: "d1-m", label: "Take 1 short mock", done: false },
      { id: "d1-w", label: "Review weak areas", done: false },
    ],
    notes: "Tables, lists, forms, update sets, application scope",
  },
  {
    id: 2,
    title: "Day 2",
    focus: "Security",
    tasks: [
      { id: "d2-r", label: "Revise users, groups, roles, ACLs", done: false },
      { id: "d2-p", label: "Do ACL / UI policy practical", done: false },
      { id: "d2-m", label: "Take 1 full mock", done: false },
      { id: "d2-w", label: "Review wrong answers", done: false },
    ],
    notes: "ACL order, admin override, UI policy vs data policy",
  },
  {
    id: 3,
    title: "Day 3",
    focus: "Automation",
    tasks: [
      { id: "d3-r", label: "Revise BRs, Client Scripts, Flows", done: false },
      { id: "d3-p", label: "Do 3 small practicals", done: false },
      { id: "d3-m", label: "Take 1 timed mock", done: false },
      { id: "d3-w", label: "Review weak areas", done: false },
    ],
    notes: "Client vs server, triggers, notifications, scheduled jobs",
  },
  {
    id: 4,
    title: "Day 4",
    focus: "Data handling + catalog",
    tasks: [
      { id: "d4-r", label: "Revise import sets and catalog", done: false },
      { id: "d4-p", label: "Do import / catalog practical", done: false },
      { id: "d4-m1", label: "Take mock 1", done: false },
      { id: "d4-m2", label: "Take mock 2", done: false },
      { id: "d4-w", label: "Review mistakes", done: false },
    ],
    notes: "Transform maps, record producer vs catalog item",
  },
  {
    id: 5,
    title: "Day 5",
    focus: "Exam mode",
    tasks: [
      { id: "d5-m1", label: "Take full mock 1", done: false },
      { id: "d5-m2", label: "Take full mock 2", done: false },
      { id: "d5-m3", label: "Take full mock 3", done: false },
      { id: "d5-w", label: "Review every wrong answer", done: false },
      { id: "d5-f", label: "Final revision sheet", done: false },
    ],
    notes: "Final patching only. No new learning.",
  },
];

const initialScores = {
  mock1: "",
  mock2: "",
  mock3: "",
  mock4: "",
  mock5: "",
  mock6: "",
};

const storageKeys = {
  days: "csa-des-days",
  selectedDay: "csa-des-selected-day",
  scores: "csa-des-scores",
  notes: "csa-des-notes",
};

const pageVariants = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      ease: [0.16, 1, 0.3, 1],
      when: "beforeChildren",
      staggerChildren: 0.08,
    },
  },
};

const revealVariants = {
  hidden: { opacity: 0, y: 28, filter: "blur(12px)" },
  show: (index = 0) => ({
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.65,
      delay: index * 0.06,
      ease: [0.16, 1, 0.3, 1],
    },
  }),
};

const taskVariants = {
  hidden: { opacity: 0, x: -24 },
  show: (index = 0) => ({
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.4,
      delay: index * 0.05,
      ease: [0.16, 1, 0.3, 1],
    },
  }),
  exit: { opacity: 0, x: 24, transition: { duration: 0.2 } },
};

function clampScore(value) {
  if (value === "") return "";

  const numericValue = Number(value);

  if (Number.isNaN(numericValue)) {
    return "";
  }

  return Math.min(100, Math.max(0, numericValue));
}

function makeNote(text, createdAt = new Date().toISOString()) {
  return {
    id:
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
    text,
    createdAt,
  };
}

function readStorage(key, fallback, normalize = (value) => value) {
  if (typeof window === "undefined") {
    return fallback;
  }

  try {
    const rawValue = window.localStorage.getItem(key);

    if (!rawValue) {
      return fallback;
    }

    return normalize(JSON.parse(rawValue));
  } catch {
    return fallback;
  }
}

function normalizeDays(value) {
  if (!Array.isArray(value)) {
    return initialDays;
  }

  const nextDays = initialDays.map((day) => {
    const storedDay = value.find((entry) => entry?.id === day.id);

    if (!storedDay || !Array.isArray(storedDay.tasks)) {
      return day;
    }

    return {
      ...day,
      tasks: day.tasks.map((task) => {
        const storedTask = storedDay.tasks.find((entry) => entry?.id === task.id);

        return storedTask ? { ...task, done: Boolean(storedTask.done) } : task;
      }),
    };
  });

  return nextDays;
}

function normalizeScores(value) {
  if (!value || typeof value !== "object") {
    return initialScores;
  }

  return Object.keys(initialScores).reduce((accumulator, key) => {
    const nextValue = clampScore(value[key]);

    return {
      ...accumulator,
      [key]: nextValue === "" ? "" : String(nextValue),
    };
  }, initialScores);
}

function normalizeSelectedDay(value) {
  const numericValue = Number(value);
  return initialDays.some((day) => day.id === numericValue) ? numericValue : 1;
}

function normalizeNotes(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((note, index) => {
      if (typeof note === "string") {
        const text = note.trim();
        return text ? makeNote(text) : null;
      }

      if (!note || typeof note !== "object") {
        return null;
      }

      const text = String(note.text ?? "").trim();
      if (!text) {
        return null;
      }

      return {
        id: note.id ?? `legacy-note-${index}`,
        text,
        createdAt: note.createdAt ?? new Date().toISOString(),
      };
    })
    .filter(Boolean);
}

function formatTimestamp(value) {
  try {
    return new Intl.DateTimeFormat("en", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(new Date(value));
  } catch {
    return "Just now";
  }
}

function canAnimateCelebrations() {
  return (
    typeof window !== "undefined" &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

function fireConfettiBurst(options = {}) {
  if (!canAnimateCelebrations()) {
    return;
  }

  confetti({
    particleCount: 90,
    spread: 80,
    startVelocity: 38,
    ticks: 260,
    scalar: 1,
    zIndex: 2500,
    ...options,
  });
}

function fireMilestoneConfetti() {
  fireConfettiBurst({
    particleCount: 120,
    spread: 110,
    origin: { x: 0.2, y: 0.45 },
  });

  fireConfettiBurst({
    particleCount: 120,
    spread: 110,
    origin: { x: 0.8, y: 0.45 },
  });
}

function ProgressRing({ value }) {
  const radius = 72;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (circumference * value) / 100;

  return (
    <div className="progress-ring">
      <svg viewBox="0 0 180 180" className="progress-ring__svg" aria-hidden="true">
        <defs>
          <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f8c85f" />
            <stop offset="50%" stopColor="#ff7c5c" />
            <stop offset="100%" stopColor="#4ae2c8" />
          </linearGradient>
        </defs>
        <circle className="progress-ring__track" cx="90" cy="90" r={radius} />
        <motion.circle
          className="progress-ring__meter"
          cx="90"
          cy="90"
          r={radius}
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: dashOffset }}
          transition={{ type: "spring", stiffness: 120, damping: 18 }}
        />
      </svg>
      <div className="progress-ring__content">
        <div className="progress-ring__label">Overall progress</div>
        <motion.div
          key={value}
          className="progress-ring__value"
          initial={{ opacity: 0.2, scale: 0.82, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          {value}%
        </motion.div>
        <div className="progress-ring__caption">Every checked task pushes the ring forward.</div>
      </div>
    </div>
  );
}

function SectionHeading({ eyebrow, title, detail }) {
  return (
    <div className="section-heading">
      <div className="section-heading__eyebrow">{eyebrow}</div>
      <div className="section-heading__title">{title}</div>
      {detail ? <div className="section-heading__detail">{detail}</div> : null}
    </div>
  );
}

function DayCard({ day, isActive, onSelect }) {
  const completedTasks = day.tasks.filter((task) => task.done).length;
  const progress = Math.round((completedTasks / day.tasks.length) * 100);

  return (
    <motion.button
      type="button"
      layout
      onClick={onSelect}
      className={`day-card${isActive ? " day-card--active" : ""}`}
      whileHover={{ y: -4, scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      transition={{ type: "spring", stiffness: 280, damping: 22 }}
    >
      {isActive ? <motion.div layoutId="day-card-highlight" className="day-card__highlight" /> : null}
      <div className="day-card__header">
        <div>
          <div className="day-card__title">{day.title}</div>
          <div className="day-card__focus">{day.focus}</div>
        </div>
        <div className="day-card__percent">{progress}%</div>
      </div>
      <div className="day-card__meta">
        <span>{completedTasks}/{day.tasks.length} finished</span>
        <span>{progress === 100 ? "Locked in" : "In motion"}</span>
      </div>
      <div className="meter">
        <motion.div
          className="meter__fill"
          animate={{ width: `${progress}%` }}
          transition={{ type: "spring", stiffness: 120, damping: 18 }}
        />
      </div>
    </motion.button>
  );
}

function TaskCard({ task, index, onToggle }) {
  return (
    <motion.button
      type="button"
      layout
      custom={index}
      variants={taskVariants}
      initial="hidden"
      animate="show"
      exit="exit"
      onClick={onToggle}
      className={`task-card${task.done ? " task-card--done" : ""}`}
      whileHover={{ scale: 1.01, x: 4 }}
      whileTap={{ scale: 0.995 }}
    >
      <motion.span
        className={`task-card__check${task.done ? " task-card__check--done" : ""}`}
        animate={task.done ? { scale: [1, 1.18, 1] } : { scale: 1 }}
        transition={{ duration: 0.35 }}
      >
        <motion.span
          className="task-card__dot"
          animate={task.done ? { scale: 1, opacity: 1 } : { scale: 0.2, opacity: 0 }}
          transition={{ duration: 0.2 }}
        />
      </motion.span>
      <span className="task-card__label">{task.label}</span>
      <span className="task-card__state">{task.done ? "Done" : "Queued"}</span>
    </motion.button>
  );
}

function MockInput({ label, value, onChange }) {
  const numericValue = value === "" ? 0 : Number(value);

  return (
    <label className="score-card">
      <span className="score-card__label">{label}</span>
      <input
        type="number"
        min="0"
        max="100"
        value={value}
        onChange={onChange}
        placeholder="0-100"
        className="score-card__input"
      />
      <div className="score-card__meter">
        <motion.div
          className="score-card__meter-fill"
          animate={{ width: `${numericValue}%` }}
          transition={{ type: "spring", stiffness: 120, damping: 16 }}
        />
      </div>
    </label>
  );
}

function PracticeQuestionCard({ question, state, onSelect, onReveal }) {
  const selectedOption = state?.selected ?? "";
  const isRevealed = Boolean(state?.revealed || selectedOption);
  const correctOption = question.options.find((option) => option.id === question.correctAnswer);

  return (
    <motion.article
      layout
      className="question-card"
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.35 }}
    >
      <div className="question-card__header">
        <div>
          <div className="question-card__eyebrow">Official sample #{question.number}</div>
          <h3>{question.domain}</h3>
        </div>
        <div className="question-card__badge">
          {selectedOption
            ? selectedOption === question.correctAnswer
              ? "Hit"
              : "Patch"
            : "Live"}
        </div>
      </div>

      <p className="question-card__prompt">{question.question}</p>

      <div className="question-card__options">
        {question.options.map((option) => {
          const isSelected = selectedOption === option.id;
          const isCorrect = option.id === question.correctAnswer;
          const stateClass = !isRevealed
            ? ""
            : isCorrect
              ? " question-option--correct"
              : isSelected
                ? " question-option--wrong"
                : "";

          return (
            <motion.button
              key={option.id}
              type="button"
              className={`question-option${stateClass}`}
              onClick={() => onSelect(question, option.id)}
              whileHover={{ x: 4, scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              disabled={Boolean(selectedOption)}
            >
              <span className="question-option__id">{option.id}</span>
              <span className="question-option__text">{option.text}</span>
            </motion.button>
          );
        })}
      </div>

      <div className="question-card__footer">
        <button type="button" className="question-card__reveal" onClick={() => onReveal(question.id)}>
          {isRevealed ? "Answer visible" : "Reveal answer"}
        </button>

        <AnimatePresence initial={false}>
          {isRevealed ? (
            <motion.div
              key="answer"
              className="question-card__answer"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.24 }}
            >
              Correct answer: <strong>{question.correctAnswer}</strong>
              {correctOption ? ` · ${correctOption.text}` : ""}
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </motion.article>
  );
}

export default function App() {
  const shellRef = useRef(null);
  const previousProgressRef = useRef(null);
  const previousToneRef = useRef(null);
  const completedDayIdsRef = useRef(null);
  const [days, setDays] = useState(() => readStorage(storageKeys.days, initialDays, normalizeDays));
  const [selectedDay, setSelectedDay] = useState(() =>
    readStorage(storageKeys.selectedDay, 1, normalizeSelectedDay)
  );
  const [scores, setScores] = useState(() =>
    readStorage(storageKeys.scores, initialScores, normalizeScores)
  );
  const [savedNotes, setSavedNotes] = useState(() =>
    readStorage(storageKeys.notes, [], normalizeNotes)
  );
  const [questionState, setQuestionState] = useState({});
  const [quickNote, setQuickNote] = useState("");

  useEffect(() => {
    window.localStorage.setItem(storageKeys.days, JSON.stringify(days));
  }, [days]);

  useEffect(() => {
    window.localStorage.setItem(storageKeys.selectedDay, JSON.stringify(selectedDay));
  }, [selectedDay]);

  useEffect(() => {
    window.localStorage.setItem(storageKeys.scores, JSON.stringify(scores));
  }, [scores]);

  useEffect(() => {
    window.localStorage.setItem(storageKeys.notes, JSON.stringify(savedNotes));
  }, [savedNotes]);

  useEffect(() => {
    if (!days.some((day) => day.id === selectedDay)) {
      setSelectedDay(days[0]?.id ?? 1);
    }
  }, [days, selectedDay]);

  const currentDay = days.find((day) => day.id === selectedDay) ?? days[0];

  const allTasks = useMemo(() => days.flatMap((day) => day.tasks), [days]);

  const completedTasks = useMemo(
    () => allTasks.filter((task) => task.done).length,
    [allTasks]
  );

  const overallProgress = useMemo(() => {
    if (!allTasks.length) {
      return 0;
    }

    return Math.round((completedTasks / allTasks.length) * 100);
  }, [allTasks, completedTasks]);

  const mockNumbers = useMemo(
    () =>
      Object.values(scores)
        .map((value) => Number(value))
        .filter((value) => !Number.isNaN(value) && value > 0),
    [scores]
  );

  const mockAverage = useMemo(() => {
    if (!mockNumbers.length) {
      return 0;
    }

    return Math.round(mockNumbers.reduce((total, value) => total + value, 0) / mockNumbers.length);
  }, [mockNumbers]);

  const highestMock = useMemo(() => (mockNumbers.length ? Math.max(...mockNumbers) : 0), [mockNumbers]);

  const readiness = useMemo(() => {
    if (mockAverage >= 85) {
      return {
        title: "Strong pass zone",
        tone: "surge",
        detail: "Keep pressure on mocks. You are in finishing mode.",
      };
    }

    if (mockAverage >= 80) {
      return {
        title: "Safe pass zone",
        tone: "steady",
        detail: "Solid position. Use notes and mocks to close the remaining gaps.",
      };
    }

    if (mockAverage >= 70) {
      return {
        title: "Borderline",
        tone: "warning",
        detail: "Patch weak areas immediately. Accuracy needs to tighten before exam day.",
      };
    }

    if (mockAverage > 0) {
      return {
        title: "Not ready yet",
        tone: "critical",
        detail: "Revise the gaps, then retest. More volume and review are needed.",
      };
    }

    return {
      title: "No mock data yet",
      tone: "idle",
      detail: "Start logging scores and the dashboard will map your readiness.",
    };
  }, [mockAverage]);

  const completedDays = useMemo(
    () => days.filter((day) => day.tasks.every((task) => task.done)).length,
    [days]
  );

  const pendingTasks = allTasks.length - completedTasks;

  const currentDayProgress = useMemo(() => {
    const finished = currentDay.tasks.filter((task) => task.done).length;
    return Math.round((finished / currentDay.tasks.length) * 100);
  }, [currentDay]);

  const nextTarget =
    days.find((day) => day.tasks.some((task) => !task.done) && day.id !== currentDay.id) ?? null;

  const scoreSeries = Object.entries(scores).map(([key, value], index) => ({
    key,
    label: `Mock ${index + 1}`,
    value: value === "" ? 0 : Number(value),
  }));

  const completedDayIds = useMemo(
    () =>
      new Set(
        days.filter((day) => day.tasks.every((task) => task.done)).map((day) => day.id)
      ),
    [days]
  );

  const practiceQuestions = practiceQuestionData.questions;
  const questionSource = practiceQuestionData.source;

  const answeredQuestionCount = useMemo(
    () =>
      practiceQuestions.filter((question) => {
        const selectedOption = questionState[question.id]?.selected;
        return Boolean(selectedOption);
      }).length,
    [practiceQuestions, questionState]
  );

  const correctQuestionCount = useMemo(
    () =>
      practiceQuestions.filter(
        (question) => questionState[question.id]?.selected === question.correctAnswer
      ).length,
    [practiceQuestions, questionState]
  );

  useEffect(() => {
    if (previousProgressRef.current === null) {
      previousProgressRef.current = overallProgress;
      return;
    }

    const milestones = [25, 50, 75, 100];
    const crossedMilestone = milestones.some(
      (milestone) =>
        previousProgressRef.current < milestone && overallProgress >= milestone
    );

    if (crossedMilestone) {
      fireMilestoneConfetti();
    }

    previousProgressRef.current = overallProgress;
  }, [overallProgress]);

  useEffect(() => {
    if (previousToneRef.current === null) {
      previousToneRef.current = readiness.tone;
      return;
    }

    if (previousToneRef.current !== "surge" && readiness.tone === "surge") {
      fireMilestoneConfetti();
    }

    previousToneRef.current = readiness.tone;
  }, [readiness.tone]);

  useEffect(() => {
    if (completedDayIdsRef.current === null) {
      completedDayIdsRef.current = completedDayIds;
      return;
    }

    const unlockedNewDay = [...completedDayIds].some(
      (dayId) => !completedDayIdsRef.current.has(dayId)
    );

    if (unlockedNewDay) {
      fireMilestoneConfetti();
    }

    completedDayIdsRef.current = completedDayIds;
  }, [completedDayIds]);

  const toggleTask = (dayId, taskId) => {
    setDays((previousDays) =>
      previousDays.map((day) =>
        day.id !== dayId
          ? day
          : {
              ...day,
              tasks: day.tasks.map((task) =>
                task.id === taskId ? { ...task, done: !task.done } : task
              ),
            }
      )
    );
  };

  const addQuickNote = () => {
    const text = quickNote.trim();

    if (!text) {
      return;
    }

    setSavedNotes((previousNotes) => [makeNote(text), ...previousNotes]);
    setQuickNote("");
  };

  const removeNote = (noteId) => {
    setSavedNotes((previousNotes) => previousNotes.filter((note) => note.id !== noteId));
  };

  const handleScoreChange = (key, nextValue) => {
    if (nextValue === "") {
      setScores((previousScores) => ({ ...previousScores, [key]: "" }));
      return;
    }

    const clampedValue = clampScore(nextValue);
    setScores((previousScores) => ({
      ...previousScores,
      [key]: clampedValue === "" ? "" : String(clampedValue),
    }));
  };

  const handlePointerMove = (event) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width) * 100;
    const y = ((event.clientY - bounds.top) / bounds.height) * 100;

    shellRef.current?.style.setProperty("--cursor-x", `${x}%`);
    shellRef.current?.style.setProperty("--cursor-y", `${y}%`);
  };

  const handleQuestionSelect = (question, optionId) => {
    if (questionState[question.id]?.selected) {
      return;
    }

    setQuestionState((previousState) => ({
      ...previousState,
      [question.id]: {
        ...previousState[question.id],
        selected: optionId,
        revealed: optionId === question.correctAnswer,
      },
    }));

    if (optionId === question.correctAnswer) {
      fireConfettiBurst({
        particleCount: 110,
        spread: 92,
        origin: { x: 0.5, y: 0.55 },
      });
    }
  };

  const revealQuestionAnswer = (questionId) => {
    setQuestionState((previousState) => ({
      ...previousState,
      [questionId]: {
        ...previousState[questionId],
        revealed: true,
      },
    }));
  };

  return (
    <div
      ref={shellRef}
      className="app-shell"
      onPointerMove={handlePointerMove}
    >
      <div className="ambient ambient--one" />
      <div className="ambient ambient--two" />
      <div className="ambient ambient--three" />
      <div className="ambient-grid" />

      <motion.main className="dashboard" variants={pageVariants} initial="hidden" animate="show">
        <section className="hero-grid">
          <motion.section
            className="panel panel--hero panel--spotlight"
            variants={revealVariants}
            custom={0}
          >
            <div className="hero-copy">
              <div className="hero-copy__eyebrow">5-day attack plan</div>
              <h1>CSA Revision Command Deck</h1>
              <p>
                Revise hard, practice deliberately, and keep every weak area visible until it is
                dead. This version turns the tracker into a live mission board.
              </p>
            </div>

            <div className="hero-tags">
              <span>Practicals</span>
              <span>Mocks</span>
              <span>Patch loops</span>
              <span>Exam mode</span>
            </div>

            <div className="hero-footer">
              <div className="hero-stat">
                <div className="hero-stat__label">Completed days</div>
                <div className="hero-stat__value">{completedDays}/5</div>
              </div>
              <div className="hero-stat">
                <div className="hero-stat__label">Open tasks</div>
                <div className="hero-stat__value">{pendingTasks}</div>
              </div>
              <div className="hero-stat">
                <div className="hero-stat__label">Next target</div>
                <div className="hero-stat__value">{nextTarget ? nextTarget.focus : "Victory lap"}</div>
              </div>
            </div>
          </motion.section>

          <motion.section className="panel panel--ring" variants={revealVariants} custom={1}>
            <ProgressRing value={overallProgress} />
          </motion.section>

          <motion.section className="panel panel--intel" variants={revealVariants} custom={2}>
            <SectionHeading
              eyebrow="Exam heat"
              title={readiness.title}
              detail={readiness.detail}
            />

            <div className="intel-stack">
              <div className="intel-card">
                <span className="intel-card__label">Highest mock</span>
                <span className="intel-card__value">{highestMock || "--"}%</span>
              </div>
              <div className="intel-card">
                <span className="intel-card__label">Weak areas captured</span>
                <span className="intel-card__value">{savedNotes.length}</span>
              </div>
              <div className="intel-card">
                <span className="intel-card__label">Current sprint</span>
                <span className="intel-card__value">{currentDay.focus}</span>
              </div>
            </div>
          </motion.section>
        </section>

        <section className="content-grid">
          <motion.aside className="panel panel--days" variants={revealVariants} custom={3}>
            <SectionHeading
              eyebrow="Plan map"
              title="5-Day Timeline"
              detail="Each card is live. Progress, motion, and focus notes update instantly."
            />

            <LayoutGroup>
              <div className="day-list">
                {days.map((day) => (
                  <DayCard
                    key={day.id}
                    day={day}
                    isActive={selectedDay === day.id}
                    onSelect={() => setSelectedDay(day.id)}
                  />
                ))}
              </div>
            </LayoutGroup>
          </motion.aside>

          <div className="main-column">
            <AnimatePresence mode="wait">
              <motion.section
                key={currentDay.id}
                className="panel panel--focus panel--spotlight"
                initial={{ opacity: 0, y: 30, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -18, scale: 0.98 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="focus-header">
                  <div>
                    <div className="focus-header__eyebrow">{currentDay.title}</div>
                    <h2>{currentDay.focus}</h2>
                    <p>{currentDay.notes}</p>
                  </div>
                  <div className="focus-badge">
                    <span>{currentDay.tasks.filter((task) => task.done).length}</span>
                    <small>of {currentDay.tasks.length} done</small>
                  </div>
                </div>

                <div className="focus-meter">
                  <div className="focus-meter__label">
                    <span>Day pressure</span>
                    <span>{currentDayProgress}%</span>
                  </div>
                  <div className="meter meter--large">
                    <motion.div
                      className="meter__fill"
                      animate={{ width: `${currentDayProgress}%` }}
                      transition={{ type: "spring", stiffness: 110, damping: 18 }}
                    />
                  </div>
                </div>

                <div className="task-list">
                  <AnimatePresence>
                    {currentDay.tasks.map((task, index) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        index={index}
                        onToggle={() => toggleTask(currentDay.id, task.id)}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              </motion.section>
            </AnimatePresence>

            <div className="analytics-grid">
              <motion.section className="panel panel--scores" variants={revealVariants} custom={4}>
                <SectionHeading
                  eyebrow="Mock tracking"
                  title="Score Velocity"
                  detail="Enter every mock score. The bars and readiness state react immediately."
                />

                <div className="scores-grid">
                  {Object.keys(scores).map((key, index) => (
                    <MockInput
                      key={key}
                      label={`Mock ${index + 1}`}
                      value={scores[key]}
                      onChange={(event) => handleScoreChange(key, event.target.value)}
                    />
                  ))}
                </div>

                <div className="bar-chart" aria-label="Mock score bars">
                  {scoreSeries.map((item) => (
                    <div key={item.key} className="bar-chart__item">
                      <div className="bar-chart__well">
                        <motion.div
                          className="bar-chart__fill"
                          animate={{ height: `${item.value}%` }}
                          transition={{ type: "spring", stiffness: 110, damping: 18 }}
                        />
                      </div>
                      <div className="bar-chart__meta">
                        <span>{item.label}</span>
                        <strong>{item.value || "--"}%</strong>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.section>

              <motion.section
                className={`panel panel--readiness panel--${readiness.tone}`}
                variants={revealVariants}
                custom={5}
              >
                <SectionHeading
                  eyebrow="Signal"
                  title="Readiness Meter"
                  detail="Below 70 means you are still building. Above 80 means you are entering pass territory."
                />

                <div className="readiness-orb">
                  <div className="readiness-orb__halo" />
                  <div className="readiness-orb__core">
                    <motion.div
                      key={mockAverage}
                      className="readiness-orb__score"
                      initial={{ opacity: 0.25, y: 16, scale: 0.8 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.35 }}
                    >
                      {mockAverage || "--"}%
                    </motion.div>
                    <div className="readiness-orb__title">{readiness.title}</div>
                  </div>
                </div>

                <div className="thresholds">
                  <div className="thresholds__item">
                    <span>85+</span>
                    <p>Strong zone. Drill speed and accuracy, not new material.</p>
                  </div>
                  <div className="thresholds__item">
                    <span>80-84</span>
                    <p>Safe zone. Keep mocks flowing and clean up repeat misses.</p>
                  </div>
                  <div className="thresholds__item">
                    <span>70-79</span>
                    <p>Borderline. Push review loops and practical corrections now.</p>
                  </div>
                </div>
              </motion.section>
            </div>

            <motion.section className="panel panel--questions" variants={revealVariants} custom={6}>
              <div className="questions-header">
                <SectionHeading
                  eyebrow="Practice lab"
                  title="CSA Sample Questions"
                  detail="These are scraped from the public ServiceNow CSA blueprint sample PDF. Use them as calibration, not as a dump substitute."
                />
                <div className="questions-stats">
                  <span>{correctQuestionCount}/{practiceQuestions.length} correct</span>
                  <span>{answeredQuestionCount} answered</span>
                </div>
              </div>

              <div className="questions-source">
                <span>{questionSource.label}</span>
                <span>Fetched {formatTimestamp(questionSource.fetchedAt)}</span>
                <a href={questionSource.sourceUrl} target="_blank" rel="noreferrer">
                  Source PDF
                </a>
              </div>

              <div className="questions-list">
                {practiceQuestions.map((question) => (
                  <PracticeQuestionCard
                    key={question.id}
                    question={question}
                    state={questionState[question.id]}
                    onSelect={handleQuestionSelect}
                    onReveal={revealQuestionAnswer}
                  />
                ))}
              </div>
            </motion.section>

            <motion.section className="panel panel--notes" variants={revealVariants} custom={7}>
              <div className="notes-header">
                <SectionHeading
                  eyebrow="Capture"
                  title="Weak Area Dump"
                  detail="Dump the problem, move on, and revisit it after the sprint. No context switching."
                />
                <div className="notes-count">{savedNotes.length} logged</div>
              </div>

              <div className="notes-entry">
                <input
                  value={quickNote}
                  onChange={(event) => setQuickNote(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      addQuickNote();
                    }
                  }}
                  placeholder="ACL order still shaky, transform maps need another pass, mock 3 had catalog misses..."
                  className="notes-entry__input"
                />
                <motion.button
                  type="button"
                  className="notes-entry__button"
                  onClick={addQuickNote}
                  whileHover={{ y: -2, scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Add note
                </motion.button>
              </div>

              <div className="notes-list">
                <AnimatePresence initial={false}>
                  {savedNotes.length ? (
                    savedNotes.map((note) => (
                      <motion.article
                        key={note.id}
                        layout
                        initial={{ opacity: 0, y: 18, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -14, scale: 0.92 }}
                        transition={{ duration: 0.3 }}
                        className="note-card"
                      >
                        <div>
                          <div className="note-card__label">{formatTimestamp(note.createdAt)}</div>
                          <div className="note-card__text">{note.text}</div>
                        </div>
                        <button
                          type="button"
                          className="note-card__remove"
                          onClick={() => removeNote(note.id)}
                          aria-label="Remove note"
                        >
                          Clear
                        </button>
                      </motion.article>
                    ))
                  ) : (
                    <motion.div
                      key="empty"
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="notes-empty"
                    >
                      No weak areas logged yet. Start capturing misses from mocks and practical work.
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.section>
          </div>
        </section>
      </motion.main>
    </div>
  );
}

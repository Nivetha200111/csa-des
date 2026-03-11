import confetti from "canvas-confetti";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import FlashcardsPage from "./FlashcardsPage";
import practiceQuestionData from "./data/csaQuestions.json";

const blueprintDomains = [
  {
    id: "domain-1",
    title: "Platform Overview & Navigation",
    weight: "7%",
    labs: [1, 2],
    summary: "Navigation muscle memory, favorites, and role-based perspective changes.",
  },
  {
    id: "domain-2",
    title: "Instance Configuration",
    weight: "10%",
    labs: [3, 4],
    summary: "Plugin activation and form configuration inside the platform UI.",
  },
  {
    id: "domain-3",
    title: "Configuring Applications for Collaboration",
    weight: "20%",
    labs: [5, 6, 7, 8, 9],
    summary: "Lists, templates, task boards, dashboards, and notifications.",
  },
  {
    id: "domain-4",
    title: "Self Service & Automation",
    weight: "20%",
    labs: [10, 11, 12],
    summary: "Knowledge, catalog items, and workflow-based request handling.",
  },
  {
    id: "domain-5",
    title: "Database Management & Security",
    weight: "30%",
    labs: [13, 14, 15, 16, 17],
    summary: "The heaviest section: tables, relationships, ACLs, imports, and CMDB.",
  },
  {
    id: "domain-6",
    title: "Data Migration & Integration",
    weight: "13%",
    labs: [18, 19, 20],
    summary: "Form logic, server logic, and moving config between instances.",
  },
];

const labSyllabus = [
  {
    number: 1,
    title: "Instance Navigation",
    domainId: "domain-1",
    duration: "20 min",
    goal: "Understand the platform UI and the fastest ways to move around it.",
    tasks: [
      "Use the Application Navigator to open the Incident list and User table.",
      "Switch between All and Favorites.",
      "Add Incident → All to favorites.",
    ],
    concepts: ["Navigation", "Application modules", "Favorites"],
  },
  {
    number: 2,
    title: "Impersonation",
    domainId: "domain-1",
    duration: "20 min",
    goal: "See how the same instance behaves under different user roles and contexts.",
    tasks: [
      "Open Users and impersonate another user.",
      "Create an Incident while impersonating them.",
      "Return to the admin session and compare the experience.",
    ],
    concepts: ["User context", "Role-based experience"],
  },
  {
    number: 3,
    title: "Install a Plugin",
    domainId: "domain-2",
    duration: "20 min",
    goal: "Learn how features are activated and added to an instance.",
    tasks: [
      "Navigate to System Definition → Plugins.",
      "Search for Knowledge Management.",
      "Activate it and confirm the new capability is available.",
    ],
    concepts: ["Plugins", "Feature activation", "Instance capabilities"],
  },
  {
    number: 4,
    title: "Personalize a Form",
    domainId: "domain-2",
    duration: "20 min",
    goal: "Get comfortable changing the layout of a live form.",
    tasks: [
      "Open an Incident.",
      "Use Configure → Form Layout.",
      "Add a field and verify it appears where you expect.",
    ],
    concepts: ["Form personalization", "Dictionary fields", "UI customization"],
  },
  {
    number: 5,
    title: "Create and Use Filters",
    domainId: "domain-3",
    duration: "20 min",
    goal: "Build list filters quickly and save useful views for repeated use.",
    tasks: [
      "Open the Incident list.",
      "Filter Priority = 1.",
      "Save the filter as a favorite.",
    ],
    concepts: ["Lists", "Filters", "Query builder", "Favorites"],
  },
  {
    number: 6,
    title: "Form Templates",
    domainId: "domain-3",
    duration: "25 min",
    goal: "Use templates to speed up repeat record creation.",
    tasks: [
      "Open the Incident form.",
      "Create a Hardware Issue Template.",
      "Pre-fill Category = Hardware and Priority = 3.",
    ],
    concepts: ["Templates", "Form reuse", "Record creation shortcuts"],
  },
  {
    number: 7,
    title: "Visual Task Board",
    domainId: "domain-3",
    duration: "25 min",
    goal: "Use ServiceNow’s kanban-style board to move work across stages.",
    tasks: [
      "Open Visual Task Boards.",
      "Create a board from the Incident table.",
      "Move records across columns.",
    ],
    concepts: ["Task management", "Kanban boards", "Collaboration"],
  },
  {
    number: 8,
    title: "Create a Dashboard",
    domainId: "domain-3",
    duration: "30 min",
    goal: "Build a basic reporting surface for open work and priority spread.",
    tasks: [
      "Go to Self-Service → Dashboards.",
      "Create an Incident Monitoring dashboard.",
      "Add widgets for open incidents and incidents by priority.",
    ],
    concepts: ["Reporting", "Data visualization", "Dashboards"],
  },
  {
    number: 9,
    title: "Notifications",
    domainId: "domain-3",
    duration: "25 min",
    goal: "Trigger email output from record conditions.",
    tasks: [
      "Open System Notification → Email → Notifications.",
      "Create a notification for Incident Priority = 1.",
      "Verify the rule conditions and target audience.",
    ],
    concepts: ["Event-driven notifications", "Email alerts", "Automation basics"],
  },
  {
    number: 10,
    title: "Knowledge Base Article",
    domainId: "domain-4",
    duration: "20 min",
    goal: "Publish a self-service answer into knowledge.",
    tasks: [
      "Navigate to Knowledge → Articles.",
      "Create How to reset password.",
      "Publish the article.",
    ],
    concepts: ["Knowledge management", "Self-service support"],
  },
  {
    number: 11,
    title: "Create Service Catalog Item",
    domainId: "domain-4",
    duration: "35 min",
    goal: "Build a request item that behaves like a real catalog offering.",
    tasks: [
      "Open Service Catalog → Maintain Items.",
      "Create Request New Laptop.",
      "Add variables for RAM, Storage, and Model.",
    ],
    concepts: ["Service catalog", "User request system"],
  },
  {
    number: 12,
    title: "Workflow in Workflow Studio",
    domainId: "domain-4",
    duration: "35 min",
    goal: "Model a simple request flow from submission to fulfillment.",
    tasks: [
      "Open Workflow Studio.",
      "Create a flow named New Laptop Request.",
      "Build Request → Approval → Fulfillment steps.",
    ],
    concepts: ["Automation", "Process design", "Workflows"],
  },
  {
    number: 13,
    title: "Create a Table",
    domainId: "domain-5",
    duration: "30 min",
    goal: "Practice schema creation and field definition from scratch.",
    tasks: [
      "Create a table named Employee Assets.",
      "Add fields asset_name, owner, and purchase_date.",
      "Verify the table and dictionary entries were created.",
    ],
    concepts: ["Tables", "Schema", "Dictionary"],
  },
  {
    number: 14,
    title: "Table Relationships",
    domainId: "domain-5",
    duration: "20 min",
    goal: "Link custom data to core platform records correctly.",
    tasks: [
      "Add a reference field owner to the Employee Assets table.",
      "Point the reference to sys_user.",
      "Confirm reference lookups work on the form.",
    ],
    concepts: ["Reference fields", "Table relationships"],
  },
  {
    number: 15,
    title: "Access Control (ACL)",
    domainId: "domain-5",
    duration: "35 min",
    goal: "Enforce table security using roles and access rules.",
    tasks: [
      "Create a read ACL for the Employee Assets table.",
      "Limit access to the IT Admin role.",
      "Test the result with impersonation.",
    ],
    concepts: ["ACL", "Security", "Role-based access"],
  },
  {
    number: 16,
    title: "Import Data",
    domainId: "domain-5",
    duration: "35 min",
    goal: "Bring external data into ServiceNow with matching logic.",
    tasks: [
      "Upload a CSV with name, email, and department fields.",
      "Create an Import Set and Transform Map.",
      "Set Coalesce = email and run the transform.",
    ],
    concepts: ["Data import", "Coalesce", "Transform maps"],
  },
  {
    number: 17,
    title: "CMDB Exploration",
    domainId: "domain-5",
    duration: "20 min",
    goal: "Recognize where infrastructure classes live and how they are organized.",
    tasks: [
      "Navigate to CMDB → CI Classes.",
      "Inspect Server, Application, and Database classes.",
      "Trace how classes relate inside the model.",
    ],
    concepts: ["Configuration items", "Infrastructure modeling"],
  },
  {
    number: 18,
    title: "UI Policy",
    domainId: "domain-6",
    duration: "25 min",
    goal: "Change form behavior dynamically on the client side.",
    tasks: [
      "Create a UI Policy on Incident.",
      "If State = Resolved, make Resolution notes mandatory.",
      "Test the behavior on the form.",
    ],
    concepts: ["UI Policies", "Form logic"],
  },
  {
    number: 19,
    title: "Business Rule",
    domainId: "domain-6",
    duration: "30 min",
    goal: "Automate server-side behavior when records change.",
    tasks: [
      "Create a Business Rule on Incident.",
      "If Priority = 1, assign to Major Incident Team.",
      "Test with a record update.",
    ],
    concepts: ["Server-side automation", "Business rules"],
  },
  {
    number: 20,
    title: "Update Sets",
    domainId: "domain-6",
    duration: "20 min",
    goal: "Track and package platform changes for movement between instances.",
    tasks: [
      "Create an update set named CSA Training Changes.",
      "Make a form change.",
      "Verify the update set captured it.",
    ],
    concepts: ["Change tracking", "Instance migration"],
  },
];

const highestImpactLabs = [13, 15, 16, 11, 18, 19, 5, 8];

const labIndex = Object.fromEntries(labSyllabus.map((lab) => [lab.number, lab]));

function createTask(id, label, kind = "drill", labNumber = null) {
  return {
    id,
    label,
    done: false,
    kind,
    ...(labNumber ? { labNumber } : {}),
  };
}

const initialDays = [
  {
    id: 1,
    title: "Day 1",
    focus: "Platform foundations + collaboration basics",
    timebox: "2.5-3 hours",
    labs: [1, 2, 3, 4, 5],
    domains: [
      "Domain 1 · Platform Overview & Navigation (7%)",
      "Domain 2 · Instance Configuration (10%)",
      "Domain 3 · Collaboration kickoff",
    ],
    notes:
      "Build navigation speed first, then lock in plugin activation, form layout, and saved filters.",
    deliverable:
      "You should finish with a configured instance, favorites set up, and list filtering wired into muscle memory.",
    tasks: [
      createTask("d1-l1", "Lab 1 - Instance Navigation", "lab", 1),
      createTask("d1-l2", "Lab 2 - Impersonation", "lab", 2),
      createTask("d1-l3", "Lab 3 - Install the Knowledge Management plugin", "lab", 3),
      createTask("d1-l4", "Lab 4 - Personalize the Incident form", "lab", 4),
      createTask("d1-l5", "Lab 5 - Build and save Priority 1 filters", "lab", 5),
      createTask("d1-r1", "Run one short glossary Anki sprint on weak terms"),
      createTask("d1-r2", "Finish with a 10-15 question checkpoint quiz"),
    ],
  },
  {
    id: 2,
    title: "Day 2",
    focus: "Collaboration + self-service buildout",
    timebox: "3 hours",
    labs: [6, 7, 8, 9, 10, 11],
    domains: [
      "Domain 3 · Configuring Applications for Collaboration (20%)",
      "Domain 4 · Self Service & Automation (20%)",
    ],
    notes:
      "This is the workspace day: templates, task boards, dashboards, notifications, knowledge, and catalog.",
    deliverable:
      "You should leave with visible collaboration artifacts and one complete service request experience.",
    tasks: [
      createTask("d2-l6", "Lab 6 - Create the Hardware Issue template", "lab", 6),
      createTask("d2-l7", "Lab 7 - Build an Incident visual task board", "lab", 7),
      createTask("d2-l8", "Lab 8 - Create the Incident Monitoring dashboard", "lab", 8),
      createTask("d2-l9", "Lab 9 - Configure a Priority 1 notification", "lab", 9),
      createTask("d2-l10", "Lab 10 - Publish a password reset article", "lab", 10),
      createTask("d2-l11", "Lab 11 - Create the Request New Laptop catalog item", "lab", 11),
      createTask("d2-r1", "Review Day 1 misses before moving on"),
      createTask("d2-r2", "Do one short mock focused on lists, forms, and self-service"),
    ],
  },
  {
    id: 3,
    title: "Day 3",
    focus: "Automation + database security heavy lift",
    timebox: "3-3.5 hours",
    labs: [12, 13, 14, 15, 16],
    domains: [
      "Domain 4 · Workflow automation",
      "Domain 5 · Database Management & Security (30%)",
    ],
    notes:
      "This is the highest-yield lab day. Most exam weight lives here, so treat it like a PDI build sprint.",
    deliverable:
      "You should have one custom table, one reference, one ACL, one import pipeline, and one workflow working end-to-end.",
    tasks: [
      createTask("d3-l12", "Lab 12 - Build the New Laptop Request flow", "lab", 12),
      createTask("d3-l13", "Lab 13 - Create the Employee Assets table", "lab", 13),
      createTask("d3-l14", "Lab 14 - Add the owner reference to sys_user", "lab", 14),
      createTask("d3-l15", "Lab 15 - Create and test the read ACL", "lab", 15),
      createTask("d3-l16", "Lab 16 - Import CSV data with coalesce on email", "lab", 16),
      createTask("d3-r1", "Log every weak spot immediately in the note dump"),
      createTask("d3-r2", "Take one full mock after the lab block"),
    ],
  },
  {
    id: 4,
    title: "Day 4",
    focus: "CMDB + integration + exam lock-in",
    timebox: "3 hours",
    labs: [17, 18, 19, 20],
    domains: [
      "Domain 5 · CMDB review and security cleanup",
      "Domain 6 · Data Migration & Integration (13%)",
    ],
    notes:
      "Close the remaining blueprint gaps, then switch into exam mode: redo misses, review mocks, and finalise your patch sheet.",
    deliverable:
      "You should finish with every blueprint domain touched, an update set captured, and one final round of corrected weak areas.",
    tasks: [
      createTask("d4-l17", "Lab 17 - Explore Server, Application, and Database CI classes", "lab", 17),
      createTask("d4-l18", "Lab 18 - Create the Resolved state UI Policy", "lab", 18),
      createTask("d4-l19", "Lab 19 - Build the Priority 1 Business Rule", "lab", 19),
      createTask("d4-l20", "Lab 20 - Capture changes in an update set", "lab", 20),
      createTask("d4-r1", "Redo the highest-impact labs you stumbled on"),
      createTask("d4-r2", "Take one final mock and review every wrong answer"),
      createTask("d4-r3", "Write a one-page final patch sheet"),
    ],
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

function ProgressRing({
  value,
  label = "Overall progress",
  caption = "Every checked task pushes the ring forward.",
}) {
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
        <div className="progress-ring__label">{label}</div>
        <motion.div
          key={value}
          className="progress-ring__value"
          initial={{ opacity: 0.2, scale: 0.82, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          {value}%
        </motion.div>
        <div className="progress-ring__caption">{caption}</div>
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

function DomainBlueprintCard({ domain }) {
  const domainLabs = domain.labs.map((number) => labIndex[number]).filter(Boolean);

  return (
    <article className="syllabus-domain">
      <div className="syllabus-domain__header">
        <div>
          <div className="syllabus-domain__eyebrow">Blueprint domain</div>
          <h3>{domain.title}</h3>
        </div>
        <div className="syllabus-domain__weight">{domain.weight}</div>
      </div>

      <p className="syllabus-domain__summary">{domain.summary}</p>

      <div className="syllabus-domain__labs">
        {domainLabs.map((lab) => (
          <div key={lab.number} className="syllabus-domain__lab">
            <span>{`Lab ${lab.number}`}</span>
            <strong>{lab.title}</strong>
          </div>
        ))}
      </div>
    </article>
  );
}

function LabGuideCard({ lab }) {
  return (
    <article className="lab-guide-card">
      <div className="lab-guide-card__header">
        <div>
          <div className="lab-guide-card__eyebrow">{`Lab ${lab.number}`}</div>
          <h3>{lab.title}</h3>
        </div>
        <div className="lab-guide-card__duration">{lab.duration}</div>
      </div>

      <p className="lab-guide-card__goal">{lab.goal}</p>

      <ul className="lab-guide-card__tasks">
        {lab.tasks.map((task) => (
          <li key={task}>{task}</li>
        ))}
      </ul>

      <div className="lab-guide-card__concepts">
        {lab.concepts.map((concept) => (
          <span key={concept} className="lab-guide-card__concept">
            {concept}
          </span>
        ))}
      </div>
    </article>
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
        <span>{day.timebox ?? (progress === 100 ? "Locked in" : "In motion")}</span>
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
  const idleLabel = task.labNumber ? `Lab ${task.labNumber}` : task.kind === "lab" ? "Lab" : "Drill";

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
      <span className="task-card__state">{task.done ? "Done" : idleLabel}</span>
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
  const [activeView, setActiveView] = useState(() =>
    typeof window !== "undefined" && window.location.hash === "#flashcards"
      ? "flashcards"
      : "tracker"
  );

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    const syncViewFromHash = () => {
      setActiveView(window.location.hash === "#flashcards" ? "flashcards" : "tracker");
    };

    window.addEventListener("hashchange", syncViewFromHash);
    return () => window.removeEventListener("hashchange", syncViewFromHash);
  }, []);

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
  const totalLabCount = labSyllabus.length;
  const highImpactLabDetails = useMemo(
    () => highestImpactLabs.map((number) => labIndex[number]).filter(Boolean),
    []
  );
  const currentDayLabs = useMemo(
    () => (currentDay?.labs ?? []).map((number) => labIndex[number]).filter(Boolean),
    [currentDay]
  );

  const completedTasks = useMemo(
    () => allTasks.filter((task) => task.done).length,
    [allTasks]
  );

  const completedLabCount = useMemo(
    () => allTasks.filter((task) => task.kind === "lab" && task.done).length,
    [allTasks]
  );

  const completedDomainCount = useMemo(
    () =>
      blueprintDomains.filter((domain) =>
        domain.labs.every((labNumber) =>
          allTasks.some((task) => task.labNumber === labNumber && task.done)
        )
      ).length,
    [allTasks]
  );

  const remainingLabCount = totalLabCount - completedLabCount;

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

  const currentDayCompletedLabs = useMemo(
    () => currentDay.tasks.filter((task) => task.kind === "lab" && task.done).length,
    [currentDay]
  );

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

  const switchView = (view) => {
    setActiveView(view);

    if (typeof window !== "undefined") {
      const nextHash = view === "flashcards" ? "#flashcards" : "#tracker";
      window.history.replaceState(null, "", nextHash);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
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

      <div className="view-switch">
        <button
          type="button"
          className={`view-switch__button${activeView === "tracker" ? " view-switch__button--active" : ""}`}
          onClick={() => switchView("tracker")}
        >
          Revision tracker
        </button>
        <button
          type="button"
          className={`view-switch__button${activeView === "flashcards" ? " view-switch__button--active" : ""}`}
          onClick={() => switchView("flashcards")}
        >
          Glossary flashcards
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeView === "tracker" ? (
          <motion.main
            key="tracker"
            className="dashboard"
            variants={pageVariants}
            initial="hidden"
            animate="show"
            exit={{ opacity: 0, y: -18 }}
          >
            <section className="hero-grid">
              <motion.section
                className="panel panel--hero panel--spotlight"
                variants={revealVariants}
                custom={0}
              >
                <div className="hero-copy">
                  <div className="hero-copy__eyebrow">CSA practical bootcamp</div>
                  <h1>CSA 4-Day War Plan</h1>
                  <p>
                    Stop reading passively. This tracker turns the blueprint into a 20-lab PDI
                    syllabus mapped to the exact domain weights, then layers mocks and patch loops
                    on top.
                  </p>
                </div>

                <div className="hero-tags">
                  <span>20 labs</span>
                  <span>6 domains</span>
                  <span>10-12 hours</span>
                  <span>Hands-on first</span>
                </div>

                <div className="hero-footer">
                  <div className="hero-stat">
                    <div className="hero-stat__label">Completed days</div>
                    <div className="hero-stat__value">{completedDays}/4</div>
                  </div>
                  <div className="hero-stat">
                    <div className="hero-stat__label">Labs left</div>
                    <div className="hero-stat__value">{remainingLabCount}</div>
                  </div>
                  <div className="hero-stat">
                    <div className="hero-stat__label">Next block</div>
                    <div className="hero-stat__value">{nextTarget ? nextTarget.title : "Final review"}</div>
                  </div>
                </div>
              </motion.section>

              <motion.section className="panel panel--ring" variants={revealVariants} custom={1}>
                <ProgressRing
                  value={overallProgress}
                  caption="Each finished lab, mock, and review loop moves the bootcamp forward."
                />
              </motion.section>

              <motion.section className="panel panel--intel" variants={revealVariants} custom={2}>
                <SectionHeading
                  eyebrow="Blueprint heat"
                  title="Coverage Snapshot"
                  detail="This is a domain-weighted build path. Database and security labs carry the most exam weight."
                />

                <div className="intel-stack">
                  <div className="intel-card">
                    <span className="intel-card__label">Domains closed</span>
                    <span className="intel-card__value">{completedDomainCount}/6</span>
                  </div>
                  <div className="intel-card">
                    <span className="intel-card__label">Labs completed</span>
                    <span className="intel-card__value">{completedLabCount}/20</span>
                  </div>
                  <div className="intel-card">
                    <span className="intel-card__label">Highest mock</span>
                    <span className="intel-card__value">{highestMock || "--"}%</span>
                  </div>
                </div>
              </motion.section>
            </section>

            <section className="content-grid">
              <motion.aside className="panel panel--days" variants={revealVariants} custom={3}>
                <SectionHeading
                  eyebrow="War plan"
                  title="4-Day Bootcamp"
                  detail="Each day mixes PDI labs, short review loops, and mock calibration."
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

                <div className="plan-footnote">
                  <strong>Fastest path:</strong> the 8 highest-impact labs cover roughly 70% of the
                  exam’s practical value.
                </div>
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
                        <div className="focus-header__eyebrow">
                          {currentDay.title} · {currentDay.timebox}
                        </div>
                        <h2>{currentDay.focus}</h2>
                        <p>{currentDay.notes}</p>
                      </div>
                      <div className="focus-badge">
                        <span>{currentDayCompletedLabs}</span>
                        <small>of {currentDay.labs.length} labs done</small>
                      </div>
                    </div>

                    <div className="focus-domains">
                      {currentDay.domains.map((domain) => (
                        <span key={domain}>{domain}</span>
                      ))}
                    </div>

                    <div className="focus-meter">
                      <div className="focus-meter__label">
                        <span>Day completion</span>
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

                    <div className="focus-deliverable">
                      <div className="focus-deliverable__label">Deliverable</div>
                      <p>{currentDay.deliverable}</p>
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
                  <motion.section className="panel panel--syllabus" variants={revealVariants} custom={4}>
                    <SectionHeading
                      eyebrow="Blueprint map"
                      title="Domain Coverage"
                      detail="This is the exact CSA blueprint converted into hands-on labs."
                    />

                    <div className="syllabus-domain-grid">
                      {blueprintDomains.map((domain) => (
                        <DomainBlueprintCard key={domain.id} domain={domain} />
                      ))}
                    </div>
                  </motion.section>

                  <motion.section className="panel panel--impact" variants={revealVariants} custom={5}>
                    <SectionHeading
                      eyebrow="Highest yield"
                      title="Impact Labs"
                      detail="If time compresses, these are the labs to protect first."
                    />

                    <div className="impact-labs">
                      {highImpactLabDetails.map((lab) => (
                        <div key={lab.number} className="impact-lab">
                          <span className="impact-lab__eyebrow">{`Lab ${lab.number}`}</span>
                          <strong className="impact-lab__title">{lab.title}</strong>
                          <div className="impact-lab__meta">
                            <span>{lab.duration}</span>
                            <span>{blueprintDomains.find((domain) => domain.id === lab.domainId)?.weight}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.section>
                </div>

                <motion.section className="panel panel--lab-guide" variants={revealVariants} custom={6}>
                  <div className="questions-header">
                    <SectionHeading
                      eyebrow="Today's lab block"
                      title={`${currentDay.title} Practical Labs`}
                      detail="Each lab should take about 20-40 minutes in your PDI."
                    />
                    <div className="questions-stats">
                      <span>{currentDayLabs.length} labs today</span>
                      <span>{currentDay.domains.length} domain lanes</span>
                    </div>
                  </div>

                  <div className="lab-guide-grid">
                    {currentDayLabs.map((lab) => (
                      <LabGuideCard key={lab.number} lab={lab} />
                    ))}
                  </div>
                </motion.section>

                <div className="analytics-grid">
                  <motion.section className="panel panel--scores" variants={revealVariants} custom={7}>
                    <SectionHeading
                      eyebrow="Mock calibration"
                      title="Score Velocity"
                      detail="Use mocks after the lab blocks, not instead of them."
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
                    custom={8}
                  >
                    <SectionHeading
                      eyebrow="Exam signal"
                      title="Readiness Meter"
                      detail="Labs build the floor. Mocks tell you if the ceiling is high enough."
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
                        <p>Strong zone. Drill accuracy, timing, and cleanup only.</p>
                      </div>
                      <div className="thresholds__item">
                        <span>80-84</span>
                        <p>Safe zone. Protect high-impact labs and tighten repeat misses.</p>
                      </div>
                      <div className="thresholds__item">
                        <span>70-79</span>
                        <p>Borderline. Repeat the weak practicals before the next mock.</p>
                      </div>
                    </div>
                  </motion.section>
                </div>

                <motion.section className="panel panel--questions" variants={revealVariants} custom={9}>
                  <div className="questions-header">
                    <SectionHeading
                      eyebrow="Calibration"
                      title="CSA Sample Questions"
                      detail="Use these after your labs to validate recall. They are not a substitute for PDI work."
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

                <motion.section className="panel panel--notes" variants={revealVariants} custom={10}>
                  <div className="notes-header">
                    <SectionHeading
                      eyebrow="Patch sheet"
                      title="Weak Area Dump"
                      detail="Log misses from labs and mocks immediately so Day 4 becomes pure cleanup."
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
                      placeholder="ACL order still shaky, import coalesce setup slipped, dashboard widgets need another pass..."
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
                          No weak areas logged yet. Capture misses from labs, mocks, and sample questions.
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.section>
              </div>
            </section>
          </motion.main>
        ) : (
          <FlashcardsPage key="flashcards" onBack={() => switchView("tracker")} />
        )}
      </AnimatePresence>
    </div>
  );
}

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";

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

const STORAGE_KEY = "csa-blueprint-checklist";

function readChecklist() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return typeof parsed === "object" && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
}

const pageVariants = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      ease: [0.16, 1, 0.3, 1],
      when: "beforeChildren",
      staggerChildren: 0.06,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 28, filter: "blur(12px)" },
  show: (index = 0) => ({
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.65,
      delay: index * 0.07,
      ease: [0.16, 1, 0.3, 1],
    },
  }),
};

const topicVariants = {
  hidden: { opacity: 0, x: -18 },
  show: (index = 0) => ({
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.35,
      delay: index * 0.04,
      ease: [0.16, 1, 0.3, 1],
    },
  }),
};

export default function BlueprintChecklist({ onBack }) {
  const [checked, setChecked] = useState(readChecklist);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(checked));
  }, [checked]);

  const totalTopics = useMemo(
    () => examBlueprint.reduce((sum, d) => sum + d.topics.length, 0),
    []
  );

  const completedTopics = useMemo(
    () => Object.values(checked).filter(Boolean).length,
    [checked]
  );

  const overallPercent = totalTopics
    ? Math.round((completedTopics / totalTopics) * 100)
    : 0;

  const toggle = (topicId) => {
    setChecked((prev) => ({ ...prev, [topicId]: !prev[topicId] }));
  };

  const domainProgress = (domain) => {
    const done = domain.topics.filter((t) => checked[t.id]).length;
    return { done, total: domain.topics.length, percent: Math.round((done / domain.topics.length) * 100) };
  };

  const resetAll = () => setChecked({});

  return (
    <motion.main
      key="blueprint"
      className="dashboard blueprint-page"
      variants={pageVariants}
      initial="hidden"
      animate="show"
      exit={{ opacity: 0, y: -18 }}
    >
      {/* Hero */}
      <motion.section className="panel panel--hero panel--spotlight blueprint-hero" variants={cardVariants} custom={0}>
        <div className="hero-copy">
          <div className="hero-copy__eyebrow">CSA exam blueprint</div>
          <h1 className="blueprint-hero__title">Topic Checklist</h1>
          <p>
            Track every exam topic across all 6 domains. Check them off as you study —
            your progress is saved automatically.
          </p>
        </div>

        <div className="blueprint-hero__stats">
          <div className="blueprint-stat">
            <span className="blueprint-stat__value">{completedTopics}/{totalTopics}</span>
            <span className="blueprint-stat__label">Topics covered</span>
          </div>
          <div className="blueprint-stat">
            <span className="blueprint-stat__value">{overallPercent}%</span>
            <span className="blueprint-stat__label">Overall progress</span>
          </div>
          <div className="blueprint-stat">
            <span className="blueprint-stat__value">
              {examBlueprint.filter((d) => domainProgress(d).percent === 100).length}/6
            </span>
            <span className="blueprint-stat__label">Domains complete</span>
          </div>
        </div>

        <div className="blueprint-hero__meter">
          <div className="blueprint-hero__meter-label">
            <span>Blueprint completion</span>
            <span>{overallPercent}%</span>
          </div>
          <div className="meter meter--large">
            <motion.div
              className="meter__fill"
              animate={{ width: `${overallPercent}%` }}
              transition={{ type: "spring", stiffness: 110, damping: 18 }}
            />
          </div>
        </div>

        {completedTopics > 0 && (
          <motion.button
            type="button"
            className="blueprint-reset"
            onClick={resetAll}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Reset all
          </motion.button>
        )}
      </motion.section>

      {/* Domain cards */}
      <div className="blueprint-grid">
        {examBlueprint.map((domain, domainIndex) => {
          const progress = domainProgress(domain);
          const isComplete = progress.percent === 100;

          return (
            <motion.section
              key={domain.id}
              className={`panel blueprint-domain-card${isComplete ? " blueprint-domain-card--done" : ""}`}
              variants={cardVariants}
              custom={domainIndex + 1}
            >
              <div className="blueprint-domain-card__header">
                <div>
                  <div className="blueprint-domain-card__eyebrow">Domain {domain.domain}</div>
                  <h2 className="blueprint-domain-card__title">{domain.title}</h2>
                </div>
                <div className="blueprint-domain-card__weight">{domain.weight}%</div>
              </div>

              <div className="blueprint-domain-card__progress">
                <div className="blueprint-domain-card__progress-label">
                  <span>{progress.done}/{progress.total} topics</span>
                  <span>{progress.percent}%</span>
                </div>
                <div className="meter">
                  <motion.div
                    className="meter__fill"
                    animate={{ width: `${progress.percent}%` }}
                    transition={{ type: "spring", stiffness: 120, damping: 18 }}
                  />
                </div>
              </div>

              <div className="blueprint-topic-list">
                {domain.topics.map((topic, topicIndex) => (
                  <motion.button
                    key={topic.id}
                    type="button"
                    className={`blueprint-topic${checked[topic.id] ? " blueprint-topic--done" : ""}`}
                    onClick={() => toggle(topic.id)}
                    variants={topicVariants}
                    custom={topicIndex}
                    initial="hidden"
                    animate="show"
                    whileHover={{ scale: 1.01, x: 4 }}
                    whileTap={{ scale: 0.995 }}
                  >
                    <motion.span
                      className={`blueprint-topic__check${checked[topic.id] ? " blueprint-topic__check--done" : ""}`}
                      animate={checked[topic.id] ? { scale: [1, 1.2, 1] } : { scale: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <motion.span
                        className="blueprint-topic__dot"
                        animate={checked[topic.id] ? { scale: 1, opacity: 1 } : { scale: 0.2, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      />
                    </motion.span>
                    <span className="blueprint-topic__label">{topic.label}</span>
                    <span className="blueprint-topic__state">
                      {checked[topic.id] ? "Done" : "Pending"}
                    </span>
                  </motion.button>
                ))}
              </div>
            </motion.section>
          );
        })}
      </div>
    </motion.main>
  );
}


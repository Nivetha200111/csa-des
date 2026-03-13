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

/* Topics already finished before the plan starts */
const preCheckedTopics = ["bp-5-3", "bp-5-4"];

const studyPlan = [
  {
    id: "eve",
    day: "Evening Before",
    timeLabel: "4 hours · 8 PM – midnight",
    color: "ice",
    blocks: [
      {
        id: "eve-1",
        time: "8:00 – 9:00 PM",
        duration: "1 hr",
        domainRef: null,
        title: "Platform & Config Warm-up",
        weight: null,
        strategy: "Start with the lightest material while your brain is warming up. Mix platform navigation with plugin activation so it doesn't feel monotonous. Get the Application Navigator into muscle memory.",
        topicIds: ["bp-1-1", "bp-2-1", "bp-1-4", "bp-6-1"],
      },
      {
        id: "eve-2",
        time: "9:10 – 10:10 PM",
        duration: "1 hr",
        domainRef: null,
        title: "Instance Behaviour & Logic",
        weight: null,
        strategy: "Now that you've seen the platform, dig into how the instance behaves. Pair personalisation with Business Rules — both change how forms work, but one is client-side and the other server-side. Drill that difference hard.",
        topicIds: ["bp-1-3", "bp-2-2", "bp-6-2", "bp-2-3"],
      },
      {
        id: "eve-3",
        time: "10:20 – 11:20 PM",
        duration: "1 hr",
        domainRef: null,
        title: "Capabilities & Migration",
        weight: null,
        strategy: "Understand what the platform can do at a high level, then pivot to how changes move between instances. Update sets are heavily tested — know the lifecycle end-to-end. Scripting basics: know when GlideRecord runs server-side vs client scripts.",
        topicIds: ["bp-1-2", "bp-6-3", "bp-6-4"],
      },
      {
        id: "eve-review",
        time: "11:20 PM – midnight",
        duration: "40 min",
        domainRef: null,
        title: "Evening Review Pass",
        weight: null,
        strategy: "Quick flashcard run through all 11 topics you just covered. Write down anything that didn't stick on your patch sheet. Sleep on it — consolidation happens overnight.",
        topicIds: [],
      },
    ],
    summary: "You'll finish the evening with D1 complete, D2 complete, and D6 complete — that's 30% of the exam locked in before bed.",
  },
  {
    id: "main",
    day: "Main Day",
    timeLabel: "Full day · 9 AM – 8 PM",
    color: "gold",
    blocks: [
      {
        id: "main-1",
        time: "9:00 – 10:30 AM",
        duration: "1.5 hrs",
        domainRef: null,
        title: "Forms, Lists & Schema",
        weight: null,
        strategy: "Start with how data is structured (Data Schema) then immediately see it in action through lists and forms. This bridges D5 and D3 naturally. Understand field types, table inheritance, and how the dictionary works.",
        topicIds: ["bp-5-1", "bp-3-1", "bp-3-2", "bp-3-3", "bp-3-4"],
      },
      {
        id: "main-2",
        time: "10:40 AM – 12:00 PM",
        duration: "1 hr 20 min",
        domainRef: null,
        title: "Advanced Config & Access Control",
        weight: null,
        strategy: "Deep-dive into advanced forms, then switch to ACLs while form context is fresh — you'll understand what ACLs protect because you just built the forms. Pair with task management since tasks are what ACLs often guard.",
        topicIds: ["bp-3-5", "bp-5-2", "bp-3-6", "bp-3-7"],
      },
      {
        id: "main-break",
        time: "12:00 – 1:00 PM",
        duration: "1 hr",
        domainRef: null,
        title: "Lunch Break",
        weight: null,
        strategy: "Eat properly. Skim your evening-before notes once — passive reinforcement for D1, D2, D6. Don't study new material during lunch.",
        topicIds: [],
      },
      {
        id: "main-3",
        time: "1:00 – 3:00 PM",
        duration: "2 hrs",
        domainRef: null,
        title: "Self Service & Dashboards",
        weight: null,
        strategy: "Knowledge articles feed the Service Catalog portal. Study them together so you see the self-service loop. Then build dashboards and notifications — these are the reporting/alerting layer on top of everything you've built.",
        topicIds: ["bp-4-1", "bp-4-2", "bp-3-8", "bp-3-9"],
      },
      {
        id: "main-4",
        time: "3:15 – 5:15 PM",
        duration: "2 hrs",
        domainRef: null,
        title: "Automation & Security",
        weight: null,
        strategy: "The heaviest conceptual block. Workflow Studio and Virtual Agent automate what you've been building. Security Center and Shared Responsibility Model round out Domain 5 — know what ServiceNow secures vs what you're responsible for.",
        topicIds: ["bp-4-3", "bp-4-4", "bp-5-5", "bp-5-6"],
      },
      {
        id: "main-5",
        time: "5:30 – 6:15 PM",
        duration: "45 min",
        domainRef: null,
        title: "Revisit Importing Data & CMDB",
        weight: null,
        strategy: "You've already finished these — this is a quick confidence check. Skim coalesce logic, transform maps, CI class hierarchy, and CSDM layers. Make sure it's still solid.",
        topicIds: ["bp-5-3", "bp-5-4"],
      },
      {
        id: "main-6",
        time: "6:30 – 8:00 PM",
        duration: "1.5 hrs",
        domainRef: null,
        title: "Full Review & Mock Exam",
        weight: null,
        strategy: "Run a full mock exam or the sample questions. Every wrong answer goes on your patch sheet. Focus extra time on Domain 5 and Domain 3 — they're 50% of the exam combined. End with one last flashcard sprint on your weakest 10 terms.",
        topicIds: [],
      },
    ],
    summary: "By 8 PM you'll have covered all 30 topics, revisited your completed ones, and taken a mock. Domain 5 (30%) is spread across multiple blocks so it sinks in deeper.",
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

      {/* Study Plan */}
      <motion.section className="panel panel--spotlight study-plan-section" variants={cardVariants} custom={1}>
        <div className="section-heading">
          <div className="section-heading__eyebrow">Study schedule</div>
          <div className="section-heading__title">1 Day + 4 Hour Plan</div>
          <div className="section-heading__detail">
            Topics are shuffled across domains so you build connections between concepts instead of studying in silos.
            Importing Data and CMDB are already done — the plan includes a quick revisit to keep them fresh.
            Evening starts at 8 PM; main day runs 9 AM – 8 PM.
          </div>
        </div>

        <div className="study-plan-timeline">
          {studyPlan.map((dayPlan) => (
            <div key={dayPlan.id} className={`study-plan-day study-plan-day--${dayPlan.color}`}>
              <div className="study-plan-day__header">
                <div>
                  <div className="study-plan-day__label">{dayPlan.day}</div>
                  <div className="study-plan-day__time">{dayPlan.timeLabel}</div>
                </div>
                <div className="study-plan-day__topic-count">
                  {dayPlan.blocks.reduce((s, b) => s + b.topicIds.length, 0)} topics
                </div>
              </div>

              <div className="study-plan-blocks">
                {dayPlan.blocks.map((block) => {
                  const blockDone = block.topicIds.length > 0 && block.topicIds.every((id) => checked[id]);
                  const blockStarted = block.topicIds.some((id) => checked[id]);
                  const blockProgress = block.topicIds.length
                    ? Math.round((block.topicIds.filter((id) => checked[id]).length / block.topicIds.length) * 100)
                    : 0;

                  return (
                    <div
                      key={block.id}
                      className={`study-block${blockDone ? " study-block--done" : ""}${!block.domainRef ? " study-block--break" : ""}`}
                    >
                      <div className="study-block__header">
                        <div className="study-block__time-badge">{block.time}</div>
                        <div className="study-block__duration">{block.duration}</div>
                      </div>

                      <div className="study-block__body">
                        <div className="study-block__title">{block.title}</div>
                        {block.weight && <span className="study-block__weight">{block.weight} of exam</span>}
                        <p className="study-block__strategy">{block.strategy}</p>
                      </div>

                      {block.topicIds.length > 0 && (
                        <div className="study-block__footer">
                          <div className="study-block__progress-label">
                            <span>{block.topicIds.filter((id) => checked[id]).length}/{block.topicIds.length} done</span>
                            <span>{blockProgress}%</span>
                          </div>
                          <div className="meter">
                            <motion.div
                              className="meter__fill"
                              animate={{ width: `${blockProgress}%` }}
                              transition={{ type: "spring", stiffness: 120, damping: 18 }}
                            />
                          </div>
                          <div className="study-block__topics">
                            {block.topicIds.map((tid) => {
                              const topic = examBlueprint
                                .flatMap((d) => d.topics)
                                .find((t) => t.id === tid);
                              if (!topic) return null;
                              return (
                                <button
                                  key={tid}
                                  type="button"
                                  className={`study-block__topic-chip${checked[tid] ? " study-block__topic-chip--done" : ""}`}
                                  onClick={() => toggle(tid)}
                                >
                                  <span className="study-block__chip-dot" />
                                  {topic.label}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="study-plan-day__summary">{dayPlan.summary}</div>
            </div>
          ))}
        </div>
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


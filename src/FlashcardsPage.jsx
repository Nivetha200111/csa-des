import { motion } from "framer-motion";
import { useDeferredValue, useEffect, useMemo, useState } from "react";
import flashcardsData from "./data/flashcardsData";

const reviewStorageKey = "csa-des-flashcards-review-v2";

const sprintPlan = [
  {
    id: 1,
    title: "Day 1",
    focus: "Learn the deck",
    detail: "See every term once. Anything weak loops back the same day.",
  },
  {
    id: 2,
    title: "Day 2",
    focus: "Pressure weak cards",
    detail: "Hard and failed cards come back first. Keep definitions tight.",
  },
  {
    id: 3,
    title: "Day 3",
    focus: "Mixed recall",
    detail: "Push for cleaner recall with fewer reveals and shorter hesitation.",
  },
  {
    id: 4,
    title: "Day 4",
    focus: "Final lock-in",
    detail: "Only unresolved cards stay alive. Everything else is graduation mode.",
  },
];

const emptySessionStats = () => ({
  reviewed: 0,
  again: 0,
  hard: 0,
  good: 0,
  easy: 0,
});

function makeFreshReviewState() {
  return Object.fromEntries(
    flashcardsData.map((card) => [
      card.term,
      {
        dueDay: 1,
        streak: 0,
        lapses: 0,
        reviews: 0,
        lastRating: "new",
      },
    ])
  );
}

function normalizeReviewState(value) {
  const freshState = makeFreshReviewState();

  if (!value || typeof value !== "object") {
    return freshState;
  }

  return flashcardsData.reduce((nextState, card) => {
    const entry = value[card.term];

    if (!entry || typeof entry !== "object") {
      nextState[card.term] = freshState[card.term];
      return nextState;
    }

    const dueDay = Number(entry.dueDay);
    const streak = Number(entry.streak);
    const lapses = Number(entry.lapses);
    const reviews = Number(entry.reviews);

    nextState[card.term] = {
      dueDay: Number.isFinite(dueDay) ? Math.min(5, Math.max(1, dueDay)) : 1,
      streak: Number.isFinite(streak) ? Math.max(0, streak) : 0,
      lapses: Number.isFinite(lapses) ? Math.max(0, lapses) : 0,
      reviews: Number.isFinite(reviews) ? Math.max(0, reviews) : 0,
      lastRating: typeof entry.lastRating === "string" ? entry.lastRating : "new",
    };

    return nextState;
  }, {});
}

function loadReviewState() {
  if (typeof window === "undefined") {
    return makeFreshReviewState();
  }

  try {
    const rawValue = window.localStorage.getItem(reviewStorageKey);
    return rawValue ? normalizeReviewState(JSON.parse(rawValue)) : makeFreshReviewState();
  } catch {
    return makeFreshReviewState();
  }
}

function getReviewRecord(reviewState, term) {
  return (
    reviewState[term] ?? {
      dueDay: 1,
      streak: 0,
      lapses: 0,
      reviews: 0,
      lastRating: "new",
    }
  );
}

function buildStudyQueue(studyDay, reviewState) {
  return flashcardsData
    .filter((card) => {
      const record = getReviewRecord(reviewState, card.term);
      return record.dueDay <= studyDay && record.dueDay <= 4;
    })
    .sort((left, right) => {
      const leftRecord = getReviewRecord(reviewState, left.term);
      const rightRecord = getReviewRecord(reviewState, right.term);

      return (
        leftRecord.dueDay - rightRecord.dueDay ||
        rightRecord.lapses - leftRecord.lapses ||
        left.term.localeCompare(right.term)
      );
    })
    .map((card) => card.term);
}

function seededShuffle(items, seed) {
  if (!seed) {
    return items;
  }

  const next = [...items];
  let state = seed;

  const random = () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };

  for (let index = next.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
  }

  return next;
}

function scheduleNextDay(studyDay, record, rating) {
  if (rating === "again") {
    return studyDay;
  }

  if (studyDay >= 4) {
    return 5;
  }

  if (rating === "hard") {
    return studyDay + 1;
  }

  if (rating === "good") {
    return Math.min(5, studyDay + (record.streak >= 1 ? 2 : 1));
  }

  return 5;
}

export default function FlashcardsPage({ onBack }) {
  const [query, setQuery] = useState("");
  const [shuffleSeed, setShuffleSeed] = useState(0);
  const [revealAll, setRevealAll] = useState(false);
  const [flippedCards, setFlippedCards] = useState({});
  const [activeMode, setActiveMode] = useState("wall");
  const [studyDay, setStudyDay] = useState(1);
  const [reviewState, setReviewState] = useState(() => loadReviewState());
  const [studyQueue, setStudyQueue] = useState(() => buildStudyQueue(1, loadReviewState()));
  const [showStudyAnswer, setShowStudyAnswer] = useState(false);
  const [sessionStats, setSessionStats] = useState(() => emptySessionStats());
  const deferredQuery = useDeferredValue(query);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(reviewStorageKey, JSON.stringify(reviewState));
  }, [reviewState]);

  const filteredCards = useMemo(() => {
    const normalizedQuery = deferredQuery.trim().toLowerCase();

    const cards = flashcardsData.filter((card) => {
      if (!normalizedQuery) {
        return true;
      }

      return (
        card.term.toLowerCase().includes(normalizedQuery) ||
        card.definition.toLowerCase().includes(normalizedQuery)
      );
    });

    return seededShuffle(cards, shuffleSeed);
  }, [deferredQuery, shuffleSeed]);

  const revealedCount = revealAll
    ? filteredCards.length
    : filteredCards.filter((card) => flippedCards[card.term]).length;

  const currentStudyCard = useMemo(
    () => flashcardsData.find((card) => card.term === studyQueue[0]) ?? null,
    [studyQueue]
  );

  const dueTodayCount = useMemo(
    () =>
      flashcardsData.filter((card) => {
        const record = getReviewRecord(reviewState, card.term);
        return record.dueDay <= studyDay && record.dueDay <= 4;
      }).length,
    [reviewState, studyDay]
  );

  const masteredCount = useMemo(
    () =>
      flashcardsData.filter((card) => getReviewRecord(reviewState, card.term).dueDay > 4).length,
    [reviewState]
  );

  const dayCounts = useMemo(
    () =>
      sprintPlan.map((planDay) =>
        flashcardsData.filter(
          (card) => getReviewRecord(reviewState, card.term).dueDay === planDay.id
        ).length
      ),
    [reviewState]
  );

  const currentRecord = currentStudyCard
    ? getReviewRecord(reviewState, currentStudyCard.term)
    : null;

  const nextTerms = studyQueue.slice(1, 5);

  const toggleCard = (term) => {
    if (revealAll) {
      return;
    }

    setFlippedCards((previous) => ({
      ...previous,
      [term]: !previous[term],
    }));
  };

  const shuffleDeck = () => {
    setShuffleSeed(Date.now());
  };

  const resetDeck = () => {
    setQuery("");
    setShuffleSeed(0);
    setRevealAll(false);
    setFlippedCards({});
  };

  const resetSprint = () => {
    const nextReviewState = makeFreshReviewState();
    setReviewState(nextReviewState);
    setStudyQueue(buildStudyQueue(studyDay, nextReviewState));
    setShowStudyAnswer(false);
    setSessionStats(emptySessionStats());
  };

  const switchStudyDay = (nextDay) => {
    setStudyDay(nextDay);
    setStudyQueue(buildStudyQueue(nextDay, reviewState));
    setShowStudyAnswer(false);
    setSessionStats(emptySessionStats());
  };

  const rateCurrentCard = (rating) => {
    if (!currentStudyCard) {
      return;
    }

    const currentTerm = currentStudyCard.term;

    setReviewState((previous) => {
      const currentReviewRecord = getReviewRecord(previous, currentTerm);
      const nextDueDay = scheduleNextDay(studyDay, currentReviewRecord, rating);

      return {
        ...previous,
        [currentTerm]: {
          dueDay: nextDueDay,
          streak: rating === "again" ? 0 : currentReviewRecord.streak + 1,
          lapses: currentReviewRecord.lapses + (rating === "again" ? 1 : 0),
          reviews: currentReviewRecord.reviews + 1,
          lastRating: rating,
        },
      };
    });

    setStudyQueue((previousQueue) => {
      const [, ...remainingQueue] = previousQueue;
      return rating === "again" ? [...remainingQueue, currentTerm] : remainingQueue;
    });

    setSessionStats((previousStats) => ({
      ...previousStats,
      reviewed: previousStats.reviewed + 1,
      [rating]: previousStats[rating] + 1,
    }));
    setShowStudyAnswer(false);
  };

  return (
    <motion.main
      className="dashboard dashboard--flashcards"
      initial={{ opacity: 0, y: 22 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -18 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
    >
      <section className="panel flashcards-hero panel--spotlight">
        <div className="flashcards-hero__copy">
          <div className="hero-copy__eyebrow">Glossary drill</div>
          <h1>CSA Flashcards</h1>
          <p>
            Flip the full glossary as a visual deck or switch into a 4-day Anki-style cram cycle
            that keeps weak cards due until they stop slipping.
          </p>
        </div>

        <div className="flashcards-stats">
          <div className="flashcards-stat">
            <span className="flashcards-stat__label">Total cards</span>
            <strong className="flashcards-stat__value">{flashcardsData.length}</strong>
          </div>
          <div className="flashcards-stat">
            <span className="flashcards-stat__label">
              {activeMode === "wall" ? "Visible" : `Due on day ${studyDay}`}
            </span>
            <strong className="flashcards-stat__value">
              {activeMode === "wall" ? filteredCards.length : dueTodayCount}
            </strong>
          </div>
          <div className="flashcards-stat">
            <span className="flashcards-stat__label">
              {activeMode === "wall" ? "Flipped" : "Graduated"}
            </span>
            <strong className="flashcards-stat__value">
              {activeMode === "wall" ? revealedCount : masteredCount}
            </strong>
          </div>
        </div>

        <div className="flashcards-mode-switch" role="tablist" aria-label="Flashcard study modes">
          <button
            type="button"
            className={`flashcards-mode-switch__button${activeMode === "wall" ? " flashcards-mode-switch__button--active" : ""}`}
            onClick={() => setActiveMode("wall")}
          >
            Deck wall
          </button>
          <button
            type="button"
            className={`flashcards-mode-switch__button${activeMode === "sprint" ? " flashcards-mode-switch__button--active" : ""}`}
            onClick={() => setActiveMode("sprint")}
          >
            4-day Anki sprint
          </button>
        </div>
      </section>

      {activeMode === "wall" ? (
        <>
          <section className="panel flashcards-controls">
            <div className="flashcards-toolbar">
              <label className="flashcards-search">
                <span className="flashcards-search__label">Search terms or definitions</span>
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Try ACL, CMDB, Transform Map, Virtual Agent..."
                  className="flashcards-search__input"
                />
              </label>

              <div className="flashcards-actions">
                <button type="button" className="flashcards-action" onClick={shuffleDeck}>
                  Shuffle deck
                </button>
                <button
                  type="button"
                  className="flashcards-action"
                  onClick={() => setRevealAll((previous) => !previous)}
                >
                  {revealAll ? "Hide definitions" : "Reveal all"}
                </button>
                <button type="button" className="flashcards-action" onClick={resetDeck}>
                  Reset
                </button>
                {onBack ? (
                  <button
                    type="button"
                    className="flashcards-action flashcards-action--primary"
                    onClick={onBack}
                  >
                    Back to tracker
                  </button>
                ) : null}
              </div>
            </div>
          </section>

          {filteredCards.length ? (
            <section className="flashcards-grid">
              {filteredCards.map((card, index) => {
                const isFlipped = revealAll || Boolean(flippedCards[card.term]);

                return (
                  <motion.button
                    key={card.term}
                    type="button"
                    className={`flashcard${isFlipped ? " flashcard--flipped" : ""}`}
                    onClick={() => toggleCard(card.term)}
                    whileHover={{ y: -6, scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    initial={{ opacity: 0, y: 16, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.34, delay: Math.min(index * 0.01, 0.18) }}
                  >
                    <span className="flashcard__inner">
                      <span className="flashcard__face flashcard__face--front">
                        <span className="flashcard__meta">
                          <span>Term #{index + 1}</span>
                          <span>{revealAll ? "Definitions shown" : "Tap to flip"}</span>
                        </span>
                        <span className="flashcard__term">{card.term}</span>
                        <span className="flashcard__hint">Front side</span>
                      </span>

                      <span className="flashcard__face flashcard__face--back">
                        <span className="flashcard__meta">
                          <span>Definition</span>
                          <span>{revealAll ? "Pinned" : "Tap to return"}</span>
                        </span>
                        <span className="flashcard__definition">{card.definition}</span>
                      </span>
                    </span>
                  </motion.button>
                );
              })}
            </section>
          ) : (
            <section className="panel flashcards-empty">
              <div className="section-heading__title">No flashcards match that search</div>
              <div className="section-heading__detail">
                Clear the search or try a shorter keyword like table, security, workflow, or
                catalog.
              </div>
            </section>
          )}
        </>
      ) : (
        <>
          <section className="anki-plan">
            {sprintPlan.map((planDay, index) => (
              <button
                key={planDay.id}
                type="button"
                className={`anki-plan__day${studyDay === planDay.id ? " anki-plan__day--active" : ""}`}
                onClick={() => switchStudyDay(planDay.id)}
              >
                <span className="anki-plan__day-title">{planDay.title}</span>
                <span className="anki-plan__day-focus">{planDay.focus}</span>
                <span className="anki-plan__day-detail">{planDay.detail}</span>
                <span className="anki-plan__day-count">{dayCounts[index]} due</span>
              </button>
            ))}
          </section>

          <section className="anki-sprint-grid">
            <motion.section className="panel anki-session panel--spotlight" layout>
              <div className="anki-session__header">
                <div>
                  <div className="hero-copy__eyebrow">Anki sprint</div>
                  <h2>{sprintPlan[studyDay - 1].focus}</h2>
                  <p>{sprintPlan[studyDay - 1].detail}</p>
                </div>
                <div className="anki-session__pill">{studyQueue.length} live</div>
              </div>

              {currentStudyCard ? (
                <motion.div
                  key={currentStudyCard.term}
                  className="anki-review-card"
                  initial={{ opacity: 0, y: 16, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.28 }}
                >
                  <div className="anki-review-card__meta">
                    <span>Prompt</span>
                    <span>
                      Streak {currentRecord?.streak ?? 0} · Lapses {currentRecord?.lapses ?? 0}
                    </span>
                  </div>

                  <div className="anki-review-card__term">{currentStudyCard.term}</div>
                  <div className="anki-review-card__prompt">
                    Recall the definition out loud, then reveal and grade yourself brutally.
                  </div>

                  {showStudyAnswer ? (
                    <motion.div
                      className="anki-review-card__answer"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.22 }}
                    >
                      {currentStudyCard.definition}
                    </motion.div>
                  ) : null}

                  <div className="anki-review-card__actions">
                    {!showStudyAnswer ? (
                      <button
                        type="button"
                        className="flashcards-action flashcards-action--primary"
                        onClick={() => setShowStudyAnswer(true)}
                      >
                        Reveal definition
                      </button>
                    ) : (
                      <div className="anki-rating-row">
                        <button
                          type="button"
                          className="anki-rating anki-rating--again"
                          onClick={() => rateCurrentCard("again")}
                        >
                          Again
                        </button>
                        <button
                          type="button"
                          className="anki-rating anki-rating--hard"
                          onClick={() => rateCurrentCard("hard")}
                        >
                          Hard
                        </button>
                        <button
                          type="button"
                          className="anki-rating anki-rating--good"
                          onClick={() => rateCurrentCard("good")}
                        >
                          Good
                        </button>
                        <button
                          type="button"
                          className="anki-rating anki-rating--easy"
                          onClick={() => rateCurrentCard("easy")}
                        >
                          Easy
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              ) : (
                <div className="anki-session__empty">
                  <div className="section-heading__title">Day {studyDay} is cleared</div>
                  <div className="section-heading__detail">
                    Nothing else is due right now. Move to the next day or reset the sprint if you
                    want another full pass.
                  </div>
                </div>
              )}
            </motion.section>

            <section className="panel anki-sidebar">
              <div className="anki-sidebar__section">
                <SectionTitle title="Session stats" detail="This resets when you switch the day." />
                <div className="anki-stat-grid">
                  <div className="anki-stat-card">
                    <span>Reviewed</span>
                    <strong>{sessionStats.reviewed}</strong>
                  </div>
                  <div className="anki-stat-card">
                    <span>Again</span>
                    <strong>{sessionStats.again}</strong>
                  </div>
                  <div className="anki-stat-card">
                    <span>Good + Easy</span>
                    <strong>{sessionStats.good + sessionStats.easy}</strong>
                  </div>
                  <div className="anki-stat-card">
                    <span>Graduated</span>
                    <strong>{masteredCount}</strong>
                  </div>
                </div>
              </div>

              <div className="anki-sidebar__section">
                <SectionTitle title="Next up" detail="Cards still in the queue for this day." />
                {nextTerms.length ? (
                  <div className="anki-queue">
                    {nextTerms.map((term) => (
                      <div key={term} className="anki-queue__item">
                        <span>{term}</span>
                        <small>due day {getReviewRecord(reviewState, term).dueDay}</small>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="anki-sidebar__empty">Only the current card is live.</div>
                )}
              </div>

              <div className="anki-sidebar__section">
                <SectionTitle
                  title="Controls"
                  detail="Use reset if you want to rerun the 4-day sprint from scratch."
                />
                <div className="flashcards-actions flashcards-actions--stack">
                  <button type="button" className="flashcards-action" onClick={resetSprint}>
                    Reset 4-day sprint
                  </button>
                  {onBack ? (
                    <button
                      type="button"
                      className="flashcards-action flashcards-action--primary"
                      onClick={onBack}
                    >
                      Back to tracker
                    </button>
                  ) : null}
                </div>
              </div>
            </section>
          </section>
        </>
      )}
    </motion.main>
  );
}

function SectionTitle({ title, detail }) {
  return (
    <div className="anki-section-title">
      <div className="section-heading__title">{title}</div>
      <div className="section-heading__detail">{detail}</div>
    </div>
  );
}

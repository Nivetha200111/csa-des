import { motion } from "framer-motion";
import { useDeferredValue, useMemo, useState } from "react";
import flashcardsData from "./data/flashcardsData";

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

export default function FlashcardsPage({ onBack }) {
  const [query, setQuery] = useState("");
  const [shuffleSeed, setShuffleSeed] = useState(0);
  const [revealAll, setRevealAll] = useState(false);
  const [flippedCards, setFlippedCards] = useState({});
  const deferredQuery = useDeferredValue(query);

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
            Flip through the terms from your glossary sheets, search definitions fast, and use the
            deck like a revision wall instead of a static note dump.
          </p>
        </div>

        <div className="flashcards-stats">
          <div className="flashcards-stat">
            <span className="flashcards-stat__label">Total cards</span>
            <strong className="flashcards-stat__value">{flashcardsData.length}</strong>
          </div>
          <div className="flashcards-stat">
            <span className="flashcards-stat__label">Visible</span>
            <strong className="flashcards-stat__value">{filteredCards.length}</strong>
          </div>
          <div className="flashcards-stat">
            <span className="flashcards-stat__label">Flipped</span>
            <strong className="flashcards-stat__value">{revealedCount}</strong>
          </div>
        </div>

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
              <button type="button" className="flashcards-action flashcards-action--primary" onClick={onBack}>
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
            Clear the search or try a shorter keyword like table, security, workflow, or catalog.
          </div>
        </section>
      )}
    </motion.main>
  );
}

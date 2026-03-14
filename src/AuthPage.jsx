import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useAuth } from "./AuthContext";

const formVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.96 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
  },
  exit: {
    opacity: 0,
    y: -20,
    scale: 0.96,
    transition: { duration: 0.3 },
  },
};

export default function AuthPage() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState("login"); // login | register
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const reset = () => {
    setError("");
    setEmail("");
    setName("");
    setPassword("");
  };

  const switchMode = () => {
    reset();
    setMode((m) => (m === "login" ? "register" : "login"));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);

    try {
      if (mode === "login") {
        await login(email, password);
      } else {
        await register(email, name, password);
      }
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-ambient auth-ambient--one" />
      <div className="auth-ambient auth-ambient--two" />
      <div className="auth-ambient auth-ambient--three" />

      <div className="auth-container">
        <motion.div
          className="auth-brand"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="auth-brand__icon">
            <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="40" height="40" rx="12" fill="url(#brandGrad)" />
              <path
                d="M12 20l5 5 11-11"
                stroke="#fff"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <defs>
                <linearGradient id="brandGrad" x1="0" y1="0" x2="40" y2="40">
                  <stop stopColor="#f8c85f" />
                  <stop offset="0.5" stopColor="#ff7c5c" />
                  <stop offset="1" stopColor="#4ae2c8" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <h1 className="auth-brand__title">CSA Prep Tracker</h1>
          <p className="auth-brand__subtitle">
            Your full-stack ServiceNow CSA exam preparation hub.
            Track labs, flashcards, mocks, and blueprint coverage — synced to the cloud.
          </p>
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.form
            key={mode}
            className="auth-card"
            onSubmit={handleSubmit}
            variants={formVariants}
            initial="hidden"
            animate="show"
            exit="exit"
          >
            <div className="auth-card__header">
              <h2>{mode === "login" ? "Welcome back" : "Create your account"}</h2>
              <p>
                {mode === "login"
                  ? "Sign in to access your progress across devices."
                  : "Start tracking your CSA prep journey."}
              </p>
            </div>

            {error && (
              <motion.div
                className="auth-error"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                {error}
              </motion.div>
            )}

            <div className="auth-fields">
              {mode === "register" && (
                <label className="auth-field">
                  <span className="auth-field__label">Name</span>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    required
                    className="auth-field__input"
                    autoComplete="name"
                  />
                </label>
              )}

              <label className="auth-field">
                <span className="auth-field__label">Email</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="auth-field__input"
                  autoComplete="email"
                />
              </label>

              <label className="auth-field">
                <span className="auth-field__label">Password</span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={mode === "register" ? "Min 6 characters" : "Your password"}
                  required
                  minLength={mode === "register" ? 6 : undefined}
                  className="auth-field__input"
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                />
              </label>
            </div>

            <motion.button
              type="submit"
              className="auth-submit"
              disabled={busy}
              whileHover={{ scale: 1.01, y: -2 }}
              whileTap={{ scale: 0.99 }}
            >
              {busy
                ? "Loading..."
                : mode === "login"
                  ? "Sign in"
                  : "Create account"}
            </motion.button>

            <div className="auth-switch">
              <span>
                {mode === "login" ? "Don't have an account?" : "Already have an account?"}
              </span>
              <button type="button" className="auth-switch__link" onClick={switchMode}>
                {mode === "login" ? "Sign up" : "Sign in"}
              </button>
            </div>
          </motion.form>
        </AnimatePresence>

        <motion.div
          className="auth-features"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <div className="auth-feature">
            <span className="auth-feature__icon">📋</span>
            <div>
              <strong>20 Lab Tracker</strong>
              <span>4-day bootcamp mapped to exam domains</span>
            </div>
          </div>
          <div className="auth-feature">
            <span className="auth-feature__icon">🃏</span>
            <div>
              <strong>Anki Flashcards</strong>
              <span>Spaced repetition for CSA terms</span>
            </div>
          </div>
          <div className="auth-feature">
            <span className="auth-feature__icon">✅</span>
            <div>
              <strong>Blueprint Checklist</strong>
              <span>30 topics across 6 exam domains</span>
            </div>
          </div>
          <div className="auth-feature">
            <span className="auth-feature__icon">☁️</span>
            <div>
              <strong>Cloud Sync</strong>
              <span>Progress saved to Neon Postgres</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}


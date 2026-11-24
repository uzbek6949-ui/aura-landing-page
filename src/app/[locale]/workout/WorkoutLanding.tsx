"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./workout.module.css";

const VOCAB: [string, string][] = [
  ["Warm-up", "Light exercise before training to prepare the body"],
  ["Repetition (rep)", "One complete movement of an exercise"],
  ["Set", "A group of repetitions done without rest"],
  ["Plank", "A core exercise: holding a straight body position"],
  ["Recovery", "Rest time when muscles repair and grow"],
  ["Technique", "The correct way to perform an exercise"],
];

const EXERCISES = [
  "Squat",
  "Push-up",
  "Bent-over row",
  "Lunge",
  "Plank",
  "Glute bridge",
];

const QUESTIONS: [string, string[], number][] = [
  [
    "How often should a beginner do full-body workouts?",
    ["Every day", "2–3 non-consecutive days a week", "Once a month"],
    1,
  ],
  ["How long should a warm-up be?", ["5–10 minutes", "30 seconds", "1 hour"], 0],
  [
    "How long is the rest between sets?",
    ["5 seconds", "10 minutes", "45–60 seconds"],
    2,
  ],
  [
    "When do muscles grow?",
    ["During recovery", "Only while exercising", "Only during stretching"],
    0,
  ],
  [
    "What should you do if you feel sharp pain?",
    ["Push harder", "Stop", "Ignore it"],
    1,
  ],
];

const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);

export function WorkoutLanding() {
  // menu
  const [menuOpen, setMenuOpen] = useState(false);

  // flashcards
  const [deck, setDeck] = useState<[string, string][]>(VOCAB);
  const [cardIdx, setCardIdx] = useState(0);
  const [showBack, setShowBack] = useState(false);

  // timer
  const [workSec, setWorkSec] = useState(30);
  const [restSec, setRestSec] = useState(15);
  const [phase, setPhase] = useState("Ready?");
  const [count, setCount] = useState("00");
  const [working, setWorking] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // quiz
  const [quizKey, setQuizKey] = useState(0);
  const [picked, setPicked] = useState<Record<number, number>>({});
  const [score, setScore] = useState<number | null>(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const closeMenu = () => setMenuOpen(false);

  const flipCard = () => setShowBack((v) => !v);
  const nextCard = () => {
    setShowBack(false);
    setCardIdx((i) => (i + 1) % deck.length);
  };
  const prevCard = () => {
    setShowBack(false);
    setCardIdx((i) => (i - 1 + deck.length) % deck.length);
  };
  const shuffleDeck = () => {
    const arr = deck.slice();
    for (let k = arr.length - 1; k > 0; k--) {
      const j = Math.floor(Math.random() * (k + 1));
      [arr[k], arr[j]] = [arr[j], arr[k]];
    }
    setDeck(arr);
    setCardIdx(0);
    setShowBack(false);
  };

  const stopTimer = (msg?: string) => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setWorking(false);
    setPhase(msg || "Ready?");
    setCount("00");
  };

  const startTimer = () => {
    if (intervalRef.current) return;
    const w = Math.max(5, Number(workSec) || 30);
    const r = Math.max(5, Number(restSec) || 15);
    let idx = 0;
    let isWorking = true;
    let left = w;

    const paint = () => {
      setWorking(isWorking);
      setPhase(
        isWorking
          ? `Work: ${EXERCISES[idx]}`
          : `Rest — next: ${EXERCISES[(idx + 1) % EXERCISES.length]}`
      );
      setCount(pad(left));
    };
    paint();

    intervalRef.current = setInterval(() => {
      left--;
      if (left <= 0) {
        if (isWorking) {
          if (idx === EXERCISES.length - 1) {
            stopTimer("Workout complete! 💪");
            return;
          }
          isWorking = false;
          left = r;
        } else {
          isWorking = true;
          idx++;
          left = w;
        }
      }
      paint();
    }, 1000);
  };

  const pickOption = (qi: number, oi: number) => {
    if (picked[qi] !== undefined) return;
    const next = { ...picked, [qi]: oi };
    setPicked(next);
    if (Object.keys(next).length === QUESTIONS.length) {
      let pts = 0;
      QUESTIONS.forEach((q, i) => {
        if (next[i] === q[2]) pts++;
      });
      setScore(pts);
    }
  };

  const retryQuiz = () => {
    setPicked({});
    setScore(null);
    setQuizKey((k) => k + 1);
  };

  const card = deck[cardIdx];

  return (
    <div className={styles.workoutRoot}>
      <header className={styles.nav}>
        <a className={styles.brand} href="#top">
          <span
            className={styles.mark}
            aria-hidden="true"
            style={{ backgroundImage: "url(/workout/logo.png)" }}
          />
          <span>Fit Workout</span>
        </a>
        <button
          className={styles.burger}
          aria-label="Menu"
          aria-expanded={menuOpen}
          aria-controls="menu"
          onClick={() => setMenuOpen((v) => !v)}
        >
          <span />
          <span />
          <span />
        </button>
        <ul
          id="menu"
          className={`${styles.links} ${menuOpen ? styles.open : ""}`}
          onClick={(e) => {
            if ((e.target as HTMLElement).tagName === "A") closeMenu();
          }}
        >
          <li>
            <a href="#learn">Learn</a>
          </li>
          <li>
            <a href="#plan">Sample Workout</a>
          </li>
          <li>
            <a href="#sources">Sources</a>
          </li>
          <li>
            <a href="#vocab">Vocabulary</a>
          </li>
          <li>
            <a href="#timer">Workout Timer</a>
          </li>
          <li>
            <a href="#quiz">Quiz</a>
          </li>
        </ul>
      </header>

      <main>
        <section className={styles.hero} id="top">
          <div className={styles.heroIn}>
            <div
              className={styles.logo}
              role="img"
              aria-label="Fit Workout Community Club logo"
              style={{ backgroundImage: "url(/workout/logo.png)" }}
            />
            <h1>Full-Body Training</h1>
            <p>Train every major muscle group in one smart workout.</p>
            <div className={styles.acts}>
              <a className={styles.btn} href="#learn">
                Start learning
              </a>
              <a className={`${styles.btn} ${styles.ghost}`} href="#timer">
                Open workout timer
              </a>
            </div>
          </div>
        </section>

        <section className={styles.sec} id="learn">
          <h2>What is full-body training?</h2>
          <p>
            A full-body workout trains all the major muscle groups (legs, back,
            chest, shoulders, arms and core) in a single session, usually 2–3
            times per week with a rest day between sessions. It is efficient,
            beginner-friendly and needs little equipment.
          </p>
          <div className={styles.grid}>
            <div className={styles.card}>
              <h3>✅ Benefits</h3>
              <p>
                Saves time, builds overall strength, improves posture and burns
                more energy because big muscles work together.
              </p>
            </div>
            <div className={styles.card}>
              <h3>📅 How often?</h3>
              <p>
                2–3 non-consecutive days a week (e.g. Mon / Wed / Fri). Muscles
                grow during recovery.
              </p>
            </div>
            <div className={styles.card}>
              <h3>🔥 Always</h3>
              <p>
                Warm up for 5–10 minutes, use correct technique, drink water and
                cool down with stretching.
              </p>
            </div>
            <div className={styles.card}>
              <h3>⚠️ Safety</h3>
              <p>
                Start with bodyweight, increase difficulty slowly and stop if
                you feel sharp pain. Ask a teacher or doctor if unsure.
              </p>
            </div>
          </div>
        </section>

        <section className={styles.sec} id="plan">
          <h2>Sample beginner workout</h2>
          <div className={styles.tw}>
            <table>
              <thead>
                <tr>
                  <th>Exercise</th>
                  <th>Muscles</th>
                  <th>Sets × Reps</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Squat</td>
                  <td>Legs, glutes</td>
                  <td>3 × 12</td>
                </tr>
                <tr>
                  <td>Push-up (or knee push-up)</td>
                  <td>Chest, shoulders, triceps</td>
                  <td>3 × 8–10</td>
                </tr>
                <tr>
                  <td>Bent-over row (backpack or band)</td>
                  <td>Back, biceps</td>
                  <td>3 × 10</td>
                </tr>
                <tr>
                  <td>Lunge</td>
                  <td>Legs, balance</td>
                  <td>3 × 8 each leg</td>
                </tr>
                <tr>
                  <td>Plank</td>
                  <td>Core</td>
                  <td>3 × 20–30 sec</td>
                </tr>
                <tr>
                  <td>Glute bridge</td>
                  <td>Glutes, hamstrings</td>
                  <td>3 × 12</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className={styles.tip}>
            Rest 45–60 seconds between sets. Use the timer below to practise.
          </p>
        </section>

        <section className={styles.sec} id="sources">
          <h2>Reliable sources</h2>
          <p>
            Choose sources from health organisations, universities and qualified
            coaches. Always check who wrote it and when.
          </p>
          <div className={`${styles.grid} ${styles.src}`}>
            <div className={styles.card}>
              <h3>🏥 WHO – Physical activity</h3>
              <a
                href="https://www.who.int/news-room/fact-sheets/detail/physical-activity"
                target="_blank"
                rel="noopener"
              >
                Official activity guidelines
              </a>
            </div>
            <div className={styles.card}>
              <h3>🏥 NHS – Exercise</h3>
              <a
                href="https://www.nhs.uk/live-well/exercise/"
                target="_blank"
                rel="noopener"
              >
                Strength &amp; fitness advice
              </a>
            </div>
            <div className={styles.card}>
              <h3>🏥 CDC – Physical activity</h3>
              <a
                href="https://www.cdc.gov/physical-activity-basics/"
                target="_blank"
                rel="noopener"
              >
                Basics for all ages
              </a>
            </div>
            <div className={styles.card}>
              <h3>▶️ YouTube videos</h3>
              <a
                href="https://www.youtube.com/results?search_query=beginner+full+body+workout+no+equipment"
                target="_blank"
                rel="noopener"
              >
                Beginner full-body workouts
              </a>
              <a
                href="https://www.youtube.com/results?search_query=how+to+squat+correctly+physiotherapist"
                target="_blank"
                rel="noopener"
              >
                Correct squat technique
              </a>
            </div>
            <div className={styles.card}>
              <h3>📚 E-books &amp; articles</h3>
              <a
                href="https://scholar.google.com/scholar?q=full+body+resistance+training+beginners"
                target="_blank"
                rel="noopener"
              >
                Google Scholar research
              </a>
              <a
                href="https://www.google.com/search?tbm=bks&q=bodyweight+training+beginners"
                target="_blank"
                rel="noopener"
              >
                Google Books
              </a>
            </div>
          </div>
          <p className={styles.tip}>
            Tip: prefer videos by physiotherapists, certified trainers or health
            organisations.
          </p>
        </section>

        <section className={styles.sec} id="vocab">
          <h2>New vocabulary</h2>
          <div className={styles.tw}>
            <table>
              <thead>
                <tr>
                  <th>Word</th>
                  <th>Meaning</th>
                </tr>
              </thead>
              <tbody>
                {VOCAB.map(([w, m]) => (
                  <tr key={w}>
                    <td>{w}</td>
                    <td>{m}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <h3 style={{ marginTop: 28 }}>Flashcards (tap the card to flip)</h3>
          <div className={styles.flash}>
            <button
              className={`${styles.fc} ${showBack ? styles.back : ""}`}
              aria-live="polite"
              onClick={flipCard}
            >
              <span>
                <small>
                  {showBack ? "Meaning" : "Word"} · {cardIdx + 1}/{deck.length}
                </small>
                {showBack ? card[1] : card[0]}
              </span>
            </button>
          </div>
          <div className={styles.row}>
            <button
              className={`${styles.btn} ${styles.ghost} ${styles.sm}`}
              onClick={prevCard}
            >
              ← Previous
            </button>
            <button
              className={`${styles.btn} ${styles.ghost} ${styles.sm}`}
              onClick={nextCard}
            >
              Next →
            </button>
            <button
              className={`${styles.btn} ${styles.ghost} ${styles.sm}`}
              onClick={shuffleDeck}
            >
              Shuffle
            </button>
          </div>
        </section>

        <section className={styles.sec} id="timer">
          <h2>Interactive workout timer</h2>
          <p>Do each exercise for the work time, then rest. Click Start!</p>
          <div
            className={`${styles.timer} ${working ? styles.work : ""}`}
          >
            <label>
              Work (sec)
              <input
                type="number"
                value={workSec}
                min={5}
                max={300}
                onChange={(e) => setWorkSec(Number(e.target.value))}
              />
            </label>
            <label>
              Rest (sec)
              <input
                type="number"
                value={restSec}
                min={5}
                max={300}
                onChange={(e) => setRestSec(Number(e.target.value))}
              />
            </label>
            <p className={styles.phase}>{phase}</p>
            <div className={styles.count}>{count}</div>
            <div className={styles.row}>
              <button
                className={`${styles.btn} ${styles.sm}`}
                onClick={startTimer}
              >
                Start
              </button>
              <button
                className={`${styles.btn} ${styles.ghost} ${styles.sm}`}
                onClick={() => stopTimer()}
              >
                Stop
              </button>
            </div>
          </div>
        </section>

        <section className={styles.sec} id="quiz">
          <h2>Interactive quiz</h2>
          <div key={quizKey}>
            {QUESTIONS.map((q, qi) => {
              const chose = picked[qi];
              return (
                <div className={styles.q} key={qi}>
                  <h3>
                    {qi + 1}. {q[0]}
                  </h3>
                  <div className={styles.opts}>
                    {q[1].map((t, oi) => {
                      const answered = chose !== undefined;
                      const isCorrect = oi === q[2];
                      const isChosen = oi === chose;
                      let cls = styles.opt;
                      if (answered && isCorrect) cls += ` ${styles.ok}`;
                      if (answered && isChosen && !isCorrect)
                        cls += ` ${styles.bad}`;
                      return (
                        <button
                          key={oi}
                          className={cls}
                          disabled={answered}
                          onClick={() => pickOption(qi, oi)}
                        >
                          {t}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
          <p className={styles.score} aria-live="polite">
            {score !== null ? `Your score: ${score} / ${QUESTIONS.length}` : ""}
          </p>
          {score !== null && (
            <button
              className={`${styles.btn} ${styles.ghost} ${styles.sm}`}
              onClick={retryQuiz}
            >
              Try again
            </button>
          )}
        </section>
      </main>

      <footer className={styles.footer}>
        School project · Full-body training · Not medical advice
      </footer>
    </div>
  );
}

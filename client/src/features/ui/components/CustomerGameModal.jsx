import { useState, useEffect } from "react";
import {
  Trophy,
  Award,
  Sparkles,
  CheckCircle2,
  XCircle,
  Clock,
  RotateCcw,
  Gift,
  ArrowRight,
  X,
  Check,
  AlertCircle,
} from "lucide-react";
import {
  getAllQuizzes,
  checkOrderQuizEligibility,
  recordQuizPlaySession,
} from "../../../services/quizServices";

// Web Audio sound synthesizer for Arcade sounds
function playSound(type) {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    if (type === "correct") {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sine";
      osc.frequency.setValueAtTime(523.25, now);
      osc.frequency.setValueAtTime(659.25, now + 0.1);
      osc.frequency.setValueAtTime(783.99, now + 0.2);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
      osc.start(now);
      osc.stop(now + 0.45);
    } else if (type === "wrong") {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "triangle";
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.setValueAtTime(174.61, now + 0.12);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc.start(now);
      osc.stop(now + 0.35);
    } else if (type === "win") {
      const notes = [523.25, 659.25, 783.99, 1046.5];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now + idx * 0.1);
        gain.gain.setValueAtTime(0.25, now + idx * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.1 + 0.35);
        osc.start(now + idx * 0.1);
        osc.stop(now + idx * 0.1 + 0.35);
      });
    } else if (type === "tick") {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sine";
      osc.frequency.setValueAtTime(800, now);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
      osc.start(now);
      osc.stop(now + 0.04);
    }
  } catch (e) {
    // Audio context may be restricted
  }
}

// Built-in Food Trivia Games
const FALLBACK_GAMES = [
  {
    id: "foodie-challenge",
    title: "Desi Foodie Challenge",
    desc: "Answer 4 quick spice & cuisine questions correctly to win a free dessert!",
    reward: "Free Hot Gulab Jamun (2 Pcs)",
    badge: "Most Popular",
    questions: [
      {
        question: "Which royal spice is known as the 'Queen of Spices'?",
        options: ["Cardamom (Elaichi)", "Clove (Laung)", "Black Pepper (Kali Mirch)", "Cumin (Jeera)"],
        correct: 0,
        explanation: "Elaichi is renowned as the Queen of Spices, while Black Pepper is the King!",
      },
      {
        question: "Which Indian bread is traditionally baked on the inner wall of a clay tandoor?",
        options: ["Tandoori Roti", "Bhatura", "Rumali Roti", "Puri"],
        correct: 0,
        explanation: "Tandoori Roti is baked at ultra-high heat inside clay ovens.",
      },
      {
        question: "What gives authentic Dal Makhani its signature velvety smoothness?",
        options: ["Butter & Fresh Cream", "Condensed Milk", "Coconut Milk", "Soy Cream"],
        correct: 0,
        explanation: "Slow simmering with white butter and fresh cream gives Dal Makhani its iconic flavor.",
      },
      {
        question: "In Biryani cooking, what does the technique 'Dum' literally mean?",
        options: ["Air-tight slow steam", "Deep frying", "Open roasting", "Boiling"],
        correct: 0,
        explanation: "Dum means cooking with trapped fragrant steam in a sealed pot.",
      },
    ],
  },
  {
    id: "biryani-trivia",
    title: "Biryani & Kebabs Trivia",
    desc: "Test your Mughlai aroma knowledge and grab a complimentary bread basket!",
    reward: "Free Garlic Butter Naan (2 Pcs)",
    badge: "Quick 2-Min",
    questions: [
      {
        question: "Which city is globally famous for its fragrant Kachchi Dum Biryani?",
        options: ["Hyderabad", "Kolkata", "Lucknow", "Delhi"],
        correct: 0,
        explanation: "Hyderabad is legendary for its authentic Kachchi Dum Biryani recipe.",
      },
      {
        question: "What imparts the rich royal golden aroma to biryani rice?",
        options: ["Pure Saffron (Kesar)", "Turmeric only", "Mustard Oil", "Paprika"],
        correct: 0,
        explanation: "Saffron strands soaked in warm milk impart royal color and fragrance.",
      },
      {
        question: "Which cool yogurt side accompaniment is traditionally paired with spicy biryani?",
        options: ["Burani Raita", "Fruit Custard", "Rabdi", "Kheer"],
        correct: 0,
        explanation: "Burani Raita (garlic-spiced curd) balances spicy biryani perfectly.",
      },
    ],
  },
];

export default function CustomerGameModal({
  isOpen,
  onClose,
  tableTitle,
  placedOrder,
  onClaimReward,
  onQuizCompleted,
}) {
  const [view, setView] = useState("menu");
  const [currentQuiz, setCurrentQuiz] = useState(null);
  const [questionIdx, setQuestionIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [score, setScore] = useState(0);
  const [timer, setTimer] = useState(15);
  const [isAnswered, setIsAnswered] = useState(false);
  const [wonReward, setWonReward] = useState(null);
  const [availableQuizzes, setAvailableQuizzes] = useState(FALLBACK_GAMES);
  const [alreadyPlayed, setAlreadyPlayed] = useState(false);
  const [existingPlayRecord, setExistingPlayRecord] = useState(null);
  const [isCheckingEligibility, setIsCheckingEligibility] = useState(false);

  // Check order eligibility on open
  useEffect(() => {
    if (!isOpen) return;

    setView("menu");
    setWonReward(null);
    setCurrentQuiz(null);

    const orderId = placedOrder?.id;
    if (orderId) {
      setIsCheckingEligibility(true);
      checkOrderQuizEligibility(orderId)
        .then((res) => {
          if (res && res.canPlay === false) {
            setAlreadyPlayed(true);
            setExistingPlayRecord(res.data);
            if (res.data?.isWinner && res.data?.dish) {
              setWonReward({
                title: res.data.dish,
                source: res.data.quiz,
              });
            }
          } else {
            setAlreadyPlayed(false);
            setExistingPlayRecord(null);
          }
        })
        .catch(() => {
          setAlreadyPlayed(false);
        })
        .finally(() => {
          setIsCheckingEligibility(false);
        });
    } else {
      setAlreadyPlayed(false);
    }

    // Also load quizzes from server
    getAllQuizzes({ status: "Active" })
      .then((res) => {
        if (res && res.success && Array.isArray(res.data) && res.data.length > 0) {
          const mapped = res.data
            .map((q) => {
              let parsedQuestions = [];
              if (typeof q.questions === "string") {
                try {
                  parsedQuestions = JSON.parse(q.questions);
                } catch {
                  parsedQuestions = [];
                }
              } else if (Array.isArray(q.questions)) {
                parsedQuestions = q.questions;
              }

              const validQuestions = Array.isArray(parsedQuestions)
                ? parsedQuestions.filter(
                    (quest) =>
                      quest &&
                      quest.question &&
                      Array.isArray(quest.options) &&
                      quest.options.length > 0
                  )
                : [];

              return {
                id: q.id,
                dbId: q.id,
                title: q.title,
                desc: q.description,
                reward: q.reward,
                badge: q.duration || "Quick Quiz",
                questions:
                  validQuestions.length > 0
                    ? validQuestions
                    : FALLBACK_GAMES[0].questions,
              };
            })
            .filter(Boolean);

          if (mapped.length > 0) {
            setAvailableQuizzes(mapped);
          } else {
            setAvailableQuizzes(FALLBACK_GAMES);
          }
        } else {
          setAvailableQuizzes(FALLBACK_GAMES);
        }
      })
      .catch(() => {
        setAvailableQuizzes(FALLBACK_GAMES);
      });
  }, [isOpen, placedOrder]);

  // Question Timer
  useEffect(() => {
    let interval = null;
    if (view === "quiz" && !isAnswered && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            handleTimeOut();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [view, isAnswered, timer]);

  if (!isOpen) return null;

  const handleTimeOut = () => {
    setIsAnswered(true);
    setSelectedOption(-1);
    playSound("wrong");
    setTimeout(() => {
      advanceQuestion(score);
    }, 1800);
  };

  const startQuiz = (quiz) => {
    if (alreadyPlayed || !quiz) return;
    let questions = [];
    if (Array.isArray(quiz.questions) && quiz.questions.length > 0) {
      questions = quiz.questions;
    } else if (typeof quiz.questions === "string") {
      try {
        const parsed = JSON.parse(quiz.questions);
        if (Array.isArray(parsed) && parsed.length > 0) questions = parsed;
        else questions = FALLBACK_GAMES[0].questions;
      } catch {
        questions = FALLBACK_GAMES[0].questions;
      }
    } else {
      questions = FALLBACK_GAMES[0].questions;
    }

    setCurrentQuiz({
      ...quiz,
      questions,
    });
    setQuestionIdx(0);
    setSelectedOption(null);
    setScore(0);
    setTimer(15);
    setIsAnswered(false);
    setView("quiz");
  };

  const handleSelectOption = (idx) => {
    if (isAnswered || !currentQuiz?.questions?.[questionIdx]) return;
    setIsAnswered(true);
    setSelectedOption(idx);

    const currentQ = currentQuiz.questions[questionIdx];
    const isCorrect = currentQ && idx === currentQ.correct;
    const nextScore = isCorrect ? score + 1 : score;
    if (isCorrect) {
      setScore(nextScore);
      playSound("correct");
    } else {
      playSound("wrong");
    }

    setTimeout(() => {
      advanceQuestion(nextScore);
    }, 1500);
  };

  const advanceQuestion = async (finalScoreSoFar) => {
    const totalQ = Array.isArray(currentQuiz?.questions) ? currentQuiz.questions.length : 0;
    if (questionIdx + 1 < totalQ) {
      setQuestionIdx((prev) => prev + 1);
      setSelectedOption(null);
      setTimer(15);
      setIsAnswered(false);
    } else {
      // Quiz Finished!
      const total = currentQuiz.questions.length;
      const isWinner = finalScoreSoFar >= Math.ceil(total * 0.7);
      const scoreStr = `${finalScoreSoFar}/${total} (${Math.round((finalScoreSoFar / total) * 100)}%)`;
      const dishWon = isWinner ? currentQuiz.reward : "None (<70% Score)";

      let rewardObj = null;
      if (isWinner) {
        rewardObj = {
          title: currentQuiz.reward,
          source: currentQuiz.title,
        };
        setWonReward(rewardObj);
        playSound("win");
      }

      // Record to MySQL backend database (1 play per order)
      try {
        const payload = {
          orderId: placedOrder?.id || null,
          table: placedOrder?.table || tableTitle,
          customerName: placedOrder?.customerName || "Diner Guest",
          quizTitle: currentQuiz.title,
          score: scoreStr,
          dish: dishWon,
          billAmount: placedOrder?.amount || "₹0",
          isWinner: Boolean(isWinner),
          quizId: currentQuiz.dbId || null,
        };

        const res = await recordQuizPlaySession(payload);
        if (res && res.success) {
          setAlreadyPlayed(true);
          setExistingPlayRecord(res.data);
          if (onQuizCompleted) onQuizCompleted(res.data);
        } else if (res && res.alreadyPlayed) {
          setAlreadyPlayed(true);
          setExistingPlayRecord(res.data);
        }
      } catch (err) {
        console.warn("Could not record quiz play:", err);
      }

      setView("result");
    }
  };

  const handleClaimAndClose = () => {
    if (wonReward && onClaimReward) {
      onClaimReward(wonReward);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-md p-3 sm:p-4 animate-fade-in font-poppins">
      <div className="bg-white w-full max-w-md rounded-[32px] shadow-2xl border border-slate-100 overflow-hidden flex flex-col relative max-h-[92vh] animate-fade-in-up">
        {/* Top Floating Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
        >
          <X size={16} />
        </button>

        {/* VIEW 1: ARCADE GAME SELECTION MENU */}
        {view === "menu" && (
          <div className="p-6 sm:p-7 overflow-y-auto">
            <div className="text-center">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100 text-orange-700 font-extrabold text-xs mb-3 border border-orange-200 shadow-xs">
                <Sparkles size={13} className="text-amber-500" />
                <span>Diner Arcade • {tableTitle}</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
                Play & Win <span className="text-orange-500">Free Food!</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                Chefs are cooking your order right now. Win a complimentary dish while you wait!
              </p>
            </div>

            {/* 1 Play per Order Notice if already played */}
            {alreadyPlayed && (
              <div className="my-4 p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-left">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm">
                    <Award size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full mb-1">
                      <AlertCircle size={10} />
                      1 Play per Order Reached
                    </span>
                    <h4 className="text-xs font-black text-slate-900 leading-snug">
                      Trivia already completed for this order!
                    </h4>
                    <p className="text-[11px] text-slate-600 mt-0.5 leading-tight">
                      Order {placedOrder?.id || "ticket"} has already used its trivia play. Only 1 game is allowed per order.
                    </p>

                    {existingPlayRecord && (
                      <div className="mt-2.5 pt-2 border-t border-amber-200/80 grid grid-cols-2 gap-2 text-[11px]">
                        <div>
                          <span className="text-slate-400 block text-[9px] uppercase font-bold">Player</span>
                          <span className="font-bold text-slate-800">{existingPlayRecord.customerName}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[9px] uppercase font-bold">Score</span>
                          <span className="font-bold text-slate-800">{existingPlayRecord.score}</span>
                        </div>
                        <div className="col-span-2">
                          <span className="text-slate-400 block text-[9px] uppercase font-bold">Reward Won</span>
                          <span className="font-black text-emerald-600">{existingPlayRecord.dish}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Challenges Cards */}
            <div className="my-5 space-y-3">
              {(Array.isArray(availableQuizzes) ? availableQuizzes : FALLBACK_GAMES).map((game) => (
                <div
                  key={game.id}
                  onClick={() => {
                    if (!alreadyPlayed) {
                      startQuiz(game);
                    }
                  }}
                  className={`p-4 rounded-2xl border transition-all text-left relative overflow-hidden ${
                    alreadyPlayed
                      ? "opacity-60 bg-slate-50 border-slate-200 cursor-not-allowed"
                      : "border-slate-200 hover:border-orange-400 bg-gradient-to-r from-orange-50/40 via-white to-amber-50/40 hover:shadow-md cursor-pointer group"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-orange-500/25 group-hover:scale-105 transition-transform">
                        <Trophy size={18} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-black text-xs sm:text-sm text-slate-900 leading-tight">
                            {game.title}
                          </h4>
                          <span className="px-1.5 py-0.5 rounded-md bg-orange-500 text-white text-[9px] font-black uppercase tracking-wider">
                            {game.badge}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                          {game.desc}
                        </p>
                        <div className="mt-2 flex items-center gap-1.5 text-xs font-black text-orange-600">
                          <Gift size={13} />
                          <span>Win: {game.reward}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={onClose}
                className="text-xs font-bold text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                Back to Order Status
              </button>
            </div>
          </div>
        )}

        {/* VIEW 2: LIVE TRIVIA QUIZ SCREEN */}
        {view === "quiz" && currentQuiz && (
          <div className="p-6 sm:p-7 flex flex-col justify-between flex-1 overflow-y-auto">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-xs font-extrabold text-orange-600 uppercase tracking-wider flex items-center gap-1">
                  <Trophy size={14} />
                  <span>{currentQuiz.title}</span>
                </span>

                <div
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black ${
                    timer <= 5
                      ? "bg-red-100 text-red-600 animate-pulse border border-red-200"
                      : "bg-slate-100 text-slate-700"
                  }`}
                >
                  <Clock size={12} />
                  <span>{timer}s</span>
                </div>
              </div>

              <div className="w-full bg-slate-100 h-1.5 rounded-full my-4 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-orange-500 to-amber-500 h-full transition-all duration-300"
                  style={{
                    width: `${((questionIdx + 1) / (Array.isArray(currentQuiz?.questions) && currentQuiz.questions.length > 0 ? currentQuiz.questions.length : 1)) * 100}%`,
                  }}
                />
              </div>

              <div className="text-[11px] font-black text-slate-400 uppercase tracking-wider">
                Question {questionIdx + 1} of {Array.isArray(currentQuiz?.questions) ? currentQuiz.questions.length : 1}
              </div>

              <h3 className="mt-2 text-base sm:text-lg font-black text-slate-900 leading-snug">
                {currentQuiz?.questions?.[questionIdx]?.question || "Trivia Question"}
              </h3>

              <div className="mt-5 space-y-2.5">
                {Array.isArray(currentQuiz?.questions?.[questionIdx]?.options) &&
                  currentQuiz.questions[questionIdx].options.map((opt, optIdx) => {
                    const isCorrect = optIdx === currentQuiz.questions[questionIdx].correct;
                    const isChosen = selectedOption === optIdx;

                    let btnStyle = "bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100";
                    if (isAnswered) {
                      if (isCorrect) {
                        btnStyle = "bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-500/25";
                      } else if (isChosen) {
                        btnStyle = "bg-red-500 text-white border-red-500 shadow-md shadow-red-500/25";
                      } else {
                        btnStyle = "bg-slate-50 border-slate-200 text-slate-400 opacity-60";
                      }
                    }

                    return (
                      <button
                        key={optIdx}
                        type="button"
                        disabled={isAnswered}
                        onClick={() => handleSelectOption(optIdx)}
                        className={`w-full p-3.5 rounded-2xl border text-left text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-between ${btnStyle}`}
                      >
                        <span>{opt}</span>
                        {isAnswered && isCorrect && <CheckCircle2 size={16} />}
                        {isAnswered && isChosen && !isCorrect && <XCircle size={16} />}
                      </button>
                    );
                  })}
              </div>

              {isAnswered && currentQuiz?.questions?.[questionIdx]?.explanation && (
                <div className="mt-4 p-3 rounded-xl bg-orange-50 border border-orange-200 text-[11px] text-orange-800 animate-fade-in flex items-center gap-2">
                  <Sparkles size={14} className="shrink-0 text-orange-600" />
                  <span>{currentQuiz.questions[questionIdx].explanation}</span>
                </div>
              )}
            </div>

            <div className="pt-4 mt-6 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 font-bold">
              <span>Score: {score} Correct</span>
              <span>Reward: {currentQuiz.reward}</span>
            </div>
          </div>
        )}

        {/* VIEW 3: QUIZ RESULT & REWARD SCREEN */}
        {view === "result" && currentQuiz && (
          <div className="p-6 sm:p-7 text-center overflow-y-auto">
            {wonReward ? (
              <div>
                <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center mb-4 shadow-xl shadow-emerald-500/20 animate-bounce">
                  <Trophy size={42} />
                </div>

                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black mb-2">
                  <Sparkles size={13} className="text-emerald-600" />
                  <span>Trivia Winner • Score: {score}/{currentQuiz.questions.length}</span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  Congratulations!
                </h2>
                <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                  You scored high in the {currentQuiz.title}. Your free reward is ready!
                </p>

                <div className="my-5 p-4 rounded-2xl bg-gradient-to-r from-orange-50 via-amber-50 to-orange-50 border-2 border-dashed border-orange-400 text-center shadow-xs">
                  <span className="text-[10px] font-black uppercase text-orange-600 tracking-widest block">
                    Complimentary Reward Unlocked
                  </span>
                  <div className="mt-1 text-base sm:text-lg font-black text-slate-900">
                    {wonReward.title}
                  </div>
                  <p className="text-xs font-semibold text-slate-600 mt-3">
                    Inform your waiter to claim this complimentary reward with your order!
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleClaimAndClose}
                  className="w-full py-3.5 rounded-full text-xs font-black text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg shadow-emerald-600/30 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Check size={16} className="stroke-[3]" />
                  <span>Claim & Attach to {tableTitle}</span>
                </button>
              </div>
            ) : (
              <div>
                <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-600 mx-auto flex items-center justify-center mb-4 shadow-lg shadow-amber-500/20">
                  <Award size={36} />
                </div>

                <h3 className="text-xl font-black text-slate-900">Good Effort!</h3>
                <p className="text-xs text-slate-500 mt-1">
                  You scored {score} out of {currentQuiz.questions.length}. Need at least 70% to win the free dish.
                </p>

                <div className="mt-6 space-y-2.5">
                  <p className="text-[11px] text-slate-400">
                    Only 1 trivia game allowed per table order.
                  </p>
                  <button
                    type="button"
                    onClick={onClose}
                    className="w-full py-3 rounded-full text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
                  >
                    Close & Back to Order
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

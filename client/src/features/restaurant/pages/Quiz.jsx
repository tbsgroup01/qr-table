import { useState, useEffect } from "react";
import {
  HelpCircle,
  Trophy,
  Award,
  Sparkles,
  CheckCircle2,
  Clock,
  Plus,
  Search,
  Eye,
  Edit2,
  Trash2,
  X,
  Save,
  Gift,
  Play,
  RotateCcw,
  UtensilsCrossed,
  List,
  LayoutGrid,
} from "lucide-react";
import { useTheme } from "../../../context/ThemeContext";
import Cards from "../../../components/Cards";
import {
  getAllQuizzes,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  toggleQuizStatus,
} from "../../../services/quizServices";

export default function Quiz() {
  const { isDark } = useTheme();

  const [viewMode, setViewMode] = useState("table"); // "table" | "cards"
  const [activeTab, setActiveTab] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState(null);
  const [previewQuiz, setPreviewQuiz] = useState(null);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  // Bulk Selection & Deletion States
  const [selectedIds, setSelectedIds] = useState([]);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const [quizList, setQuizList] = useState([]);

  const fetchQuizzes = async () => {
    try {
      const res = await getAllQuizzes();
      if (res && res.success && Array.isArray(res.data)) {
        const formatted = res.data.map((q) => {
          let parsedQuestions = [];
          try {
            parsedQuestions =
              typeof q.questions === "string" ? JSON.parse(q.questions) : q.questions || [];
          } catch {
            parsedQuestions = [];
          }
          return {
            id: q.id,
            title: q.title,
            description: q.description || "",
            duration: q.duration || "2 mins",
            reward: q.reward || "Free Dessert",
            status: q.status || "Active",
            questionsCount: parsedQuestions.length || q.questionsCount || 0,
            plays: q.plays || 0,
            winners: q.winners || 0,
            questions: parsedQuestions,
          };
        });
        setQuizList(formatted);
      }
    } catch (err) {
      console.warn("Could not fetch quizzes from DB:", err.message);
    }
  };

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    duration: "2 mins",
    reward: "",
    status: "Active",
    questions: [
      {
        question: "",
        options: ["", "", "", ""],
        correct: 0,
      },
    ],
  });

  const totalQuizzes = quizList.length;
  const activeQuizzes = quizList.filter((q) => q.status === "Active").length;
  const totalPlays = quizList.reduce((acc, q) => acc + q.plays, 0);
  const totalWinners = quizList.reduce((acc, q) => acc + q.winners, 0);

  const metricCards = [
    {
      title: "Total Table Quizzes",
      value: totalQuizzes.toString(),
      icon: HelpCircle,
      iconColor: "text-blue-500 dark:text-blue-400",
      iconBg: "bg-blue-500/10 border-blue-500/20",
      glowColor: "from-blue-500/20 via-blue-500/5 to-transparent",
      accentBorder: "hover:border-blue-500/40",
    },
    {
      title: "Active Live Trivia",
      value: activeQuizzes.toString(),
      icon: Sparkles,
      iconColor: "text-orange-500 dark:text-orange-400",
      iconBg: "bg-orange-500/10 border-orange-500/20",
      glowColor: "from-orange-500/20 via-orange-500/5 to-transparent",
      accentBorder: "hover:border-orange-500/40",
    },
    {
      title: "Total Customer Plays",
      value: totalPlays.toLocaleString(),
      icon: Trophy,
      iconColor: "text-amber-500 dark:text-amber-400",
      iconBg: "bg-amber-500/10 border-amber-500/20",
      glowColor: "from-amber-500/20 via-amber-500/5 to-transparent",
      accentBorder: "hover:border-amber-500/40",
    },
    {
      title: "Rewards Claimed",
      value: totalWinners.toLocaleString(),
      icon: Gift,
      iconColor: "text-emerald-500 dark:text-emerald-400",
      iconBg: "bg-emerald-500/10 border-emerald-500/20",
      glowColor: "from-emerald-500/20 via-emerald-500/5 to-transparent",
      accentBorder: "hover:border-emerald-500/40",
    },
  ];

  const handleOpenAdd = () => {
    setEditingQuiz(null);
    setFormData({
      title: "",
      description: "",
      duration: "2 mins",
      reward: "",
      status: "Active",
      questions: [
        {
          question: "",
          options: ["", "", "", ""],
          correct: 0,
        },
      ],
    });
    setIsDrawerOpen(true);
  };

  const handleOpenEdit = (quiz) => {
    setEditingQuiz(quiz);
    setFormData({
      title: quiz.title,
      description: quiz.description,
      duration: quiz.duration,
      reward: quiz.reward,
      status: quiz.status,
      questions: JSON.parse(JSON.stringify(quiz.questions)),
    });
    setIsDrawerOpen(true);
  };

  // Bulk Selection Handlers
  const handleToggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    const allFilteredIds = filteredQuizzes.map((q) => q.id);
    const areAllSelected =
      allFilteredIds.length > 0 &&
      allFilteredIds.every((id) => selectedIds.includes(id));

    if (areAllSelected) {
      setSelectedIds((prev) =>
        prev.filter((id) => !allFilteredIds.includes(id))
      );
    } else {
      setSelectedIds((prev) => [
        ...prev,
        ...allFilteredIds.filter((id) => !prev.includes(id)),
      ]);
    }
  };

  const confirmDelete = async () => {
    if (deleteConfirm && deleteConfirm.ids.length > 0) {
      const idsToDelete = deleteConfirm.ids;
      setQuizList((prev) =>
        prev.filter((q) => !idsToDelete.includes(q.id))
      );
      setSelectedIds((prev) =>
        prev.filter((id) => !idsToDelete.includes(id))
      );
      if (previewQuiz && idsToDelete.includes(previewQuiz.id)) {
        setPreviewQuiz(null);
      }
      setDeleteConfirm(null);

      try {
        for (const id of idsToDelete) {
          await deleteQuiz(id);
        }
      } catch (err) {
        console.warn("Delete quiz error:", err.message);
      }
    }
  };

  const handleToggleStatus = async (id) => {
    setQuizList((prev) =>
      prev.map((q) => {
        if (q.id === id) {
          return {
            ...q,
            status: q.status === "Active" ? "Inactive" : "Active",
          };
        }
        return q;
      })
    );
    try {
      await toggleQuizStatus(id);
    } catch (err) {
      console.warn("Toggle quiz status error:", err.message);
    }
  };

  const handleBatchStatus = async (newStatus) => {
    const ids = [...selectedIds];
    setQuizList((prev) =>
      prev.map((q) => (ids.includes(q.id) ? { ...q, status: newStatus } : q))
    );
    setSelectedIds([]);

    for (const id of ids) {
      try {
        await updateQuiz(id, { status: newStatus });
      } catch (err) {
        console.warn("Batch status update error:", err.message);
      }
    }
  };

  const handleAddQuestionRow = () => {
    setFormData({
      ...formData,
      questions: [
        ...formData.questions,
        {
          question: "",
          options: ["", "", "", ""],
          correct: 0,
        },
      ],
    });
  };

  const handleRemoveQuestionRow = (idx) => {
    if (formData.questions.length <= 1) return;
    setFormData({
      ...formData,
      questions: formData.questions.filter((_, i) => i !== idx),
    });
  };

  const handleQuestionTextChange = (idx, text) => {
    const updated = [...formData.questions];
    updated[idx].question = text;
    setFormData({ ...formData, questions: updated });
  };

  const handleOptionChange = (qIdx, optIdx, text) => {
    const updated = [...formData.questions];
    updated[qIdx].options[optIdx] = text;
    setFormData({ ...formData, questions: updated });
  };

  const handleCorrectSelect = (qIdx, optIdx) => {
    const updated = [...formData.questions];
    updated[qIdx].correct = optIdx;
    setFormData({ ...formData, questions: updated });
  };

  const handleSaveForm = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.reward.trim()) return;

    const payload = {
      title: formData.title.trim(),
      description: formData.description,
      duration: formData.duration,
      reward: formData.reward,
      status: formData.status,
      questions: formData.questions,
    };

    setIsDrawerOpen(false);

    if (editingQuiz) {
      setQuizList((prev) =>
        prev.map((q) =>
          q.id === editingQuiz.id
            ? {
                ...q,
                ...payload,
                questionsCount: formData.questions.length,
              }
            : q
        )
      );
      try {
        await updateQuiz(editingQuiz.id, payload);
      } catch (err) {
        console.warn("Update quiz error:", err.message);
      }
    } else {
      try {
        const res = await createQuiz(payload);
        if (res && res.success && res.data) {
          const newQuiz = {
            id: res.data.id,
            ...payload,
            questionsCount: formData.questions.length,
            plays: 0,
            winners: 0,
          };
          setQuizList([newQuiz, ...quizList]);
        } else {
          fetchQuizzes();
        }
      } catch (err) {
        console.warn("Create quiz error:", err.message);
        fetchQuizzes();
      }
    }
  };

  const handleStartPlay = (quiz) => {
    setPreviewQuiz(quiz);
    setCurrentQuestionIdx(0);
    setSelectedOption(null);
    setScore(0);
    setQuizFinished(false);
  };

  const handleSelectOptionInPlay = (optIdx) => {
    if (selectedOption !== null) return;
    setSelectedOption(optIdx);
    const currQ = previewQuiz.questions[currentQuestionIdx];
    if (optIdx === currQ.correct) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIdx + 1 < previewQuiz.questions.length) {
      setCurrentQuestionIdx((prev) => prev + 1);
      setSelectedOption(null);
    } else {
      setQuizFinished(true);
    }
  };

  const handleRestartQuiz = () => {
    setCurrentQuestionIdx(0);
    setSelectedOption(null);
    setScore(0);
    setQuizFinished(false);
  };

  const filteredQuizzes = quizList.filter((q) => {
    const matchesSearch =
      q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.reward.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesTab =
      activeTab === "ALL" ||
      (activeTab === "ACTIVE" && q.status === "Active") ||
      (activeTab === "INACTIVE" && (q.status === "Inactive" || q.status === "Draft")) ||
      (activeTab === "DRAFT" && (q.status === "Draft" || q.status === "Inactive"));

    return matchesSearch && matchesTab;
  });

  return (
    <div className="space-y-6 pb-12 select-none relative">
      <header
        data-aos="fade-down"
        data-aos-duration="500"
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 relative"
      >
        <div>
          <h1
            className={`text-2xl sm:text-3xl font-extrabold tracking-tight leading-none ${
              isDark ? "text-white" : "text-slate-900"
            }`}
          >
            Customer Quizzes & Trivia
          </h1>
          <p className="text-sm text-slate-400 mt-1.5">
            Engage diners at tables with fun trivia quizzes, tabular management, and complimentary rewards
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-md shadow-orange-500/25 transition-all duration-200 hover:scale-[1.02] active:scale-95 cursor-pointer self-start sm:self-auto"
        >
          <Plus size={16} className="stroke-[2.5]" />
          <span>Create New Quiz</span>
        </button>
      </header>

      <Cards items={metricCards} />

      {/* Control Bar: Filters, View Mode Toggle & Search */}
      <div
        data-aos="fade-up"
        data-aos-delay="100"
        className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3.5"
      >
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Status Tabs */}
          <div
            className={`p-1 rounded-xl flex items-center gap-1 border ${
              isDark
                ? "bg-white/[0.03] border-white/10"
                : "bg-white border-slate-200 shadow-sm"
            }`}
          >
            {[
              { id: "ALL", label: `All (${quizList.length})` },
              { id: "ACTIVE", label: `Active (${activeQuizzes})` },
              { id: "INACTIVE", label: `Inactive (${quizList.length - activeQuizzes})` },
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${
                    isActive
                      ? "bg-gradient-to-r from-orange-500 to-amber-500 !text-white shadow-sm shadow-orange-500/20"
                      : isDark
                      ? "text-slate-400 hover:text-white hover:bg-white/[0.06]"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* View Mode Toggle: Table View vs Grid Cards */}
          <div
            className={`p-1 rounded-xl flex items-center gap-1 border ${
              isDark
                ? "bg-white/[0.03] border-white/10"
                : "bg-white border-slate-200 shadow-sm"
            }`}
          >
            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all duration-200 cursor-pointer ${
                viewMode === "table"
                  ? "bg-gradient-to-r from-orange-500 to-amber-500 !text-white shadow-sm shadow-orange-500/20"
                  : isDark
                  ? "text-slate-400 hover:text-white hover:bg-white/[0.06]"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
              title="Table View with Multi-Select"
            >
              <List size={14} />
              <span>Table View</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("cards")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all duration-200 cursor-pointer ${
                viewMode === "cards"
                  ? "bg-gradient-to-r from-orange-500 to-amber-500 !text-white shadow-sm shadow-orange-500/20"
                  : isDark
                  ? "text-slate-400 hover:text-white hover:bg-white/[0.06]"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
              title="Cards Grid View"
            >
              <LayoutGrid size={14} />
              <span>Quiz Cards</span>
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative min-w-[240px] sm:w-72">
          <Search
            size={15}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            placeholder="Search quizzes, rewards..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full pl-9 pr-3.5 py-2 rounded-xl text-xs font-medium border outline-none transition-all ${
              isDark
                ? "bg-white/[0.04] border-white/10 text-white placeholder-slate-500 focus:border-orange-500/60"
                : "bg-white border-slate-200 text-slate-800 placeholder-slate-400 focus:border-orange-500/60 shadow-sm"
            }`}
          />
        </div>
      </div>

      {/* Floating Bulk Action Bar */}
      {selectedIds.length > 0 && (
        <div
          data-aos="zoom-in"
          className="p-3 sm:p-4 rounded-2xl bg-gradient-to-r from-orange-500/15 via-amber-500/10 to-orange-500/15 border border-orange-500/30 flex flex-wrap items-center justify-between gap-3 shadow-lg shadow-orange-500/5 animate-fade-in"
        >
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-pulse" />
            <span className="text-xs sm:text-sm font-extrabold text-orange-600 dark:text-orange-400">
              {selectedIds.length} quiz{selectedIds.length > 1 ? "zes" : ""} selected
            </span>
            <button
              type="button"
              onClick={() => setSelectedIds([])}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 underline cursor-pointer"
            >
              Clear selection
            </button>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => handleBatchStatus("Active")}
              className="px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <CheckCircle2 size={13} />
              <span>Set Active</span>
            </button>

            <button
              type="button"
              onClick={() => handleBatchStatus("Draft")}
              className="px-3 py-1.5 rounded-xl bg-slate-500/10 hover:bg-slate-500/20 text-slate-600 dark:text-slate-400 border border-slate-500/30 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Clock size={13} />
              <span>Set Draft</span>
            </button>

            {/* Bulk Delete Button */}
            <button
              type="button"
              onClick={() =>
                setDeleteConfirm({
                  ids: selectedIds,
                  count: selectedIds.length,
                })
              }
              className="px-3.5 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-rose-500/25 transition-all cursor-pointer active:scale-95"
            >
              <Trash2 size={13} />
              <span>Delete Selected ({selectedIds.length})</span>
            </button>
          </div>
        </div>
      )}

      {/* VIEW 1: Modern Table View with Multi-Select and Row Actions */}
      {viewMode === "table" ? (
        <div
          data-aos="fade-up"
          data-aos-delay="150"
          className={`rounded-2xl border overflow-hidden shadow-xl ${
            isDark
              ? "bg-white/[0.03] backdrop-blur-2xl border-white/[0.08]"
              : "bg-white/80 backdrop-blur-2xl border-slate-200/80 shadow-[0_8px_30px_rgba(0,0,0,0.04)]"
          }`}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr
                  className={`border-b text-[11px] font-bold uppercase tracking-wider ${
                    isDark
                      ? "bg-white/[0.02] border-white/10 text-slate-400"
                      : "bg-slate-50/80 border-slate-200 text-slate-500"
                  }`}
                >
                  <th className="py-3.5 px-4 w-12 text-center">
                    <input
                      type="checkbox"
                      checked={
                        filteredQuizzes.length > 0 &&
                        filteredQuizzes.every((q) => selectedIds.includes(q.id))
                      }
                      onChange={handleSelectAll}
                      className="w-4 h-4 rounded text-orange-500 focus:ring-orange-500 cursor-pointer accent-orange-500"
                      title="Select all quizzes"
                    />
                  </th>
                  <th className="py-3.5 px-4">Quiz Title & Description</th>
                  <th className="py-3.5 px-4">Winner Reward (Free Dish)</th>
                  <th className="py-3.5 px-4">Questions & Duration</th>
                  <th className="py-3.5 px-4">Plays & Winners</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/[0.06] text-xs">
                {filteredQuizzes.map((quiz) => {
                  const isSelected = selectedIds.includes(quiz.id);
                  return (
                    <tr
                      key={quiz.id}
                      className={`transition-colors ${
                        isSelected
                          ? isDark
                            ? "bg-orange-500/10"
                            : "bg-orange-50/80"
                          : isDark
                          ? "hover:bg-white/[0.02]"
                          : "hover:bg-slate-50/60"
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-3.5 px-4 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(quiz.id)}
                          className="w-4 h-4 rounded text-orange-500 focus:ring-orange-500 cursor-pointer accent-orange-500"
                        />
                      </td>

                      {/* Quiz Title & Description */}
                      <td className="py-3.5 px-4 max-w-sm">
                        <div
                          className={`font-extrabold text-sm tracking-tight ${
                            isDark ? "text-white" : "text-slate-900"
                          }`}
                        >
                          {quiz.title}
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                          {quiz.description}
                        </p>
                      </td>

                      {/* Winner Reward */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-500 font-bold text-xs">
                          <UtensilsCrossed size={13} className="shrink-0" />
                          <span>{quiz.reward}</span>
                        </div>
                      </td>

                      {/* Questions Count & Duration */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-bold">
                          {quiz.questionsCount} Questions
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <Clock size={11} />
                          <span>{quiz.duration}</span>
                        </div>
                      </td>

                      {/* Plays & Winners */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-extrabold text-sm">
                          {quiz.plays.toLocaleString()} plays
                        </div>
                        <div className="text-[11px] text-emerald-500 font-semibold flex items-center gap-1 mt-0.5">
                          <Trophy size={11} />
                          <span>{quiz.winners.toLocaleString()} claimed</span>
                        </div>
                      </td>

                      {/* Status Toggle Switch */}
                      <td
                        className="py-3.5 px-4 whitespace-nowrap"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleStatus(quiz.id);
                            }}
                            className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                              quiz.status === "Active"
                                ? "bg-emerald-500 shadow-sm shadow-emerald-500/30"
                                : isDark
                                ? "bg-slate-700"
                                : "bg-slate-300"
                            }`}
                            role="switch"
                            aria-checked={quiz.status === "Active"}
                            title={`Click to switch to ${quiz.status === "Active" ? "Inactive" : "Active"}`}
                          >
                            <span
                              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                                quiz.status === "Active" ? "translate-x-5" : "translate-x-0"
                              }`}
                            />
                          </button>
                          <span
                            className={`text-[11px] font-bold ${
                              quiz.status === "Active"
                                ? "text-emerald-500"
                                : "text-slate-400"
                            }`}
                          >
                            {quiz.status === "Active" ? "Active" : "Inactive"}
                          </span>
                        </div>
                      </td>

                      {/* Row Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleStartPlay(quiz)}
                            className="px-2.5 py-1 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs transition-all cursor-pointer flex items-center gap-1 active:scale-95 shadow-xs"
                            title="Play Preview"
                          >
                            <Play size={11} className="fill-white" />
                            <span className="hidden sm:inline">Play</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleOpenEdit(quiz)}
                            className={`p-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                              isDark
                                ? "bg-white/5 hover:bg-white/10 border-white/10 text-slate-300 hover:text-white"
                                : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700"
                            }`}
                            title="Edit Quiz"
                          >
                            <Edit2 size={13} />
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              setDeleteConfirm({
                                ids: [quiz.id],
                                count: 1,
                                title: quiz.title,
                              })
                            }
                            className="p-1.5 rounded-lg border border-rose-500/20 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white transition-all cursor-pointer"
                            title="Delete Quiz"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* VIEW 2: Grid Cards */
        <div
          data-aos="fade-up"
          data-aos-delay="150"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5"
        >
          {filteredQuizzes.map((quiz) => {
            const isSelected = selectedIds.includes(quiz.id);
            return (
              <div
                key={quiz.id}
                className={`p-5 rounded-2xl border shadow-xl flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 relative ${
                  isSelected ? "ring-2 ring-orange-500 shadow-orange-500/15" : ""
                } ${
                  isDark
                    ? "bg-white/[0.03] backdrop-blur-2xl border-white/[0.08]"
                    : "bg-white/70 backdrop-blur-2xl border-white/80 shadow-[0_8px_30px_rgba(0,0,0,0.04)]"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/10">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleSelect(quiz.id)}
                        className="w-4 h-4 rounded text-orange-500 focus:ring-orange-500 cursor-pointer accent-orange-500"
                        title="Select quiz"
                      />
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleStatus(quiz.id);
                          }}
                          className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                            quiz.status === "Active"
                              ? "bg-emerald-500 shadow-sm shadow-emerald-500/30"
                              : isDark
                              ? "bg-slate-700"
                              : "bg-slate-300"
                          }`}
                          role="switch"
                          aria-checked={quiz.status === "Active"}
                          title={`Click to switch to ${quiz.status === "Active" ? "Inactive" : "Active"}`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                              quiz.status === "Active" ? "translate-x-4" : "translate-x-0"
                            }`}
                          />
                        </button>
                        <span
                          className={`text-[11px] font-bold ${
                            quiz.status === "Active"
                              ? "text-emerald-500"
                              : "text-slate-400"
                          }`}
                        >
                          {quiz.status === "Active" ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-slate-400">
                      <Clock size={13} />
                      <span>{quiz.duration}</span>
                    </div>
                  </div>

                  <div className="mt-3.5 space-y-1.5">
                    <h3
                      className={`font-extrabold text-base tracking-tight leading-snug line-clamp-1 ${
                        isDark ? "text-white" : "text-slate-900"
                      }`}
                    >
                      {quiz.title}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {quiz.description}
                    </p>
                  </div>

                  <div className="mt-4 p-3 rounded-xl border bg-orange-500/[0.05] border-orange-500/20 flex items-start gap-2.5">
                    <UtensilsCrossed className="text-orange-500 shrink-0 mt-0.5" size={17} />
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-orange-500 block">
                        Winner Free Dish
                      </span>
                      <p
                        className={`text-xs font-bold ${
                          isDark ? "text-slate-200" : "text-slate-800"
                        }`}
                      >
                        {quiz.reward}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-2 text-center">
                    <div
                      className={`p-2 rounded-xl border ${
                        isDark
                          ? "bg-white/[0.02] border-white/5"
                          : "bg-slate-50 border-slate-100"
                      }`}
                    >
                      <span className="text-[10px] text-slate-400 block font-medium">
                        Questions
                      </span>
                      <span
                        className={`text-sm font-extrabold ${
                          isDark ? "text-white" : "text-slate-900"
                        }`}
                      >
                        {quiz.questionsCount}
                      </span>
                    </div>

                    <div
                      className={`p-2 rounded-xl border ${
                        isDark
                          ? "bg-white/[0.02] border-white/5"
                          : "bg-slate-50 border-slate-100"
                      }`}
                    >
                      <span className="text-[10px] text-slate-400 block font-medium">
                        Played
                      </span>
                      <span
                        className={`text-sm font-extrabold ${
                          isDark ? "text-white" : "text-slate-900"
                        }`}
                      >
                        {quiz.plays} times
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 dark:border-white/10 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => handleStartPlay(quiz)}
                    className="flex-1 py-2 px-3 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-md shadow-orange-500/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                  >
                    <Play size={13} className="fill-white" />
                    <span>Play Preview</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenEdit(quiz)}
                    className={`p-2 rounded-xl border cursor-pointer transition-all ${
                      isDark
                        ? "bg-white/5 hover:bg-white/10 border-white/10 text-slate-300"
                        : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700"
                    }`}
                    title="Edit Quiz"
                  >
                    <Edit2 size={14} />
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setDeleteConfirm({
                        ids: [quiz.id],
                        count: 1,
                        title: quiz.title,
                      })
                    }
                    className="p-2 rounded-xl border border-rose-500/20 bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 cursor-pointer transition-all"
                    title="Delete Quiz"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {filteredQuizzes.length === 0 && (
        <div
          className={`p-12 text-center rounded-2xl border ${
            isDark
              ? "bg-white/[0.02] border-white/10 text-slate-400"
              : "bg-white border-slate-200 text-slate-500"
          }`}
        >
          <HelpCircle size={36} className="mx-auto text-slate-400 mb-2" />
          <h3 className="font-bold text-base">No table quizzes found</h3>
          <p className="text-xs mt-1">
            Click "Create New Quiz" to add exciting trivia challenges for your guests
          </p>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 animate-fade-in">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
            onClick={() => setDeleteConfirm(null)}
          />
          <div
            className={`relative z-10 max-w-md w-full rounded-2xl border p-6 shadow-2xl transition-all ${
              isDark
                ? "bg-[#0c1022] border-white/10 text-white"
                : "bg-white border-slate-200 text-slate-900"
            }`}
          >
            <div className="w-12 h-12 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-500 flex items-center justify-center mb-4">
              <Trash2 size={24} />
            </div>
            <h3 className="text-lg font-extrabold tracking-tight">
              Delete {deleteConfirm.count > 1 ? `${deleteConfirm.count} Quizzes` : "Quiz"}?
            </h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              {deleteConfirm.count > 1
                ? `Are you sure you want to permanently delete these ${deleteConfirm.count} selected table quizzes? Diners will no longer be able to play them.`
                : `Are you sure you want to permanently delete "${deleteConfirm.title || "this quiz"}"? This action cannot be undone.`}
            </p>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteConfirm(null)}
                className={`px-4 py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  isDark
                    ? "bg-white/5 hover:bg-white/10 border-white/10 text-slate-300"
                    : "bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700"
                }`}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="px-4 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold shadow-md shadow-rose-500/25 transition-all cursor-pointer active:scale-95"
              >
                Yes, Delete {deleteConfirm.count > 1 ? `(${deleteConfirm.count})` : ""}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Play Preview Modal */}
      {previewQuiz && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
            onClick={() => setPreviewQuiz(null)}
          />

          <div
            className={`relative w-full max-w-md rounded-3xl p-6 shadow-2xl z-50 border ${
              isDark
                ? "bg-[#0b0f1f] border-white/10 text-white"
                : "bg-white border-slate-200 text-slate-900"
            }`}
          >
            <button
              type="button"
              onClick={() => setPreviewQuiz(null)}
              className="absolute right-4 top-4 w-8 h-8 rounded-full border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-400 hover:text-white cursor-pointer"
            >
              <X size={16} />
            </button>

            {!quizFinished ? (
              <div className="space-y-5">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-orange-500/10 text-orange-500 border border-orange-500/20">
                    <Sparkles size={11} />
                    <span>Table Trivia Experience</span>
                  </div>
                  <h3 className="text-lg font-black tracking-tight">
                    {previewQuiz.title}
                  </h3>
                  <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                    <span>
                      Question {currentQuestionIdx + 1} of{" "}
                      {previewQuiz.questions.length}
                    </span>
                    <span className="font-bold text-orange-500">
                      Score: {score}
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-white/10 h-1.5 rounded-full overflow-hidden mt-1">
                    <div
                      className="bg-gradient-to-r from-orange-500 to-amber-500 h-full transition-all duration-300"
                      style={{
                        width: `${
                          ((currentQuestionIdx + 1) /
                            previewQuiz.questions.length) *
                          100
                        }%`,
                      }}
                    />
                  </div>
                </div>

                <div
                  className={`p-4 rounded-2xl border font-bold text-sm ${
                    isDark
                      ? "bg-white/[0.03] border-white/10 text-white"
                      : "bg-slate-50 border-slate-200 text-slate-900"
                  }`}
                >
                  {previewQuiz.questions[currentQuestionIdx].question}
                </div>

                <div className="space-y-2.5">
                  {previewQuiz.questions[currentQuestionIdx].options.map(
                    (opt, idx) => {
                      const isChosen = selectedOption === idx;
                      const isCorrect =
                        idx ===
                        previewQuiz.questions[currentQuestionIdx].correct;

                      let btnStyle = isDark
                        ? "bg-white/[0.03] border-white/10 text-slate-200 hover:border-orange-500/50"
                        : "bg-slate-50 border-slate-200 text-slate-800 hover:border-orange-500/50";

                      if (selectedOption !== null) {
                        if (isCorrect) {
                          btnStyle =
                            "bg-emerald-500/15 border-emerald-500 text-emerald-500 font-bold";
                        } else if (isChosen) {
                          btnStyle =
                            "bg-rose-500/15 border-rose-500 text-rose-500 font-bold";
                        }
                      }

                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSelectOptionInPlay(idx)}
                          className={`w-full p-3 rounded-xl border text-xs font-semibold text-left transition-all cursor-pointer flex items-center justify-between ${btnStyle}`}
                        >
                          <span>{opt}</span>
                          {selectedOption !== null && isCorrect && (
                            <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                          )}
                        </button>
                      );
                    }
                  )}
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    disabled={selectedOption === null}
                    onClick={handleNextQuestion}
                    className="px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-orange-500 to-amber-500 disabled:opacity-40 disabled:cursor-not-allowed hover:from-orange-600 hover:to-amber-600 shadow-md transition-all cursor-pointer"
                  >
                    {currentQuestionIdx + 1 === previewQuiz.questions.length
                      ? "See Result"
                      : "Next Question"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-4 text-center space-y-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white shadow-xl shadow-orange-500/30">
                  <Trophy size={32} />
                </div>

                <div className="space-y-1">
                  <h3 className="text-xl font-black">Quiz Completed!</h3>
                  <p className="text-xs text-slate-400">
                    You scored {score} out of {previewQuiz.questions.length} questions correctly.
                  </p>
                </div>

                <div className="p-4 rounded-2xl border bg-orange-500/10 border-orange-500/25 space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-orange-500 flex items-center justify-center gap-1.5">
                    <UtensilsCrossed size={14} />
                    <span>Congratulations! You Won a Free Dish</span>
                  </span>
                  <p className="font-black text-base text-orange-500">{previewQuiz.reward}</p>
                  <p className="text-xs text-slate-400">
                    Show this screen to your server to add this complimentary dish directly to your table order!
                  </p>
                </div>

                <div className="pt-2 flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={handleRestartQuiz}
                    className={`px-4 py-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 cursor-pointer ${
                      isDark
                        ? "bg-white/5 border-white/10 text-slate-300"
                        : "bg-slate-100 border-slate-200 text-slate-700"
                    }`}
                  >
                    <RotateCcw size={13} />
                    <span>Play Again</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPreviewQuiz(null)}
                    className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-orange-500 hover:bg-orange-600 transition-all cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Create / Edit Drawer */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end animate-fade-in">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setIsDrawerOpen(false)}
          />

          <div
            className={`relative w-full max-w-lg h-full flex flex-col justify-between shadow-2xl z-50 p-6 overflow-y-auto ${
              isDark
                ? "bg-[#0c1022] border-l border-white/10 text-white"
                : "bg-white border-l border-slate-200 text-slate-900"
            }`}
          >
            <form onSubmit={handleSaveForm} className="space-y-5 flex-1 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-white/10">
                  <div>
                    <h3 className="text-xl font-extrabold tracking-tight">
                      {editingQuiz ? "Edit Quiz" : "Create New Quiz"}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Configure table trivia questions and free reward dishes for winners
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsDrawerOpen(false)}
                    className="w-8 h-8 rounded-full border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-400 hover:text-white cursor-pointer"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10">
                  <div>
                    <span className="block font-bold text-xs text-slate-900 dark:text-white">Quiz Status</span>
                    <span className="block text-[11px] text-slate-400">Enable or disable trivia visibility for diners</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          status: prev.status === "Active" ? "Inactive" : "Active",
                        }))
                      }
                      className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        formData.status === "Active"
                          ? "bg-emerald-500 shadow-sm shadow-emerald-500/30"
                          : isDark
                          ? "bg-slate-700"
                          : "bg-slate-300"
                      }`}
                      role="switch"
                      aria-checked={formData.status === "Active"}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                          formData.status === "Active" ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </button>
                    <span
                      className={`text-[11px] font-bold ${
                        formData.status === "Active" ? "text-emerald-500" : "text-slate-400"
                      }`}
                    >
                      {formData.status === "Active" ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-xs text-slate-400 mb-1.5">
                    Quiz Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Master Foodie Challenge"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-semibold outline-none transition-all ${
                      isDark
                        ? "bg-white/[0.04] border-white/10 text-white placeholder-slate-500 focus:border-orange-500/60"
                        : "bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400 focus:border-orange-500/60"
                    }`}
                  />
                </div>

                <div>
                  <label className="block font-bold text-xs text-slate-400 mb-1.5">
                    Description
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Brief description of the trivia..."
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-semibold outline-none transition-all resize-none ${
                      isDark
                        ? "bg-white/[0.04] border-white/10 text-white placeholder-slate-500 focus:border-orange-500/60"
                        : "bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400 focus:border-orange-500/60"
                    }`}
                  />
                </div>

                <div>
                  <label className="block font-bold text-xs text-slate-400 mb-1.5">
                    Reward Free Dish *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Free Hot Gulab Jamun (2 pcs)"
                    value={formData.reward}
                    onChange={(e) =>
                      setFormData({ ...formData, reward: e.target.value })
                    }
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-semibold outline-none transition-all ${
                      isDark
                        ? "bg-white/[0.04] border-white/10 text-white placeholder-slate-500 focus:border-orange-500/60"
                        : "bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400 focus:border-orange-500/60"
                    }`}
                  />
                </div>

                <div className="pt-2">
                  <div className="flex items-center justify-between mb-2">
                    <label className="font-bold text-xs text-slate-400">
                      Trivia Questions ({formData.questions.length})
                    </label>
                    <button
                      type="button"
                      onClick={handleAddQuestionRow}
                      className="text-xs font-bold text-orange-500 hover:text-orange-400 flex items-center gap-1 cursor-pointer"
                    >
                      <Plus size={13} />
                      <span>Add Question</span>
                    </button>
                  </div>

                  <div className="space-y-4 max-h-72 overflow-y-auto pr-1">
                    {formData.questions.map((qItem, qIdx) => (
                      <div
                        key={qIdx}
                        className={`p-3.5 rounded-xl border space-y-2.5 ${
                          isDark
                            ? "bg-white/[0.02] border-white/10"
                            : "bg-slate-50 border-slate-200"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-orange-500">
                            Q{qIdx + 1}
                          </span>
                          {formData.questions.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveQuestionRow(qIdx)}
                              className="text-rose-500 hover:text-rose-400 p-1 cursor-pointer"
                              title="Delete Question"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>

                        <input
                          type="text"
                          required
                          placeholder="Type question here..."
                          value={qItem.question}
                          onChange={(e) =>
                            handleQuestionTextChange(qIdx, e.target.value)
                          }
                          className={`w-full px-3 py-2 rounded-lg border text-xs font-semibold outline-none transition-all ${
                            isDark
                              ? "bg-white/[0.04] border-white/10 text-white placeholder-slate-500 focus:border-orange-500/60"
                              : "bg-white border-slate-200 text-slate-800 placeholder-slate-400 focus:border-orange-500/60"
                          }`}
                        />

                        <div className="space-y-1.5 pt-1">
                          <span className="text-[10px] text-slate-400 font-medium">
                            Options (click dot to select correct answer)
                          </span>
                          <div className="grid grid-cols-2 gap-2">
                            {qItem.options.map((opt, optIdx) => (
                              <div
                                key={optIdx}
                                className="flex items-center gap-1.5"
                              >
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleCorrectSelect(qIdx, optIdx)
                                  }
                                  className={`w-4 h-4 rounded-full border shrink-0 flex items-center justify-center cursor-pointer ${
                                    qItem.correct === optIdx
                                      ? "bg-emerald-500 border-emerald-500 text-white"
                                      : "border-slate-400"
                                  }`}
                                  title="Mark as correct answer"
                                >
                                  {qItem.correct === optIdx && (
                                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                                  )}
                                </button>
                                <input
                                  type="text"
                                  required
                                  placeholder={`Option ${optIdx + 1}`}
                                  value={opt}
                                  onChange={(e) =>
                                    handleOptionChange(
                                      qIdx,
                                      optIdx,
                                      e.target.value
                                    )
                                  }
                                  className={`w-full px-2.5 py-1.5 rounded-lg border text-xs outline-none transition-all ${
                                    isDark
                                      ? "bg-white/[0.04] border-white/10 text-white placeholder-slate-500 focus:border-orange-500/60"
                                      : "bg-white border-slate-200 text-slate-800 placeholder-slate-400 focus:border-orange-500/60"
                                  }`}
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-white/10 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsDrawerOpen(false)}
                  className={`px-4 py-2.5 rounded-xl border font-bold text-xs cursor-pointer transition-all ${
                    isDark
                      ? "bg-white/5 hover:bg-white/10 border-white/10 text-slate-300"
                      : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700"
                  }`}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-md shadow-orange-500/25 transition-all duration-200 hover:scale-[1.02] active:scale-95 cursor-pointer flex items-center gap-1.5"
                >
                  <Save size={15} />
                  <span>{editingQuiz ? "Update Quiz" : "Save Quiz"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

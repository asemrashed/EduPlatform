"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ResourceBrowseSkeleton } from "@/components/resources/ResourceBrowseSkeleton";
import { ResourcePageContainer } from "@/components/resources/ResourcePageContainer";
import { testYourselfService } from "@/services/testYourselfService";
import { DEFAULT_RESOURCE_ACCESS, TEST_YOURSELF_FREE_LIMIT } from "@/lib/resources/access";
import {
  clearTestYourselfSession,
  getTestYourselfSession,
  listTestYourselfSessions,
  saveTestYourselfSession,
  type TestYourselfStoredSession,
} from "@/lib/resources/testYourselfStorage";
import type { ResourceCenterAccess } from "@/types/resourceAccess";
import type {
  TestYourselfCheckResult,
  TestYourselfQuestion,
  TestYourselfTopic,
} from "@/types/testYourself";
import { LuArrowLeft, LuSearch, LuSparkles } from "react-icons/lu";

type TestYourselfBrowseClientProps = {
  context: "public" | "student";
  showPageHeader?: boolean;
};

type View = "browse" | "quiz" | "results";

const DIFFICULTY_LABEL: Record<number, string> = {
  1: "Easy",
  2: "Medium",
  3: "Hard",
};

function topicSessionKey(subject: string, topic: string) {
  return `${subject}|${topic}`;
}

export function TestYourselfBrowseClient({
  context,
  showPageHeader = true,
}: TestYourselfBrowseClientProps) {
  const [view, setView] = useState<View>("browse");
  const [topics, setTopics] = useState<TestYourselfTopic[]>([]);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [access, setAccess] = useState<ResourceCenterAccess>(DEFAULT_RESOURCE_ACCESS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [sessionMap, setSessionMap] = useState<Record<string, TestYourselfStoredSession>>({});

  const [activeTopic, setActiveTopic] = useState<{ subject: string; topic: string } | null>(null);
  const [questions, setQuestions] = useState<TestYourselfQuestion[]>([]);
  const [totalQuestionCount, setTotalQuestionCount] = useState(0);
  const [quizLoading, setQuizLoading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selections, setSelections] = useState<Record<string, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [results, setResults] = useState<TestYourselfCheckResult[]>([]);
  const [score, setScore] = useState(0);
  const [submittedCount, setSubmittedCount] = useState(0);
  const [isFreeSubmit, setIsFreeSubmit] = useState(false);
  const [limitDialogOpen, setLimitDialogOpen] = useState(false);

  const refreshSessionMap = useCallback(() => {
    const map: Record<string, TestYourselfStoredSession> = {};
    for (const s of listTestYourselfSessions()) {
      map[topicSessionKey(s.subject, s.topic)] = s;
    }
    setSessionMap(map);
  }, []);

  const fetchCatalog = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set("search", search.trim());
      const { res, json } = await testYourselfService.browseCatalog(params.toString());
      if (!res.ok) {
        setError(json.error || "Could not load practice topics");
        setTopics([]);
        return;
      }
      setTopics(json.data?.topics ?? []);
      setSubjects(json.data?.subjects ?? []);
      setAccess(json.data?.access ?? DEFAULT_RESOURCE_ACCESS);
      refreshSessionMap();
    } catch {
      setError("Could not load practice topics");
      setTopics([]);
    } finally {
      setLoading(false);
    }
  }, [search, refreshSessionMap]);

  useEffect(() => {
    void fetchCatalog();
  }, [fetchCatalog]);

  const filteredTopics = useMemo(() => {
    if (subjectFilter === "all") return topics;
    return topics.filter((t) => t.subject === subjectFilter);
  }, [topics, subjectFilter]);

  const freeLimit = access.freeLimit || TEST_YOURSELF_FREE_LIMIT;
  const playableCount = access.fullAccess
    ? totalQuestionCount
    : Math.min(freeLimit, totalQuestionCount);

  const persistProgress = useCallback(
    (
      topic: { subject: string; topic: string },
      next: Partial<TestYourselfStoredSession> & {
        selections: Record<string, number>;
        currentIndex: number;
        status: TestYourselfStoredSession["status"];
        totalQuestionCount?: number;
        freeLimit?: number;
      },
    ) => {
      const existing = getTestYourselfSession(topic.subject, topic.topic);
      saveTestYourselfSession({
        subject: topic.subject,
        topic: topic.topic,
        totalQuestionCount: next.totalQuestionCount ?? existing?.totalQuestionCount ?? totalQuestionCount,
        freeLimit: next.freeLimit ?? existing?.freeLimit ?? freeLimit,
        status: next.status,
        selections: next.selections,
        currentIndex: next.currentIndex,
        freeResults: next.freeResults ?? existing?.freeResults,
        freeScore: next.freeScore ?? existing?.freeScore,
        results: next.results ?? existing?.results,
        score: next.score ?? existing?.score,
        updatedAt: new Date().toISOString(),
      });
      refreshSessionMap();
    },
    [totalQuestionCount, freeLimit, refreshSessionMap],
  );

  const startQuiz = async (
    subject: string,
    topic: string,
    mode: "fresh" | "resume" | "results" = "fresh",
  ) => {
    setQuizLoading(true);
    setError(null);
    try {
      if (mode === "fresh") {
        clearTestYourselfSession(subject, topic);
      }
      const { res, json } = await testYourselfService.loadQuestions(subject, topic);
      if (!res.ok) {
        setError(json.error || "Could not load questions");
        return;
      }

      const loaded = json.data?.questions ?? [];
      const total = json.data?.access?.total ?? loaded.length;
      const nextAccess = json.data?.access
        ? {
            ...access,
            fullAccess: json.data.access.fullAccess,
            freeLimit: json.data.access.freeLimit,
          }
        : access;

      if (json.data?.access) {
        setAccess((prev) => ({
          ...prev,
          fullAccess: json.data!.access!.fullAccess,
          freeLimit: json.data!.access!.freeLimit,
        }));
      }

      const stored = mode === "fresh" ? null : getTestYourselfSession(subject, topic);
      const fullAccess = nextAccess.fullAccess;

      setActiveTopic({ subject, topic });
      setQuestions(loaded);
      setTotalQuestionCount(total);
      setLimitDialogOpen(false);

      if (mode === "results" && stored?.status === "submitted_free") {
        setSelections(stored.selections);
        setResults(stored.freeResults ?? []);
        setScore(stored.freeScore ?? 0);
        setSubmittedCount(Object.keys(stored.selections).length);
        setIsFreeSubmit(true);
        setTotalQuestionCount(stored.totalQuestionCount || total);
        setView("results");
      } else if (stored?.status === "submitted_free" && fullAccess && mode === "resume") {
        const resumeIndex = Math.min(stored.freeLimit, total - 1);
        setSelections(stored.selections);
        setCurrentIndex(resumeIndex);
        setResults([]);
        setScore(0);
        setSubmittedCount(0);
        setIsFreeSubmit(false);
        setView("quiz");
        persistProgress(
          { subject, topic },
          {
            status: "in_progress",
            selections: stored.selections,
            currentIndex: resumeIndex,
            totalQuestionCount: total,
            freeLimit: nextAccess.freeLimit,
          },
        );
      } else if (stored?.status === "in_progress" && mode === "resume") {
        setSelections(stored.selections);
        setCurrentIndex(
          Math.min(stored.currentIndex, (fullAccess ? total : freeLimit) - 1),
        );
        setResults([]);
        setScore(0);
        setSubmittedCount(0);
        setIsFreeSubmit(false);
        setView("quiz");
      } else {
        setSelections({});
        setCurrentIndex(0);
        setResults([]);
        setScore(0);
        setSubmittedCount(0);
        setIsFreeSubmit(false);
        setView("quiz");
        persistProgress(
          { subject, topic },
          {
            status: "in_progress",
            selections: {},
            currentIndex: 0,
            totalQuestionCount: total,
            freeLimit: nextAccess.freeLimit,
          },
        );
      }
    } catch {
      setError("Could not load questions");
    } finally {
      setQuizLoading(false);
    }
  };

  const submitQuiz = async (options?: { freeTier?: boolean }) => {
    if (!activeTopic) return;
    setSubmitting(true);
    setError(null);
    setLimitDialogOpen(false);

    const answeredQuestions =
      options?.freeTier || !access.fullAccess
        ? questions.slice(0, freeLimit).filter((q) => selections[q._id] !== undefined)
        : questions.filter((q) => selections[q._id] !== undefined);

    if (answeredQuestions.length === 0) {
      setError("Answer at least one question before submitting.");
      setSubmitting(false);
      return;
    }

    try {
      const answers = answeredQuestions.map((q) => ({
        questionId: q._id,
        optionIndex: selections[q._id] ?? -1,
      }));

      const { res, json } = await testYourselfService.checkAnswers(
        activeTopic.subject,
        activeTopic.topic,
        answers,
      );

      if (!res.ok) {
        setError(json.error || "Could not check answers");
        return;
      }

      const nextResults = json.data?.results ?? [];
      const nextScore = json.data?.score ?? 0;
      const count = answeredQuestions.length;

      setResults(nextResults);
      setScore(nextScore);
      setSubmittedCount(count);
      setIsFreeSubmit(!access.fullAccess || options?.freeTier === true);
      setView("results");

      if (!access.fullAccess || options?.freeTier) {
        persistProgress(activeTopic, {
          status: "submitted_free",
          selections,
          currentIndex,
          freeResults: nextResults,
          freeScore: nextScore,
        });
      } else {
        persistProgress(activeTopic, {
          status: "completed",
          selections,
          currentIndex,
          results: nextResults,
          score: nextScore,
        });
      }
    } catch {
      setError("Could not check answers");
    } finally {
      setSubmitting(false);
    }
  };

  const resetToBrowse = () => {
    setView("browse");
    setActiveTopic(null);
    setQuestions([]);
    setSelections({});
    setResults([]);
    setCurrentIndex(0);
    setLimitDialogOpen(false);
    refreshSessionMap();
  };

  const handleSelection = (questionId: string, optionIndex: number) => {
    if (!activeTopic) return;
    const next = { ...selections, [questionId]: optionIndex };
    setSelections(next);
    persistProgress(activeTopic, {
      status: "in_progress",
      selections: next,
      currentIndex,
    });
  };

  const handleNext = () => {
    if (!access.fullAccess && currentIndex + 1 >= freeLimit && currentIndex + 1 < totalQuestionCount) {
      setLimitDialogOpen(true);
      return;
    }
    const nextIndex = currentIndex + 1;
    setCurrentIndex(nextIndex);
    if (activeTopic) {
      persistProgress(activeTopic, {
        status: "in_progress",
        selections,
        currentIndex: nextIndex,
      });
    }
  };

  const currentQuestion = questions[currentIndex];
  const answeredInPlayable = questions
    .slice(0, playableCount)
    .filter((q) => selections[q._id] !== undefined).length;

  if (loading) {
    return <ResourceBrowseSkeleton showPageHeader={showPageHeader} variant="grid" />;
  }

  if (quizLoading) {
    return <ResourceBrowseSkeleton showPageHeader={false} variant="grid" />;
  }

  if (view === "quiz" && activeTopic && questions.length > 0 && currentQuestion) {
    const isLastPlayable = currentIndex >= playableCount - 1;

    return (
      <ResourcePageContainer withPadding={showPageHeader}>
        <Button type="button" variant="ghost" size="sm" className="mb-4" onClick={resetToBrowse}>
          <LuArrowLeft className="mr-1 h-4 w-4" />
          Back to topics
        </Button>

        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-semibold">
              {activeTopic.subject} · {activeTopic.topic}
            </h2>
            <p className="text-sm text-muted-foreground">
              Question {currentIndex + 1} of {totalQuestionCount}
              {!access.fullAccess ? (
                <span className="ml-2 text-amber-700 dark:text-amber-300">
                  · {answeredInPlayable} answered
                </span>
              ) : null}
            </p>
          </div>
          <Badge variant="outline">
            {DIFFICULTY_LABEL[currentQuestion.difficulty] ?? "Practice"}
          </Badge>
        </div>

        {error ? (
          <p className="mb-4 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        ) : null}

        <Card className="p-5">
          <p className="text-base font-medium leading-relaxed">{currentQuestion.questionText}</p>
          {currentQuestion.diagramUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={currentQuestion.diagramUrl}
              alt="Question diagram"
              className="mt-4 max-h-48 rounded-lg border border-border object-contain"
            />
          ) : null}

          <div className="mt-5 space-y-2">
            {currentQuestion.options.map((opt) => (
              <button
                key={opt.index}
                type="button"
                className={`w-full rounded-lg border px-4 py-3 text-left text-sm transition-colors ${
                  selections[currentQuestion._id] === opt.index
                    ? "border-primary bg-primary/10"
                    : "border-border hover:bg-muted/50"
                }`}
                onClick={() => handleSelection(currentQuestion._id, opt.index)}
              >
                <span className="font-semibold">{String.fromCharCode(65 + opt.index)}.</span>{" "}
                {opt.text}
              </button>
            ))}
          </div>
        </Card>

        <div className="mt-6 flex flex-wrap justify-between gap-3">
          <Button
            type="button"
            variant="outline"
            disabled={currentIndex === 0}
            onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
          >
            Previous
          </Button>
          {access.fullAccess && isLastPlayable ? (
            <Button
              type="button"
              onClick={() => void submitQuiz()}
              disabled={
                questions.slice(0, playableCount).some((q) => selections[q._id] === undefined) ||
                submitting
              }
            >
              {submitting ? "Checking..." : "Submit answers"}
            </Button>
          ) : !access.fullAccess && isLastPlayable ? (
            <Button
              type="button"
              onClick={handleNext}
              disabled={selections[currentQuestion._id] === undefined}
            >
              Next
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleNext}
              disabled={selections[currentQuestion._id] === undefined}
            >
              Next
            </Button>
          )}
        </div>

        <Dialog open={limitDialogOpen} onOpenChange={setLimitDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Free limit reached</DialogTitle>
              <DialogDescription>
                You have reached your free limit. To continue, enroll in a batch.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Button asChild className="w-full">
                <Link href="/enroll">Enroll in a batch</Link>
              </Button>
              <div className="space-y-2 text-center">
                <p className="text-sm text-muted-foreground">Finish here anyway</p>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  disabled={submitting}
                  onClick={() => void submitQuiz({ freeTier: true })}
                >
                  {submitting ? "Checking..." : "Submit"}
                </Button>
              </div>
            </div>
            <DialogFooter />
          </DialogContent>
        </Dialog>
      </ResourcePageContainer>
    );
  }

  if (view === "results" && activeTopic) {
    const resultMap = new Map(results.map((r) => [r.questionId, r]));
    const resultQuestions = questions.filter((q) => resultMap.has(q._id));

    return (
      <ResourcePageContainer withPadding={showPageHeader}>
        <Button type="button" variant="ghost" size="sm" className="mb-4" onClick={resetToBrowse}>
          <LuArrowLeft className="mr-1 h-4 w-4" />
          Back to topics
        </Button>

        <Card className="mb-6 p-6 text-center">
          <p className="text-sm text-muted-foreground">Your score</p>
          <p className="mt-1 text-3xl font-bold text-foreground">
            {score} / {submittedCount}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            {activeTopic.subject} · {activeTopic.topic}
            {isFreeSubmit && totalQuestionCount > submittedCount
              ? ` · ${submittedCount} of ${totalQuestionCount} questions`
              : null}
          </p>
        </Card>

        {isFreeSubmit ? (
          <Card className="mb-6 border-primary/30 bg-primary/5 p-5">
            <div className="flex items-start gap-3">
              <LuSparkles className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <div className="space-y-2">
                <p className="font-medium text-foreground">
                  Unlock the full {totalQuestionCount}-question set
                </p>
                <p className="text-sm text-muted-foreground">
                  You completed the free preview. Enroll in a batch to continue this topic and
                  access all questions, plus batch-gated notes and worksheets.
                </p>
                <Button asChild size="sm">
                  <Link href={context === "public" ? "/enroll" : "/enroll"}>
                    Enroll in a batch
                  </Link>
                </Button>
              </div>
            </div>
          </Card>
        ) : null}

        <div className="space-y-4">
          {resultQuestions.map((q, i) => {
            const result = resultMap.get(q._id);
            return (
              <Card key={q._id} className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium">
                    {i + 1}. {q.questionText}
                  </p>
                  <Badge variant={result?.correct ? "default" : "destructive"}>
                    {result?.correct ? "Correct" : "Incorrect"}
                  </Badge>
                </div>
                {result?.explanation ? (
                  <p className="mt-2 text-sm text-muted-foreground">{result.explanation}</p>
                ) : null}
              </Card>
            );
          })}
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          {access.fullAccess &&
          getTestYourselfSession(activeTopic.subject, activeTopic.topic)?.status ===
            "submitted_free" ? (
            <Button
              type="button"
              onClick={() => void startQuiz(activeTopic.subject, activeTopic.topic, "resume")}
            >
              Continue full test
            </Button>
          ) : (
            <Button
              type="button"
              onClick={() => void startQuiz(activeTopic.subject, activeTopic.topic, "fresh")}
            >
              Try again
            </Button>
          )}
          <Button type="button" variant="outline" onClick={resetToBrowse}>
            Choose another topic
          </Button>
        </div>
      </ResourcePageContainer>
    );
  }

  return (
    <ResourcePageContainer withPadding={showPageHeader}>
      {showPageHeader ? (
        <header className="mb-6">
          <h1 className="font-[family-name:var(--font-headline)] text-2xl font-black tracking-tight text-foreground md:text-3xl">
            Test Yourself
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Quick MCQ practice from the platform question bank.
          </p>
        </header>
      ) : null}

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <LuSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search subjects or topics..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={subjectFilter} onValueChange={setSubjectFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="All subjects" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All subjects</SelectItem>
            {subjects.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {error ? (
        <p className="mb-4 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      {filteredTopics.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border px-6 py-12 text-center text-sm text-muted-foreground">
          No public practice questions yet. Staff can publish questions in the Platform Question Bank
          with access set to Public.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredTopics.map((t) => {
            const stored = sessionMap[topicSessionKey(t.subject, t.topic)];
            const canContinue =
              stored?.status === "submitted_free" && access.fullAccess;
            const inProgress = stored?.status === "in_progress";
            const hasFreeResult =
              stored?.status === "submitted_free" && !access.fullAccess;

            return (
              <Card key={`${t.subject}-${t.topic}`} className="flex flex-col p-5">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {t.subject}
                </p>
                <h3 className="mt-1 text-base font-semibold">{t.topic}</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {t.questionCount} question{t.questionCount === 1 ? "" : "s"}
                </p>
                {inProgress ? (
                  <Badge variant="secondary" className="mt-2 w-fit">
                    In progress
                  </Badge>
                ) : hasFreeResult ? (
                  <Badge variant="outline" className="mt-2 w-fit">
                    Free preview done
                  </Badge>
                ) : null}
                <div className="mt-4 flex flex-col gap-2">
                  {canContinue ? (
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => void startQuiz(t.subject, t.topic, "resume")}
                    >
                      Continue
                    </Button>
                  ) : inProgress ? (
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => void startQuiz(t.subject, t.topic, "resume")}
                    >
                      Resume
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => void startQuiz(t.subject, t.topic, "fresh")}
                    >
                      Start practice
                    </Button>
                  )}
                  {hasFreeResult ? (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => void startQuiz(t.subject, t.topic, "results")}
                    >
                      View results
                    </Button>
                  ) : null}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </ResourcePageContainer>
  );
}

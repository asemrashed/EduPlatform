'use client';

import { useEffect, useState, useCallback } from 'react';
import { useMockSession } from '@/lib/mockSession';
import { useRouter, useParams } from 'next/navigation';
import { StudentRoleShell } from '@/components/role-area/StudentRoleShell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LuClock as Clock, LuBookOpen as BookOpen, LuTarget as Target, LuAward as Award, LuArrowLeft as ArrowLeft, LuArrowRight as ArrowRight, LuCheck as CheckCircle, LuTriangleAlert as AlertCircle, LuTimer as Timer, LuSave as Save, LuFlag } from 'react-icons/lu';;
import { htmlToPlainText } from '@/lib/utils';

interface Question {
  _id: string;
  question: string;
  type: 'mcq' | 'written' | 'true_false' | 'fill_blank' | 'essay';
  marks: number;
  difficulty: 'easy' | 'medium' | 'hard';
  timeLimit?: number;
  options?: Array<{
    _id: string;
    text: string;
    isCorrect: boolean;
  }>;
  correctAnswer?: string;
  explanation?: string;
  hints?: string[];
  tags?: string[];
  category?: string;
}

interface Exam {
  _id: string;
  title: string;
  description: string;
  type: 'mcq' | 'written' | 'mixed';
  duration: number;
  totalMarks: number;
  passingMarks: number;
  instructions: string;
  questions: Question[];
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  timeLimit: boolean;
}

interface ExamAttempt {
  _id: string;
  exam: string;
  student: string;
  status: 'in_progress' | 'completed' | 'abandoned';
  score: number;
  percentage: number;
  passed: boolean;
  timeSpent: number;
  answers: Array<{
    questionId: string;
    answer: string | string[];
    isCorrect?: boolean;
    marks?: number;
  }>;
  startedAt: string;
  completedAt?: string;
}

function ExamTakingPageContent() {
  const { data: session } = useMockSession();
  const router = useRouter();
  const params = useParams();
  const examId = params.id as string;
  
  const [exam, setExam] = useState<Exam | null>(null);
  const [attempt, setAttempt] = useState<ExamAttempt | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
  const [flaggedQuestions, setLuFlaggedQuestions] = useState<Set<string>>(new Set());
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchExamData = async () => {
    try {
      setLoading(true);
      
      // Fetch exam details
      const examResponse = await fetch(`/api/student/exams/${examId}`, {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (!examResponse.ok) {
        const err = await examResponse.json().catch(() => ({} as any));
        throw new Error(err?.error || 'Failed to fetch exam');
      }
      
      const examData = await examResponse.json();
      setExam(examData.data.exam);
      setQuestions(examData.data.questions);
      
      // Fetch or create attempt
      const attemptResponse = await fetch('/api/student/exam-attempts', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ examId }),
      });
      
      if (!attemptResponse.ok) {
        const err = await attemptResponse.json().catch(() => ({} as any));
        throw new Error(err?.error || 'Failed to create exam attempt');
      }
      
      const attemptData = await attemptResponse.json();
      setAttempt(attemptData.data.attempt);
      
      // Initialize answers from existing attempt
      if (attemptData.data.attempt.answers) {
        const existingAnswers: Record<string, any> = {};
        attemptData.data.attempt.answers.forEach((answer: any) => {
          existingAnswers[answer.questionId] = answer.answer;
        });
        setAnswers(existingAnswers);
      }
      
      // Set timer (persist across refresh using startedAt + timeSpent)
      if (examData.data.exam.timeLimit) {
        // Prefer server-provided remainingSeconds to avoid client drift
        if (typeof attemptData.data.remainingSeconds === 'number') {
          setTimeRemaining(Math.max(0, attemptData.data.remainingSeconds));
        } else {
          const totalTime = examData.data.exam.duration * 60; // seconds
          const attemptStartedAt = attemptData.data.attempt.startedAt
            ? new Date(attemptData.data.attempt.startedAt).getTime()
            : Date.now();
          const baseSpent = attemptData.data.attempt.timeSpent || 0;
          const ongoingSpent = Math.max(0, Math.floor((Date.now() - attemptStartedAt) / 1000));
          const spent = Math.min(totalTime, baseSpent + ongoingSpent);
          setTimeRemaining(Math.max(0, totalTime - spent));
        }
      }
      
    } catch (error) {
      console.error('Error fetching exam data:', error);
      // Show inline error instead of redirect loop
      setExam(null);
      setAttempt(null);
      setErrorMessage((error as Error)?.message || 'Failed to load exam');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (examId) {
      fetchExamData();
    }
  }, [examId]);

  // Timer effect
  useEffect(() => {
    if (timeRemaining > 0 && exam?.timeLimit) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleSubmitExam();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [timeRemaining, exam?.timeLimit]);

  // Persist timeSpent periodically so refresh doesn't reset
  useEffect(() => {
    const persistInterval = setInterval(() => {
      if (!attempt || !exam?.timeLimit) return;
      fetch(`/api/student/exam-attempts/${attempt._id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          timeSpent: exam.duration ? (exam.duration * 60) - timeRemaining : 0
        })
      }).catch(() => {});
    }, 15000); // every 15s
    return () => clearInterval(persistInterval);
  }, [attempt?._id, exam?.timeLimit, exam?.duration, timeRemaining]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerChange = (questionId: string, answer: any) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleSaveProgress = async () => {
    if (!attempt) return;
    
    try {
      const response = await fetch(`/api/student/exam-attempts/${attempt._id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answers: Object.entries(answers).map(([questionId, answer]) => ({
            questionId,
            answer
          })),
          timeSpent: exam?.duration ? (exam.duration * 60) - timeRemaining : 0
        }),
      });
      
      if (response.ok) {
        // Show save confirmation
        console.log('Progress saved');
      }
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  };

  const handleSubmitExam = async () => {
    if (!attempt || !exam) return;
    
    setSubmitting(true);
    try {
      const response = await fetch(`/api/student/exam-attempts/${attempt._id}/submit`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answers: Object.entries(answers).map(([questionId, answer]) => ({
            questionId,
            answer
          })),
          timeSpent: exam.duration ? (exam.duration * 60) - timeRemaining : 0
        }),
      });
      
      if (response.ok) {
        router.push(`/student/exams/${examId}/results`);
      } else {
        throw new Error('Failed to submit exam');
      }
    } catch (error) {
      console.error('Error submitting exam:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleLuFlagQuestion = (questionId: string) => {
    setLuFlaggedQuestions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      return newSet;
    });
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleGoToQuestion = (index: number) => {
    setCurrentQuestionIndex(index);
  };

  if (loading) {
    return (
      <StudentRoleShell>
        <main className="relative z-10 p-2 sm:p-4">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          </div>
        </main>
      </StudentRoleShell>
    );
  }

  if (!exam || !attempt) {
    return (
      <StudentRoleShell>
        <main className="relative z-10 p-2 sm:p-4">
          <div className="max-w-4xl mx-auto text-center">
            <Alert className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {errorMessage || 'Exam not found or not available. Please go back and try again.'}
              </AlertDescription>
            </Alert>
            <Button onClick={() => router.push('/student/exams')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Exams
            </Button>
          </div>
        </main>
      </StudentRoleShell>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <StudentRoleShell>
      <main className="relative z-10 p-2 sm:p-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{exam.title}</h1>
                <p className="text-gray-600">{htmlToPlainText(exam.description)}</p>
              </div>
              <Button
                variant="outline"
                onClick={() => router.push('/student/exams')}
                className="border-2 border-blue-300 hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Exit Exam
              </Button>
            </div>

            {/* Progress and Timer (Exam page style) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-0 shadow-md">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-900">Progress</span>
                  </div>
                  <div className="mt-2">
                    <Progress value={progress} className="h-2" />
                    <p className="text-xs text-blue-800 mt-1">
                      {currentQuestionIndex + 1} of {questions.length} questions
                    </p>
                  </div>
                </CardContent>
              </Card>

              {exam.timeLimit && (
                <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-0 shadow-md">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Timer className="w-4 h-4 text-orange-600" />
                      <span className="text-sm font-medium text-orange-900">Time Remaining</span>
                    </div>
                    <p className={`text-lg font-bold mt-1 ${timeRemaining < 300 ? 'text-red-600' : 'text-orange-900'}`}>
                      {formatTime(timeRemaining)}
                    </p>
                  </CardContent>
                </Card>
              )}

              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-0 shadow-md">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-purple-600" />
                    <span className="text-sm font-medium text-purple-900">Total Marks</span>
                  </div>
                  <p className="text-lg font-bold text-purple-900 mt-1">
                    {exam.totalMarks} marks
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Question Navigation */}
          <Card className="mb-6 border-0 shadow-md">
            <CardHeader>
              <CardTitle className="text-lg">Question Navigation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
                {questions.map((question, index) => {
                  const isCurrent = index === currentQuestionIndex;
                  const isAnswered = !!answers[question._id];
                  const isLuFlagged = flaggedQuestions.has(question._id);
                  return (
                    <Button
                      key={question._id}
                      variant={isCurrent ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleGoToQuestion(index)}
                      title={`Question ${index + 1}${isAnswered ? ' • Answered' : ''}${isLuFlagged ? ' • LuFlagged' : ''}`}
                      className={`relative rounded-full w-9 h-9 p-0 flex items-center justify-center transition-all duration-200
                        border-2 focus:ring-2 focus:ring-blue-500/20
                        ${isCurrent ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-white text-gray-900'}
                        ${!isCurrent && isAnswered ? 'border-green-300 bg-green-50' : ''}
                        ${!isCurrent && isLuFlagged ? 'border-yellow-300 bg-yellow-50' : ''}
                        ${!isCurrent && !isAnswered && !isLuFlagged ? 'border-blue-200 hover:border-blue-400' : ''}
                      `}
                    >
                      {index + 1}
                      {isAnswered && (
                        <CheckCircle className="w-3 h-3 absolute -top-1 -right-1 text-green-600" />
                      )}
                      {isLuFlagged && (
                        <LuFlag className="w-3 h-3 absolute -top-1 -right-1 text-yellow-600" />
                      )}
                    </Button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Current Question */}
          <Card className="mb-6 border-0 shadow-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">
                  Question {currentQuestionIndex + 1} of {questions.length}
                </CardTitle>
                <div className="flex items-center gap-2">
                  {currentQuestion && (
                    <>
                      <Badge variant="outline">
                        {currentQuestion.marks} marks
                      </Badge>
                      <Badge variant="outline">
                        {currentQuestion.difficulty}
                      </Badge>
                    </>
                  )}
                  {currentQuestion && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleLuFlagQuestion(currentQuestion._id)}
                      className="border-2 border-blue-300 hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    >
                      <LuFlag className={`w-4 h-4 ${flaggedQuestions.has(currentQuestion._id) ? 'text-yellow-600' : ''}`} />
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {currentQuestion && (
                  <p className="text-lg font-medium text-gray-900">
                    {currentQuestion.question}
                  </p>
                )}

                {/* MCQ Options */}
                {currentQuestion && currentQuestion.type === 'mcq' && currentQuestion.options && (
                  <div className="space-y-2">
                    {currentQuestion.options.map((option, index) => (
                      <label
                        key={option._id}
                        className="flex items-center space-x-3 p-3 border-2 border-blue-200 rounded-lg cursor-pointer hover:bg-gray-50 hover:border-blue-300 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20"
                      >
                        <input
                          type="radio"
                          name={`question-${currentQuestion._id}`}
                          value={option._id}
                          checked={answers[currentQuestion._id] === option._id}
                          onChange={(e) => handleAnswerChange(currentQuestion._id, e.target.value)}
                          className="w-4 h-4 text-blue-600"
                        />
                        <span className="text-sm">{option.text}</span>
                      </label>
                    ))}
                  </div>
                )}

                {/* True/False Options */}
                {currentQuestion && currentQuestion.type === 'true_false' && (
                  <div className="space-y-2">
                    <label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name={`question-${currentQuestion._id}`}
                        value="true"
                        checked={answers[currentQuestion._id] === 'true'}
                        onChange={(e) => handleAnswerChange(currentQuestion._id, e.target.value)}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="text-sm">True</span>
                    </label>
                    <label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name={`question-${currentQuestion._id}`}
                        value="false"
                        checked={answers[currentQuestion._id] === 'false'}
                        onChange={(e) => handleAnswerChange(currentQuestion._id, e.target.value)}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="text-sm">False</span>
                    </label>
                  </div>
                )}

                {/* Written/Essay Answer */}
                {currentQuestion && (currentQuestion.type === 'written' || currentQuestion.type === 'essay') && (
                  <textarea
                    value={answers[currentQuestion._id] || ''}
                    onChange={(e) => handleAnswerChange(currentQuestion._id, e.target.value)}
                    placeholder="Enter your answer here..."
                    className="w-full p-3 border-2 border-blue-200 rounded-lg resize-none hover:border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:shadow-lg focus:shadow-blue-500/10"
                    rows={6}
                  />
                )}

                {/* Fill in the Blank */}
                {currentQuestion && currentQuestion.type === 'fill_blank' && (
                  <input
                    type="text"
                    value={answers[currentQuestion._id] || ''}
                    onChange={(e) => handleAnswerChange(currentQuestion._id, e.target.value)}
                    placeholder="Enter your answer here..."
                    className="w-full p-3 border-2 border-blue-200 rounded-lg hover:border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:shadow-lg focus:shadow-blue-500/10"
                  />
                )}
              </div>
            </CardContent>
          </Card>

          {/* Navigation and Actions */}
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handlePreviousQuestion}
                disabled={currentQuestionIndex === 0}
                className="border-2 border-blue-300 hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>
              <Button
                variant="outline"
                onClick={handleNextQuestion}
                disabled={currentQuestionIndex === questions.length - 1}
                className="border-2 border-blue-300 hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              >
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleSaveProgress}
                className="border-2 border-blue-300 hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Progress
              </Button>
              <Button
                onClick={() => setShowConfirmSubmit(true)}
                className="bg-green-600 hover:bg-green-700"
              >
                Submit Exam
              </Button>
            </div>
          </div>

          {/* Submit Confirmation Modal */}
          {showConfirmSubmit && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <Card className="w-full max-w-md mx-4 border-0 shadow-xl">
                <CardHeader>
                  <CardTitle>Submit Exam</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    Are you sure you want to submit this exam? This action cannot be undone.
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setShowConfirmSubmit(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSubmitExam}
                      disabled={submitting}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      {submitting ? 'Submitting...' : 'Submit'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
    </StudentRoleShell>
  );
}

export default function ExamTakingPage() {
  return <ExamTakingPageContent />;
}

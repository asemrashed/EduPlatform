export interface IExamAttempt {
  _id: string;
  exam: unknown;
  student: unknown;
  answers: {
    question: unknown;
    selectedOptions?: unknown[];
    writtenAnswer?: string;
    isCorrect?: boolean;
    marksObtained?: number;
    timeSpent?: number;
    isAnswered: boolean;
  }[];
  totalMarks: number;
  marksObtained: number;
  percentage: number;
  isPassed: boolean;
  status: "in_progress" | "completed" | "abandoned" | "timeout";
  startTime: Date;
  endTime?: Date;
  timeSpent: number;
  isSubmitted: boolean;
  submittedAt?: Date;
  attemptNumber: number;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ExamAttempt = {};
export default ExamAttempt;

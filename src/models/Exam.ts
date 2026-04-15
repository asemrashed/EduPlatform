/** Mongoose-free stub for UI types (EduPlatform has no MongoDB models at runtime). */
export interface IExam {
  _id: string;
  title: string;
  description?: string;
  type: "mcq" | "written" | "mixed";
  duration: number;
  totalMarks: number;
  passingMarks: number;
  instructions?: string;
  isActive: boolean;
  isPublished: boolean;
  startDate?: Date;
  endDate?: Date;
  course?: unknown;
  createdBy: unknown;
  questions: unknown[];
  attempts: number;
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  showCorrectAnswers: boolean;
  showResults: boolean;
  allowReview: boolean;
  timeLimit: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const Exam = {};
export default Exam;

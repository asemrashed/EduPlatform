export interface IQuestion {
  _id: string;
  question: string;
  type: "mcq" | "written" | "true_false" | "fill_blank" | "essay";
  marks: number;
  difficulty: "easy" | "medium" | "hard";
  category?: string;
  tags?: string[];
  options?: {
    text: string;
    isCorrect: boolean;
    explanation?: string;
  }[];
  correctAnswer?: string;
  explanation?: string;
  hints?: string[];
  timeLimit?: number;
  isActive: boolean;
  createdBy: unknown;
  exam?: unknown;
  createdAt: Date;
  updatedAt: Date;
}

const Question = {};
export default Question;

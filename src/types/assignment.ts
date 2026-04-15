export interface Assignment {
  _id: string;
  title: string;
  description?: string;
  instructions?: string;
  type: 'essay' | 'file_upload' | 'quiz' | 'project' | 'presentation';
  course: string | {
    _id: string;
    title: string;
  };
  chapter?: string | {
    _id: string;
    title: string;
  };
  lesson?: string | {
    _id: string;
    title: string;
  };
  createdBy: string | {
    _id: string;
    name: string;
    email: string;
  };
  totalMarks: number;
  passingMarks: number;
  dueDate?: string;
  startDate?: string;
  isActive: boolean;
  isPublished: boolean;
  allowLateSubmission: boolean;
  latePenaltyPercentage?: number;
  maxAttempts: number;
  allowedFileTypes?: string[];
  maxFileSize?: number;
  attachments?: AssignmentAttachment[];
  rubric?: AssignmentRubric[];
  isGroupAssignment: boolean;
  maxGroupSize?: number;
  autoGrade: boolean;
  timeLimit?: number;
  showCorrectAnswers: boolean;
  allowReview: boolean;
  status: 'draft' | 'scheduled' | 'active' | 'expired' | 'inactive' | 'published';
  submissionCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface AssignmentAttachment {
  name: string;
  url: string;
  type: string;
  size?: number;
}

export interface AssignmentRubric {
  criteria: string;
  description: string;
  marks: number;
}

export interface AssignmentSubmission {
  _id: string;
  assignment: string | Assignment;
  student: string | {
    _id: string;
    name: string;
    email: string;
  };
  groupMembers?: Array<{
    _id: string;
    name: string;
    email: string;
  }>;
  content?: string;
  files?: AssignmentFile[];
  answers?: AssignmentAnswer[];
  status: 'draft' | 'submitted' | 'graded' | 'returned';
  submittedAt?: string;
  gradedAt?: string;
  gradedBy?: string | {
    _id: string;
    name: string;
  };
  score?: number;
  maxScore: number;
  feedback?: string;
  rubricScores?: RubricScore[];
  isLate: boolean;
  latePenaltyApplied?: number;
  attemptNumber: number;
  timeSpent?: number;
  percentageScore?: number;
  grade?: string;
  passed?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AssignmentFile {
  name: string;
  url: string;
  type: string;
  size: number;
}

export interface AssignmentAnswer {
  questionId: string;
  answer: string | string[];
  isCorrect?: boolean;
}

export interface RubricScore {
  criteria: string;
  score: number;
  maxScore: number;
  feedback?: string;
}

export interface CreateAssignmentRequest {
  title: string;
  description?: string;
  instructions?: string;
  type: 'essay' | 'file_upload' | 'quiz' | 'project' | 'presentation';
  course: string;
  chapter?: string;
  lesson?: string;
  totalMarks: number;
  passingMarks: number;
  dueDate?: string;
  startDate?: string;
  allowLateSubmission?: boolean;
  latePenaltyPercentage?: number;
  maxAttempts?: number;
  allowedFileTypes?: string[];
  maxFileSize?: number;
  attachments?: AssignmentAttachment[];
  rubric?: AssignmentRubric[];
  isGroupAssignment?: boolean;
  maxGroupSize?: number;
  autoGrade?: boolean;
  timeLimit?: number;
  showCorrectAnswers?: boolean;
  allowReview?: boolean;
}

export interface UpdateAssignmentRequest extends Partial<CreateAssignmentRequest> {
  isActive?: boolean;
  isPublished?: boolean;
}

export interface CreateSubmissionRequest {
  assignment: string;
  content?: string;
  files?: AssignmentFile[];
  answers?: AssignmentAnswer[];
  timeSpent?: number;
}

export interface UpdateSubmissionRequest {
  content?: string;
  files?: AssignmentFile[];
  answers?: AssignmentAnswer[];
  timeSpent?: number;
}

export interface GradeSubmissionRequest {
  score: number;
  feedback?: string;
  rubricScores?: RubricScore[];
}

export interface AssignmentFilters {
  search?: string;
  type?: 'essay' | 'file_upload' | 'quiz' | 'project' | 'presentation' | 'all';
  status?: 'draft' | 'scheduled' | 'active' | 'expired' | 'inactive' | 'published' | 'all';
  course?: string;
  createdBy?: string;
  isActive?: boolean;
  isPublished?: boolean;
  page?: number;
  limit?: number;
  sortBy?: 'title' | 'createdAt' | 'dueDate' | 'totalMarks';
  sortOrder?: 'asc' | 'desc';
}

export interface SubmissionFilters {
  assignment?: string;
  student?: string;
  status?: 'draft' | 'submitted' | 'graded' | 'returned' | 'all';
  isLate?: boolean;
  page?: number;
  limit?: number;
  sortBy?: 'submittedAt' | 'score' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export interface AssignmentStats {
  totalAssignments: number;
  publishedAssignments: number;
  draftAssignments: number;
  activeAssignments: number;
  totalSubmissions: number;
  gradedSubmissions: number;
  averageScore: number;
  passRate: number;
  assignmentsByType: Record<string, number>;
  submissionsByStatus: Record<string, number>;
}

export interface AssignmentSubmissionStats {
  totalSubmissions: number;
  submittedSubmissions: number;
  gradedSubmissions: number;
  averageScore: number;
  passRate: number;
  lateSubmissions: number;
  submissionsByStatus: Record<string, number>;
}

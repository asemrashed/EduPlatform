export enum PaperType {
  QUESTION_PAPER = 'question_paper',
  MARKS_PDF = 'marks_pdf',
  WORK_SOLUTION = 'work_solution',
}

export interface IPassPaper {
  _id: string;
  id?: string;
  course?: string; // ObjectId as string
  sessionName: string;
  year: number;
  subject: string;
  examType: string;
  questionPaperUrl?: string;
  marksPdfUrl?: string;
  workSolutionUrl?: string;
  description?: string;
  tags?: string;
  isActive?: boolean;
  uploadedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

// For API responses
export type PassPaper = IPassPaper;

export interface CreatePassPaperDto {
  course?: string;
  sessionName: string;
  year: number;
  subject: string;
  examType: string;
  questionPaperUrl?: string;
  marksPdfUrl?: string;
  workSolutionUrl?: string;
  description?: string;
  tags?: string;
  isActive?: boolean;
  uploadedBy?: string;
}

export interface UpdatePassPaperDto {
  course?: string;
  sessionName?: string;
  year?: number;
  subject?: string;
  examType?: string;
  questionPaperUrl?: string;
  marksPdfUrl?: string;
  workSolutionUrl?: string;
  description?: string;
  tags?: string;
  isActive?: boolean;
  uploadedBy?: string;
}

export interface PassPaperFilters {
  sessionName?: string;
  year?: number;
  subject?: string;
  examType?: string;
  paperType?: PaperType;
  isActive?: boolean;
  uploadedBy?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PassPaperResponse {
  passPapers: PassPaper[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface PassPaperStats {
  totalPapers: number;
  activePapers: number;
  inactivePapers: number;
  papersByType: {
    questionPapers: number;
    marksPdfs: number;
    workSolutions: number;
  };
  papersBySubject: Record<string, number>;
  papersByYear: Record<number, number>;
  recentUploads: PassPaper[];
}

export interface PassPaperUploadResult {
  success: boolean;
  passPaper?: PassPaper;
  error?: string;
  uploadResults?: {
    questionPaper?: {
      success: boolean;
      url?: string;
      error?: string;
    };
    marksPdf?: {
      success: boolean;
      url?: string;
      error?: string;
    };
    workSolution?: {
      success: boolean;
      url?: string;
      error?: string;
    };
  };
}

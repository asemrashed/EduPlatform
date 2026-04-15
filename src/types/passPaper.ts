/** Row from `GET /api/pass-papers` — aligned with learning-project PassPaper lean docs. */
export interface PassPaperRow {
  _id: string;
  course?: { _id: string; title?: string } | string;
  sessionName: string;
  year: number;
  subject: string;
  examType: string;
  questionPaperUrl?: string;
  marksPdfUrl?: string;
  workSolutionUrl?: string;
  isActive?: boolean;
  createdAt: string;
}

export interface PassPapersPagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface PassPapersListBody {
  passPapers: PassPaperRow[];
  pagination: PassPapersPagination;
}

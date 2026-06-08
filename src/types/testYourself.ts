export type TestYourselfOption = {
  index: number;
  text: string;
};

export type TestYourselfQuestion = {
  _id: string;
  subject: string;
  topic: string;
  subtopic?: string;
  difficulty: 1 | 2 | 3;
  questionText: string;
  hasDiagram: boolean;
  diagramUrl?: string;
  options: TestYourselfOption[];
};

export type TestYourselfTopic = {
  subject: string;
  topic: string;
  questionCount: number;
  previewCount: number;
  lockedCount: number;
};

export type TestYourselfAccess = {
  fullAccess: boolean;
  freeLimit: number;
  total: number;
  lockedCount: number;
};

export type TestYourselfAnswerInput = {
  questionId: string;
  optionIndex: number;
};

export type TestYourselfCheckResult = {
  questionId: string;
  correct: boolean;
  selectedIndex: number;
  correctIndex: number;
  explanation?: string;
};

'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { AttractiveInput } from '@/components/ui/attractive-input';
import FormModal from '@/components/ui/form-modal';
import { LuUpload as Upload, LuFileText as LuFileText, LuDownload as Download, LuTriangleAlert as AlertCircle, LuCheck as CheckCircle2, LuX as X } from 'react-icons/lu';;
import { Badge } from '@/components/ui/badge';

interface CSVUploadModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (questions: any[]) => void;
  examId?: string;
}

interface ParsedQuestion {
  question: string;
  type: 'mcq' | 'written' | 'true_false' | 'fill_blank' | 'essay';
  marks: number;
  difficulty: 'easy' | 'medium' | 'hard';
  category?: string;
  options?: { text: string; isCorrect: boolean }[];
  correctAnswer?: string;
  explanation?: string;
  hints?: string[];
  timeLimit?: number;
  tags?: string[];
}

export default function CSVUploadModal({ open, onClose, onSuccess, examId }: CSVUploadModalProps) {
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [parsedQuestions, setParsedQuestions] = useState<ParsedQuestion[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [previewMode, setPreviewMode] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== 'text/csv' && !selectedFile.name.endsWith('.csv')) {
        setErrors(['Please select a valid CSV file']);
        return;
      }
      setFile(selectedFile);
      setErrors([]);
      parseCSV(selectedFile);
    }
  };

  const parseCSV = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      try {
        const questions = parseCSVText(text);
        setParsedQuestions(questions);
        setPreviewMode(true);
        setErrors([]);
      } catch (error) {
        setErrors([`Error parsing CSV: ${error instanceof Error ? error.message : 'Unknown error'}`]);
      }
    };
    reader.readAsText(file);
  };

    const parseCSVText = (text: string): ParsedQuestion[] => {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length < 2) {
      throw new Error('CSV must have at least a header row and one data row');
    }

    console.log('CSV Parsing Debug:', {
      totalLines: lines.length,
      firstLine: lines[0],
      secondLine: lines[1]
    });

    // Parse CSV line properly handling quoted fields
    const parseCSVLine = (line: string): string[] => {
      const result: string[] = [];
      let current = '';
      let inQuotes = false;
      
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          // Clean up the field - remove surrounding quotes if present
          let field = current.trim();
          if (field.startsWith('"') && field.endsWith('"')) {
            field = field.slice(1, -1);
          }
          result.push(field);
          current = '';
        } else {
          current += char;
        }
      }
      
      // Handle the last field
      let field = current.trim();
      if (field.startsWith('"') && field.endsWith('"')) {
        field = field.slice(1, -1);
      }
      result.push(field);
      
      return result;
    };

    const headers = parseCSVLine(lines[0]).map(h => h.trim().toLowerCase());
    const requiredHeaders = ['question', 'type', 'marks', 'difficulty'];
    
    console.log('Headers Debug:', {
      rawHeaders: parseCSVLine(lines[0]),
      processedHeaders: headers,
      requiredHeaders,
      missingHeaders: requiredHeaders.filter(h => !headers.includes(h))
    });
    
    // Validate headers
    const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
    if (missingHeaders.length > 0) {
      throw new Error(`Missing required headers: ${missingHeaders.join(', ')}`);
    }

    const questions: ParsedQuestion[] = [];
    const csvErrors: string[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i]);
      
      console.log(`Row ${i + 1} Parsed:`, {
        line: lines[i],
        values,
        headers,
        length: values.length
      });
      
      if (values.length !== headers.length) {
        csvErrors.push(`Row ${i + 1}: Column count mismatch (expected ${headers.length}, got ${values.length})`);
        continue;
      }

      try {
        const question = parseQuestionRow(headers, values, i + 1);
        questions.push(question);
      } catch (error) {
        csvErrors.push(`Row ${i + 1}: ${error instanceof Error ? error.message : 'Invalid data'}`);
      }
    }

    if (csvErrors.length > 0) {
      setErrors(csvErrors);
    }

    return questions;
  };

  const parseQuestionRow = (headers: string[], values: string[], rowNum: number): ParsedQuestion => {
    const getValue = (header: string) => {
      const index = headers.indexOf(header);
      return index >= 0 ? values[index] : '';
    };

    const question = getValue('question');
    if (!question || question.length < 10) {
      throw new Error('Question must be at least 10 characters long');
    }

    const type = getValue('type') as ParsedQuestion['type'];
    if (!['mcq', 'written', 'true_false', 'fill_blank', 'essay'].includes(type)) {
      throw new Error('Type must be one of: mcq, written, true_false, fill_blank, essay');
    }

    const marks = parseInt(getValue('marks'));
    if (isNaN(marks) || marks < 1 || marks > 100) {
      throw new Error('Marks must be a number between 1 and 100');
    }

    const difficulty = getValue('difficulty') as ParsedQuestion['difficulty'];
    if (!['easy', 'medium', 'hard'].includes(difficulty)) {
      throw new Error('Difficulty must be one of: easy, medium, hard');
    }

    const questionData: ParsedQuestion = {
      question,
      type,
      marks,
      difficulty,
      category: getValue('category') || undefined,
      explanation: getValue('explanation') || undefined,
      timeLimit: parseInt(getValue('timelimit')) || 1,
      tags: getValue('tags') ? getValue('tags').split(';').map(t => t.trim()) : [],
      hints: getValue('hints') ? getValue('hints').split(';').map(h => h.trim()) : []
    };

    // Handle options for MCQ and True/False
    if (type === 'mcq' || type === 'true_false') {
      const options: { text: string; isCorrect: boolean }[] = [];
      const optionsRaw = getValue('options');
      const correctRaw = getValue('correct');
      
      console.log('MCQ Options Debug:', {
        type,
        optionsRaw,
        correctRaw,
        allValues: values,
        headers
      });
      
      const optionTexts = optionsRaw ? optionsRaw.split('|') : [];
      const correctAnswers = correctRaw ? correctRaw.split('|') : [];

      if (optionTexts.length < 2) {
        throw new Error('MCQ/True-False questions must have at least 2 options');
      }

      optionTexts.forEach((text, index) => {
        if (text.trim()) {
          options.push({
            text: text.trim(),
            isCorrect: correctAnswers.includes(index.toString()) || correctAnswers.includes(text.trim())
          });
        }
      });

      if (options.length < 2) {
        throw new Error('At least 2 valid options are required');
      }

      if (options.filter(o => o.isCorrect).length === 0) {
        throw new Error('At least one option must be marked as correct');
      }

      if (type === 'true_false' && options.length !== 2) {
        throw new Error('True/False questions must have exactly 2 options');
      }

      questionData.options = options;
    }

    // Handle correct answer for written/essay
    if (type === 'written' || type === 'essay') {
      const correctAnswer = getValue('correctanswer');
      if (!correctAnswer || correctAnswer.length < 5) {
        throw new Error('Written/Essay questions must have a correct answer (minimum 5 characters)');
      }
      questionData.correctAnswer = correctAnswer;
    }

    return questionData;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (parsedQuestions.length === 0) {
      setErrors(['No valid questions found in CSV']);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/questions/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          questions: parsedQuestions,
          exam: examId
        }),
      });

      const data = await response.json();

      if (response.ok) {
        onSuccess(data.data);
        onClose();
        resetForm();
      } else {
        setErrors([data.error || 'Failed to create questions']);
      }
    } catch (error) {
      setErrors(['Failed to upload questions']);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFile(null);
    setParsedQuestions([]);
    setErrors([]);
    setPreviewMode(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const downloadTemplate = () => {
    const template = `question,type,marks,difficulty,category,options,correct,correctanswer,explanation,hints,tags,timelimit
"What is the capital of France?",mcq,2,easy,Geography,"Paris|London|Berlin|Madrid","0","","","","",5
"Explain photosynthesis in detail",written,10,medium,Biology,"","","Plants convert sunlight to energy","","","",10
"Water boils at 100°C",true_false,1,easy,Science,"True|False","0","","","","",3`;

    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'questions_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const downloadExample = (exampleType: string) => {
    const a = document.createElement('a');
    a.href = `/examples/${exampleType}.csv`;
    a.download = `${exampleType}.csv`;
    a.click();
  };

  return (
    <FormModal
      open={open}
      onClose={handleClose}
      onSubmit={previewMode ? handleSubmit : (e: React.FormEvent) => e.preventDefault()}
      title="Upload Questions from CSV"
      description="Bulk import questions from a CSV file"
      submitText={previewMode ? `Create ${parsedQuestions.length} Questions` : undefined}
      loading={loading}
      size="2xl"
      submitVariant="primary"
    >
      <div className="space-y-6">
        {!previewMode ? (
          <>
            {/* File Upload Section */}
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Upload CSV File</h3>
                <p className="text-gray-600 mb-4">
                  Select a CSV file with your questions. Download the template for the correct format.
                </p>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="mb-4"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Choose CSV File
                </Button>
                
                <div className="flex flex-wrap gap-2 justify-center">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={downloadTemplate}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download Template
                  </Button>
                  
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => downloadExample('all-question-types')}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    All Types Example
                  </Button>
                </div>
                
                <div className="mt-4">
                  <h4 className="font-semibold mb-2 text-sm">Question Type Examples:</h4>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => downloadExample('mcq-questions')}
                      className="text-xs"
                    >
                      MCQ
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => downloadExample('written-questions')}
                      className="text-xs"
                    >
                      Written
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => downloadExample('true-false-questions')}
                      className="text-xs"
                    >
                      True/False
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => downloadExample('fill-blank-questions')}
                      className="text-xs"
                    >
                      Fill Blank
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => downloadExample('essay-questions')}
                      className="text-xs"
                    >
                      Essay
                    </Button>
                  </div>
                </div>
              </div>

              {file && (
                <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                  <LuFileText className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium">{file.name}</span>
                  <Badge variant="outline" className="ml-auto">
                    {file.size} bytes
                  </Badge>
                </div>
              )}
            </div>

            {/* CSV Format Instructions */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold mb-2">CSV Format Requirements:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• <strong>Required columns:</strong> question, type, marks, difficulty</li>
                <li>• <strong>Optional columns:</strong> category, options, correct, correctanswer, explanation, hints, tags, timelimit</li>
                <li>• <strong>Types:</strong> mcq, written, true_false, fill_blank, essay</li>
                <li>• <strong>Difficulties:</strong> easy, medium, hard</li>
                <li>• <strong>Options:</strong> Separate with | (pipe), mark correct with index or text</li>
                <li>• <strong>Hints/Tags:</strong> Separate multiple values with ; (semicolon)</li>
              </ul>
              <div className="mt-3 p-3 bg-blue-50 rounded border-l-4 border-blue-400">
                <p className="text-sm text-blue-800">
                  <strong>💡 Tip:</strong> Download the example files above to see proper formatting for each question type!
                </p>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Preview Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Preview Questions</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setPreviewMode(false)}
                >
                  <X className="w-4 h-4 mr-2" />
                  Change File
                </Button>
              </div>

              <div className="max-h-96 overflow-y-auto space-y-3">
                {parsedQuestions.map((question, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-sm">Question {index + 1}</h4>
                      <div className="flex gap-2">
                        <Badge variant="outline" className="text-xs">
                          {question.type.toUpperCase()}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {question.marks} marks
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {question.difficulty}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{question.question}</p>
                    
                    {question.options && (
                      <div className="text-xs text-gray-500">
                        <strong>Options:</strong> {question.options.map(o => o.text).join(', ')}
                      </div>
                    )}
                    
                    {question.correctAnswer && (
                      <div className="text-xs text-gray-500">
                        <strong>Answer:</strong> {question.correctAnswer}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Errors Display */}
        {errors.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-red-800 mb-2">Errors Found:</h4>
                <ul className="text-sm text-red-700 space-y-1">
                  {errors.map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Success Message */}
        {parsedQuestions.length > 0 && errors.length === 0 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <span className="text-green-800 font-medium">
                Successfully parsed {parsedQuestions.length} questions
              </span>
            </div>
          </div>
        )}
      </div>
    </FormModal>
  );
}

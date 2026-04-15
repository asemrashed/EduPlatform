'use client';

import { useState, useEffect } from 'react';
import { Question, CreateQuestionData } from '@/types/exam';
import { AttractiveInput } from '@/components/ui/attractive-input';
import { AttractiveTextarea } from '@/components/ui/attractive-textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import FormModal from '@/components/ui/form-modal';
import { LuPlus as Plus, LuX as X } from 'react-icons/lu';

interface QuestionModalProps {
  open: boolean;
  question?: Question | null;
  examId?: string;
  onClose: () => void;
  onSuccess: (question: Question) => void;
}

export default function QuestionModal({ open, question, examId, onClose, onSuccess }: QuestionModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreateQuestionData>({
    question: '',
    type: 'mcq',
    marks: 1,
    difficulty: 'easy',
    category: '',
    tags: [],
    options: [
      { text: '', isCorrect: false },
      { text: '', isCorrect: false }
    ],
    correctAnswer: '',
    explanation: '',
    hints: [],
    timeLimit: 0,
    exam: ''
  });

  const [newOption, setNewOption] = useState('');
  const [newHint, setNewHint] = useState('');
  const [newTag, setNewTag] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Validation functions
  const validateField = (field: string, value: any): string => {
    switch (field) {
      case 'question':
        if (!value || value.trim().length === 0) {
          return 'Question text is required';
        }
        if (value.trim().length < 10) {
          return 'Question must be at least 10 characters long';
        }
        if (value.trim().length > 2000) {
          return 'Question cannot exceed 2000 characters';
        }
        return '';

      case 'type':
        if (!value) {
          return 'Question type is required';
        }
        return '';

      case 'marks':
        if (!value || value <= 0) {
          return 'Marks must be greater than 0';
        }
        if (value > 100) {
          return 'Marks cannot exceed 100';
        }
        return '';

      case 'difficulty':
        if (!value) {
          return 'Difficulty level is required';
        }
        return '';

      case 'timeLimit':
        if (value !== undefined && value < 1) {
          return 'Time limit must be at least 1 minute';
        }
        if (value > 60) {
          return 'Time limit cannot exceed 60 minutes';
        }
        return '';

      case 'options':
        if (formData.type === 'mcq' || formData.type === 'true_false') {
          if (!value || value.length < 2) {
            return 'At least 2 options are required';
          }
          if (value.length > 6) {
            return 'Cannot have more than 6 options';
          }
          const validOptions = value.filter((option: any) => option.text.trim() !== '');
          if (validOptions.length < 2) {
            return 'At least 2 valid options are required';
          }
          const correctOptions = validOptions.filter((option: any) => option.isCorrect);
          if (correctOptions.length === 0) {
            return 'At least one option must be marked as correct';
          }
          if (formData.type === 'true_false' && validOptions.length !== 2) {
            return 'True/False questions must have exactly 2 options';
          }
        }
        return '';

      case 'correctAnswer':
        if (formData.type === 'written' || formData.type === 'essay') {
          if (!value || value.trim().length === 0) {
            return 'Correct answer is required for written/essay questions';
          }
          if (value.trim().length < 5) {
            return 'Answer must be at least 5 characters long';
          }
        }
        return '';

      default:
        return '';
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    // Validate all fields
    Object.keys(formData).forEach(field => {
      const error = validateField(field, formData[field as keyof CreateQuestionData]);
      if (error) {
        newErrors[field] = error;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFieldBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    const error = validateField(field, formData[field as keyof CreateQuestionData]);
    setErrors(prev => ({ ...prev, [field]: error }));
  };

  const handleFieldChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  useEffect(() => {
    console.log('QuestionModal - examId received:', examId);
    if (question) {
      setFormData({
        question: question.question,
        type: question.type,
        marks: question.marks,
        difficulty: question.difficulty,
        category: question.category || '',
        tags: question.tags || [],
        options: question.options || [
          { text: '', isCorrect: false },
          { text: '', isCorrect: false }
        ],
        correctAnswer: question.correctAnswer || '',
        explanation: question.explanation || '',
        hints: question.hints || [],
        timeLimit: question.timeLimit || 1,
        exam: (() => {
          const e = question.exam;
          if (typeof e === 'string') return e;
          const ex = e as { _id?: { toString(): string }; toString(): string } | undefined;
          if (!ex) return '';
          return ex._id ? ex._id.toString() : ex.toString();
        })()
      });
    } else {
      setFormData({
        question: '',
        type: 'mcq',
        marks: 1,
        difficulty: 'easy',
        category: '',
        tags: [],
        options: [
          { text: '', isCorrect: false },
          { text: '', isCorrect: false }
        ],
        correctAnswer: '',
        explanation: '',
        hints: [],
        timeLimit: 1,
        exam: examId || ''
      });
    }
    console.log('QuestionModal - formData exam field set to:', examId || '');
  }, [question, open, examId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form before submission
    if (!validateForm()) {
      // Mark all fields as touched to show errors
      const allTouched: Record<string, boolean> = {};
      Object.keys(formData).forEach(field => {
        allTouched[field] = true;
      });
      setTouched(allTouched);
      return;
    }
    
    setLoading(true);

    try {
      const url = question ? `/api/questions/${question._id}` : '/api/questions';
      const method = question ? 'PUT' : 'POST';
      
      // Process form data before sending
      const processedData = {
        ...formData,
        // Filter out empty options
        options: formData.options?.filter(option => option.text.trim() !== '') || [],
        // Ensure timeLimit is at least 1
        timeLimit: Math.max(formData.timeLimit || 1, 1),
        // Only include exam if it's not empty
        ...(formData.exam && formData.exam.trim() !== '' ? { exam: formData.exam } : {})
      };
      
      console.log('QuestionModal - Sending data:', {
        url,
        method,
        processedData,
        originalFormData: formData,
        examId: examId,
        examField: {
          original: formData.exam,
          processed: processedData.exam,
          type: typeof processedData.exam
        }
      });
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(processedData),
      });

      const data = await response.json();

      if (response.ok) {
        onSuccess(data.data);
        onClose();
      } else {
        console.error('Error:', data.error);
        alert('Failed to save question: ' + data.error);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to save question');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleOptionChange = (index: number, field: string, value: any) => {
    const newOptions = [...formData.options!];
    newOptions[index] = { ...newOptions[index], [field]: value };
    setFormData(prev => ({ ...prev, options: newOptions }));
    
    // Clear options error when user makes changes
    if (errors.options) {
      setErrors(prev => ({ ...prev, options: '' }));
    }
  };

  const addOption = () => {
    if (newOption.trim()) {
      setFormData(prev => ({
        ...prev,
        options: [...prev.options!, { text: newOption.trim(), isCorrect: false }]
      }));
      setNewOption('');
    }
  };

  const removeOption = (index: number) => {
    if (formData.options!.length > 2) {
      const newOptions = formData.options!.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, options: newOptions }));
    }
  };

  const addHint = () => {
    if (newHint.trim()) {
      setFormData(prev => ({
        ...prev,
        hints: [...prev.hints!, newHint.trim()]
      }));
      setNewHint('');
    }
  };

  const removeHint = (index: number) => {
    const newHints = formData.hints!.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, hints: newHints }));
  };

  const addTag = () => {
    if (newTag.trim()) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags!, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (index: number) => {
    const newTags = formData.tags!.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, tags: newTags }));
  };

  return (
    <FormModal
      open={open}
      onClose={onClose}
      onSubmit={handleSubmit}
      title={question ? 'Edit Question' : 'Create New Question'}
      description="Add a new question to your question bank"
      submitText={question ? 'Update Question' : 'Create Question'}
      loading={loading}
      size="2xl"
      submitVariant="primary"
    >
      {/* Basic LuInformation */}
      <div className="space-y-6">
        <AttractiveTextarea
          label="Question *"
          value={formData.question}
          onChange={(e) => handleFieldChange('question', e.target.value)}
          onBlur={() => handleFieldBlur('question')}
          placeholder="Enter your question here..."
          rows={4}
          variant="default"
          colorScheme="primary"
          size="md"
          helperText={
            errors.question && touched.question 
              ? `⚠️ ${errors.question}` 
              : "Write a clear and concise question (10-2000 characters)"
          }
          required
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-foreground">
              Question Type *
            </label>
            <Select
              value={formData.type}
              onValueChange={(value) => handleInputChange('type', value)}
            >
              <SelectTrigger className="h-12 border-2 border-blue-300 hover:border-blue-400 focus:border-blue-500 focus:ring-blue-500/20 focus:shadow-lg focus:shadow-blue-500/10 rounded-lg bg-white text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 transition-all duration-200 font-medium text-sm">
                <SelectValue placeholder="Select question type" />
              </SelectTrigger>
              <SelectContent className="bg-white border border-gray-200 rounded-lg shadow-lg">
                <SelectItem value="mcq" className="hover:bg-gray-100">Multiple Choice</SelectItem>
                <SelectItem value="written" className="hover:bg-gray-100">Written/Essay</SelectItem>
                <SelectItem value="true_false" className="hover:bg-gray-100">True/False</SelectItem>
                <SelectItem value="fill_blank" className="hover:bg-gray-100">Fill in the Blank</SelectItem>
                <SelectItem value="essay" className="hover:bg-gray-100">Essay</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <AttractiveInput
            label="Marks *"
            type="number"
            min="1"
            max="100"
            value={formData.marks}
            onChange={(e) => handleFieldChange('marks', parseInt(e.target.value) || 1)}
            onBlur={() => handleFieldBlur('marks')}
            placeholder="Enter marks"
            variant="default"
            colorScheme="primary"
            size="md"
            icon="target"
            helperText={
              errors.marks && touched.marks 
                ? `⚠️ ${errors.marks}` 
                : "Points for this question (1-100)"
            }
            required
          />

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-foreground">
              Difficulty *
            </label>
            <Select
              value={formData.difficulty}
              onValueChange={(value) => handleInputChange('difficulty', value)}
            >
              <SelectTrigger className="h-12 border-2 border-blue-300 hover:border-blue-400 focus:border-blue-500 focus:ring-blue-500/20 focus:shadow-lg focus:shadow-blue-500/10 rounded-lg bg-white text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 transition-all duration-200 font-medium text-sm">
                <SelectValue placeholder="Select difficulty" />
              </SelectTrigger>
              <SelectContent className="bg-white border border-gray-200 rounded-lg shadow-lg">
                <SelectItem value="easy" className="hover:bg-gray-100">Easy</SelectItem>
                <SelectItem value="medium" className="hover:bg-gray-100">Medium</SelectItem>
                <SelectItem value="hard" className="hover:bg-gray-100">Hard</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <AttractiveInput
          label="Category"
          value={formData.category}
          onChange={(e) => handleInputChange('category', e.target.value)}
          placeholder="Enter category (optional)"
          variant="default"
          colorScheme="primary"
          size="md"
          icon="tag"
          helperText="Optional category for organization"
        />
      </div>

      {/* MCQ Options */}
      {(formData.type === 'mcq' || formData.type === 'true_false') && (
        <div className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Answer Options</h3>
            {formData.options?.map((option, index) => (
              <div key={index} className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={option.isCorrect}
                  onChange={(e) => handleOptionChange(index, 'isCorrect', e.target.checked)}
                  className="w-4 h-4 text-blue-600"
                />
                <AttractiveInput
                  value={option.text}
                  onChange={(e) => handleOptionChange(index, 'text', e.target.value)}
                  onBlur={() => handleFieldBlur('options')}
                  placeholder={`Option ${index + 1}`}
                  variant="default"
                  colorScheme="primary"
                  size="md"
                  className="flex-1"
                />
                {formData.options!.length > 2 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeOption(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
            {errors.options && touched.options && (
              <p className="text-sm text-red-600 mt-2">⚠️ {errors.options}</p>
            )}

            <div className="flex gap-2">
              <AttractiveInput
                value={newOption}
                onChange={(e) => setNewOption(e.target.value)}
                placeholder="Add new option"
                variant="default"
                colorScheme="primary"
                size="md"
                className="flex-1"
              />
              <Button
                type="button"
                onClick={addOption}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Written Answer */}
      {(formData.type === 'written' || formData.type === 'essay') && (
        <div className="space-y-6">
          <AttractiveTextarea
            label="Correct Answer *"
            value={formData.correctAnswer}
            onChange={(e) => handleFieldChange('correctAnswer', e.target.value)}
            onBlur={() => handleFieldBlur('correctAnswer')}
            placeholder="Enter the correct answer..."
            rows={4}
            variant="default"
            colorScheme="primary"
            size="md"
            helperText={
              errors.correctAnswer && touched.correctAnswer 
                ? `⚠️ ${errors.correctAnswer}` 
                : "Provide the expected answer for this question (minimum 5 characters)"
            }
            required
          />
        </div>
      )}

      {/* Additional LuInformation */}
      <div className="space-y-6">
        <AttractiveTextarea
          label="Explanation"
          value={formData.explanation}
          onChange={(e) => handleInputChange('explanation', e.target.value)}
          placeholder="Explain why this is the correct answer..."
          rows={3}
          variant="default"
          colorScheme="primary"
          size="md"
          helperText="Optional explanation for the answer"
        />

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-foreground">
            Hints
          </label>
          <div className="space-y-2">
            {formData.hints?.map((hint, index) => (
              <div key={index} className="flex items-center gap-2">
                <Badge variant="secondary">{hint}</Badge>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeHint(index)}
                  className="text-red-600 hover:text-red-700"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
            <div className="flex gap-2">
              <AttractiveInput
                value={newHint}
                onChange={(e) => setNewHint(e.target.value)}
                placeholder="Add hint"
                variant="default"
                colorScheme="primary"
                size="md"
                className="flex-1"
              />
              <Button
                type="button"
                onClick={addHint}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-foreground">
            Tags
          </label>
          <div className="space-y-2">
            {formData.tags?.map((tag, index) => (
              <div key={index} className="flex items-center gap-2">
                <Badge variant="outline">{tag}</Badge>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeTag(index)}
                  className="text-red-600 hover:text-red-700"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
            <div className="flex gap-2">
              <AttractiveInput
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add tag"
                variant="default"
                colorScheme="primary"
                size="md"
                className="flex-1"
              />
              <Button
                type="button"
                onClick={addTag}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </FormModal>
  );
}

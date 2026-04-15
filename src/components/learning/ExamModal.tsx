'use client';

import { useState, useEffect } from 'react';
import { Exam, CreateExamData, UpdateExamData } from '@/types/exam';
import { AttractiveInput } from '@/components/ui/attractive-input';
import { AttractiveTextarea } from '@/components/ui/attractive-textarea';
import CustomEditor from '@/components/custom-editor';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import FormModal from '@/components/ui/form-modal';

interface ExamModalProps {
  open: boolean;
  exam?: Exam | null;
  onClose: () => void;
  onSuccess: (exam: Exam) => void;
}

const toLocalDateTimeInputValue = (dateValue?: string | Date) => {
  if (!dateValue) return '';
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return '';

  const pad = (num: number) => String(num).padStart(2, '0');
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());

  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

const toISOStringFromLocalInput = (value?: string) => {
  if (!value) return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;
  return date.toISOString();
};

export default function ExamModal({ open, exam, onClose, onSuccess }: ExamModalProps) {
  const [courses, setCourses] = useState<Array<{ _id: string; title: string }>>([]);
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreateExamData>({
    title: '',
    description: '',
    type: 'mcq',
    duration: 60,
    totalMarks: 100,
    passingMarks: 50,
    instructions: '',
    startDate: '',
    endDate: '',
    course: '',
    questions: [],
    attempts: 1,
    shuffleQuestions: false,
    shuffleOptions: false,
    showCorrectAnswers: true,
    showResults: true,
    allowReview: true,
    timeLimit: true
  });

  // Fetch all courses when modal opens so Course (Optional) dropdown is populated
  useEffect(() => {
    if (!open) return;

    const loadCourses = async () => {
      try {
        setCoursesLoading(true);
        const response = await fetch('/api/courses?limit=500&page=1', {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        const data = await response.json();
        if (response.ok) {
          const list = data.data?.courses || data.courses || data.data || [];
          const normalized = Array.isArray(list)
            ? list
                .map((c: any) => ({ _id: c._id || c.id, title: c.title || c.name || 'Untitled Course' }))
                .filter((c: any) => c._id)
            : [];
          setCourses(normalized);
        } else {
          setCourses([]);
        }
      } catch (error) {
        console.error('Error fetching courses for exam:', error);
        setCourses([]);
      } finally {
        setCoursesLoading(false);
      }
    };

    loadCourses();
  }, [open]);

  useEffect(() => {
    if (exam) {
      console.log('ExamModal - Exam object:', {
        id: exam._id,
        title: exam.title,
        questions: exam.questions,
        questionsType: typeof exam.questions,
        questionsLength: exam.questions?.length,
        questionsStructure: exam.questions?.[0]
      });
      
      setFormData({
        title: exam.title,
        description: exam.description || '',
        type: exam.type,
        duration: exam.duration,
        totalMarks: exam.totalMarks,
        passingMarks: exam.passingMarks,
        instructions: exam.instructions || '',
        startDate: toLocalDateTimeInputValue(exam.startDate),
        endDate: toLocalDateTimeInputValue(exam.endDate),
        course: (() => {
          const c = exam.course as { _id?: { toString(): string }; toString(): string } | undefined;
          if (!c) return 'none';
          return c._id ? c._id.toString() : c.toString();
        })(),
        questions: exam.questions?.map((q: any) => {
          // Handle different question data structures
          if (typeof q === 'string') {
            return q;
          } else if (q && q._id) {
            return q._id.toString();
          } else if (q && q.id) {
            return q.id.toString();
          } else if (q && typeof q.toString === 'function') {
            // Handle ObjectId directly
            return q.toString();
          }
          return null;
        }).filter(Boolean) || [],
        attempts: exam.attempts,
        shuffleQuestions: exam.shuffleQuestions,
        shuffleOptions: exam.shuffleOptions,
        showCorrectAnswers: exam.showCorrectAnswers,
        showResults: exam.showResults,
        allowReview: exam.allowReview,
        timeLimit: exam.timeLimit
      });
    } else {
      setFormData({
        title: '',
        description: '',
        type: 'mcq',
        duration: 60,
        totalMarks: 100,
        passingMarks: 50,
        instructions: '',
        startDate: '',
        endDate: '',
        course: 'none',
        questions: [],
        attempts: 1,
        shuffleQuestions: false,
        shuffleOptions: false,
        showCorrectAnswers: true,
        showResults: true,
        allowReview: true,
        timeLimit: true
      });
    }
  }, [exam, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate form data
      if (formData.passingMarks > formData.totalMarks) {
        alert('Passing marks cannot exceed total marks');
        setLoading(false);
        return;
      }

      if (formData.totalMarks <= 0) {
        alert('Total marks must be greater than 0');
        setLoading(false);
        return;
      }

      if (formData.passingMarks < 0) {
        alert('Passing marks cannot be negative');
        setLoading(false);
        return;
      }

      const url = exam ? `/api/exams/${exam._id}` : '/api/exams';
      const method = exam ? 'PUT' : 'POST';
      
      // Process form data to handle "none" course value
      const processedData = {
        ...formData,
        course: formData.course === 'none' ? undefined : formData.course,
        startDate: toISOStringFromLocalInput(formData.startDate),
        endDate: toISOStringFromLocalInput(formData.endDate)
      };

      console.log('ExamModal - Sending data:', {
        url,
        method,
        processedData,
        originalFormData: formData
      });
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(processedData),
      });

      const data = await response.json();

      if (response.ok) {
        onSuccess(data.data);
        onClose();
      } else {
        console.error('Error:', data.error);
        // Show specific error message to user
        if (data.error && data.error.includes('passingMarks')) {
          alert('Error: Passing marks cannot exceed total marks. Please check your values.');
        } else if (data.error) {
          alert('Error: ' + data.error);
        } else {
          alert('Failed to save exam. Please try again.');
        }
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      
      // If total marks is being changed, ensure passing marks doesn't exceed it
      if (field === 'totalMarks') {
        if (newData.passingMarks > value) {
          newData.passingMarks = value;
        }
      }
      
      // If passing marks is being changed, ensure it doesn't exceed total marks
      if (field === 'passingMarks' && value > newData.totalMarks) {
        newData.passingMarks = newData.totalMarks;
      }
      
      return newData;
    });
  };

  const getTypeDescription = (type: string) => {
    switch (type) {
      case 'mcq':
        return 'Multiple Choice Questions only';
      case 'written':
        return 'Written/Essay questions only';
      case 'mixed':
        return 'Combination of MCQ and Written questions';
      default:
        return '';
    }
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} minutes`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  return (
    <FormModal
      open={open}
      onClose={onClose}
      onSubmit={handleSubmit}
      title={exam ? 'Edit Exam' : 'Create New Exam'}
      description="Configure your exam settings and requirements"
      submitText={exam ? 'Update Exam' : 'Create Exam'}
      loading={loading}
      size="2xl"
      submitVariant="primary"
    >
          {/* Basic Information */}
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AttractiveInput
                id="title"
                label="Exam Title *"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Enter exam title"
                variant="default"
                colorScheme="primary"
                size="md"
                icon="user"
                helperText="Give your exam a descriptive title"
                required
              />
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Exam Type *
                </label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => handleInputChange('type', value)}
                >
                  <SelectTrigger className="h-12 border-2 border-blue-300 hover:border-blue-400 focus:border-blue-500 focus:ring-blue-500/20 focus:shadow-lg focus:shadow-blue-500/10 rounded-lg bg-white text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 transition-all duration-200 font-medium text-sm">
                    <SelectValue placeholder="Select exam type" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-200 rounded-lg shadow-lg">
                    <SelectItem value="mcq" className="hover:bg-gray-100">Multiple Choice (MCQ)</SelectItem>
                    <SelectItem value="written" className="hover:bg-gray-100">Written/Essay</SelectItem>
                    <SelectItem value="mixed" className="hover:bg-gray-100">Mixed Format</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500">{getTypeDescription(formData.type)}</p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-foreground mb-2">Description</label>
              <CustomEditor
                value={formData.description}
                onChange={(data) => handleInputChange('description', data)}
                placeholder="Enter exam description"
              />
              <p className="text-xs text-gray-500">Provide a brief description of the exam</p>
            </div>

            <AttractiveTextarea
              id="instructions"
              label="Instructions"
              value={formData.instructions}
              onChange={(e) => handleInputChange('instructions', e.target.value)}
              placeholder="Enter exam instructions for students"
              rows={3}
              variant="default"
              colorScheme="primary"
              size="md"
              helperText="Provide clear instructions for students taking the exam"
            />

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-foreground mb-2">
                Course (Optional)
              </label>
              <Select
                value={formData.course}
                onValueChange={(value) => handleInputChange('course', value)}
                disabled={coursesLoading}
              >
                <SelectTrigger className="h-12 border-2 border-blue-300 hover:border-blue-400 focus:border-blue-500 focus:ring-blue-500/20 focus:shadow-lg focus:shadow-blue-500/10 rounded-lg bg-white text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 transition-all duration-200 font-medium text-sm">
                  <SelectValue placeholder={coursesLoading ? 'Loading courses...' : (courses.length ? 'Select a course' : 'No courses found')} />
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-200 rounded-lg shadow-lg">
                  <SelectItem value="none" className="hover:bg-gray-100">No course selected</SelectItem>
                  {coursesLoading && (
                    <div className="py-2 px-2 text-xs text-gray-500">Loading courses...</div>
                  )}
                  {courses?.map((course) => (
                    <SelectItem key={course._id} value={course._id} className="hover:bg-gray-100">
                      {course.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Exam Settings */}
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <AttractiveInput
                id="duration"
                label="Duration (minutes) *"
                type="number"
                min="1"
                max="1440"
                value={formData.duration}
                onChange={(e) => handleInputChange('duration', parseInt(e.target.value) || 0)}
                placeholder="Enter duration in minutes"
                variant="default"
                colorScheme="primary"
                size="md"
                icon="clock"
                helperText={formatDuration(formData.duration)}
                required
              />
              <AttractiveInput
                id="totalMarks"
                label="Total Marks *"
                type="number"
                min="1"
                max="10000"
                value={formData.totalMarks}
                onChange={(e) => handleInputChange('totalMarks', parseInt(e.target.value) || 0)}
                placeholder="Enter total marks"
                variant="default"
                colorScheme="primary"
                size="md"
                icon="target"
                helperText="Maximum possible score for this exam"
                required
              />
              <AttractiveInput
                id="passingMarks"
                label="Passing Marks *"
                type="number"
                min="0"
                max={formData.totalMarks}
                value={formData.passingMarks}
                onChange={(e) => handleInputChange('passingMarks', parseInt(e.target.value) || 0)}
                placeholder="Enter passing marks"
                variant="default"
                colorScheme="primary"
                size="md"
                icon="award"
                helperText={
                  formData.passingMarks > formData.totalMarks 
                    ? `⚠️ Cannot exceed total marks (${formData.totalMarks})`
                    : `${Math.round((formData.passingMarks / formData.totalMarks) * 100)}% of total marks`
                }
                required
              />
            </div>

            <AttractiveInput
              id="attempts"
              label="Maximum Attempts"
              type="number"
              min="1"
              max="10"
              value={formData.attempts}
              onChange={(e) => handleInputChange('attempts', parseInt(e.target.value) || 1)}
              placeholder="Enter maximum attempts"
              variant="default"
              colorScheme="primary"
              size="md"
              icon="users"
              helperText="Number of times a student can attempt this exam"
            />
          </div>

          {/* Schedule */}
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AttractiveInput
                id="startDate"
                label="Start Date & Time (Optional)"
                type="datetime-local"
                value={formData.startDate}
                onChange={(e) => handleInputChange('startDate', e.target.value)}
                variant="default"
                colorScheme="primary"
                size="md"
                icon="calendar"
                helperText="Optional - Leave empty for immediate availability. Note: Exam expires for each student once they complete it."
              />
              <AttractiveInput
                id="endDate"
                label="End Date & Time (Optional)"
                type="datetime-local"
                value={formData.endDate}
                onChange={(e) => handleInputChange('endDate', e.target.value)}
                variant="default"
                colorScheme="primary"
                size="md"
                icon="calendar"
                helperText="Optional - Leave empty for no end date. Note: Exam expires for each student once they complete it."
              />
            </div>
          </div>



    </FormModal>
  );
}

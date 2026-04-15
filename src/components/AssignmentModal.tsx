'use client';

import { useState, useEffect } from 'react';
import { Assignment, CreateAssignmentRequest, UpdateAssignmentRequest } from '@/types/assignment';
import { AttractiveInput } from '@/components/ui/attractive-input';
import { AttractiveTextarea } from '@/components/ui/attractive-textarea';
import CustomEditor from '@/components/custom-editor';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import FormModal from '@/components/ui/form-modal';
import { Switch } from '@/components/ui/switch';
import { Course } from '@/types/course';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LuFileText as LuFileText, LuUpload as Upload, LuCircle as HelpCircle, LuFolderOpen as FolderOpen, LuPresentation as Presentation, LuPlus as Plus, LuX as X, LuCalendar as Calendar, LuClock as Clock, LuTarget as Target, LuUsers as Users, LuSettings as Settings, LuFile, LuCheck as CheckCircle } from 'react-icons/lu';;

interface AssignmentModalProps {
  open: boolean;
  assignment?: Assignment | null;
  onClose: () => void;
  onSuccess: (assignment: Assignment) => void;
}

interface RubricItem {
  criteria: string;
  description: string;
  marks: number;
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

const assignmentTypes = [
  { value: 'essay', label: 'Essay', icon: LuFileText, description: 'Text-based written assignments' },
  { value: 'file_upload', label: 'LuFile Upload', icon: Upload, description: 'Document or file submissions' },
  { value: 'quiz', label: 'Quiz', icon: HelpCircle, description: 'Auto-graded questions' },
  { value: 'project', label: 'Project', icon: FolderOpen, description: 'Long-term project work' },
  { value: 'presentation', label: 'Presentation', icon: Presentation, description: 'Multimedia presentations' }
];

export default function AssignmentModal({ open, assignment, onClose, onSuccess }: AssignmentModalProps) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fetch all courses (including draft) from admin API when modal opens
  useEffect(() => {
    if (open) {
      setCoursesLoading(true);
      fetch('/api/courses?limit=500&page=1')
        .then((res) => res.json())
        .then((data) => {
          const list = data.data?.courses ?? data.courses ?? [];
          setCourses(Array.isArray(list) ? list : []);
        })
        .catch((err) => {
          console.error('Failed to fetch courses for assignment:', err);
          setCourses([]);
        })
        .finally(() => setCoursesLoading(false));
    }
  }, [open]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<CreateAssignmentRequest>({
    title: '',
    description: '',
    instructions: '',
    type: 'essay',
    course: '',
    totalMarks: 100,
    passingMarks: 50,
    maxAttempts: 1,
    allowLateSubmission: false,
    isGroupAssignment: false,
    autoGrade: false,
    showCorrectAnswers: true,
    allowReview: true
  });
  const [rubric, setRubric] = useState<RubricItem[]>([]);
  const [newRubricItem, setNewRubricItem] = useState<RubricItem>({
    criteria: '',
    description: '',
    marks: 0
  });

  // Validation functions
  const validateField = (field: string, value: any): string => {
    switch (field) {
      case 'title':
        if (!value || value.trim().length === 0) return 'Title is required';
        if (value.trim().length < 3) return 'Title must be at least 3 characters';
        if (value.trim().length > 200) return 'Title must be less than 200 characters';
        return '';
      
      case 'course':
        if (!value || value.trim().length === 0) return 'Course selection is required';
        return '';
      
      case 'totalMarks':
        if (!value || value <= 0) return 'Total marks must be greater than 0';
        if (value > 10000) return 'Total marks cannot exceed 10,000';
        if (!Number.isInteger(value)) return 'Total marks must be a whole number';
        return '';
      
      case 'passingMarks':
        if (value < 0) return 'Passing marks cannot be negative';
        if (value > formData.totalMarks) return 'Passing marks cannot exceed total marks';
        if (!Number.isInteger(value)) return 'Passing marks must be a whole number';
        return '';
      
      case 'maxAttempts':
        if (!value || value < 1) return 'Maximum attempts must be at least 1';
        if (value > 10) return 'Maximum attempts cannot exceed 10';
        if (!Number.isInteger(value)) return 'Maximum attempts must be a whole number';
        return '';
      
      case 'latePenaltyPercentage':
        if (formData.allowLateSubmission && value !== undefined) {
          if (value < 0) return 'Late penalty cannot be negative';
          if (value > 100) return 'Late penalty cannot exceed 100%';
          if (!Number.isInteger(value)) return 'Late penalty must be a whole number';
        }
        return '';
      
      case 'maxGroupSize':
        if (formData.isGroupAssignment && value !== undefined) {
          if (value < 2) return 'Group size must be at least 2';
          if (value > 20) return 'Group size cannot exceed 20';
          if (!Number.isInteger(value)) return 'Group size must be a whole number';
        }
        return '';
      
      case 'maxFileSize':
        if (formData.type === 'file_upload' && value !== undefined) {
          if (value < 1) return 'LuFile size must be at least 1 MB';
          if (value > 1000) return 'LuFile size cannot exceed 1000 MB';
          if (!Number.isInteger(value)) return 'LuFile size must be a whole number';
        }
        return '';
      
      case 'timeLimit':
        if (formData.type === 'quiz' && value !== undefined) {
          if (value < 1) return 'Time limit must be at least 1 minute';
          if (value > 1440) return 'Time limit cannot exceed 1440 minutes (24 hours)';
          if (!Number.isInteger(value)) return 'Time limit must be a whole number';
        }
        return '';
      
      case 'startDate':
        if (value && formData.dueDate) {
          const start = new Date(value);
          const due = new Date(formData.dueDate);
          if (start >= due) return 'Start date must be before due date';
        }
        return '';
      
      case 'dueDate':
        if (value && formData.startDate) {
          const start = new Date(formData.startDate);
          const due = new Date(value);
          if (due <= start) return 'Due date must be after start date';
        }
        if (value) {
          const due = new Date(value);
          const now = new Date();
          if (due <= now) return 'Due date must be in the future';
        }
        return '';
      
      default:
        return '';
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    // Validate required fields
    const requiredFields = ['title', 'course', 'totalMarks', 'passingMarks'];
    requiredFields.forEach(field => {
      const error = validateField(field, formData[field as keyof CreateAssignmentRequest]);
      if (error) newErrors[field] = error;
    });
    
    // Validate conditional fields
    if (formData.allowLateSubmission) {
      const penaltyError = validateField('latePenaltyPercentage', formData.latePenaltyPercentage);
      if (penaltyError) newErrors.latePenaltyPercentage = penaltyError;
    }
    
    if (formData.isGroupAssignment) {
      const groupSizeError = validateField('maxGroupSize', formData.maxGroupSize);
      if (groupSizeError) newErrors.maxGroupSize = groupSizeError;
    }
    
    if (formData.type === 'file_upload') {
      const fileSizeError = validateField('maxFileSize', formData.maxFileSize);
      if (fileSizeError) newErrors.maxFileSize = fileSizeError;
    }
    
    if (formData.type === 'quiz') {
      const timeLimitError = validateField('timeLimit', formData.timeLimit);
      if (timeLimitError) newErrors.timeLimit = timeLimitError;
    }
    
    // Validate dates
    if (formData.startDate) {
      const startDateError = validateField('startDate', formData.startDate);
      if (startDateError) newErrors.startDate = startDateError;
    }
    
    if (formData.dueDate) {
      const dueDateError = validateField('dueDate', formData.dueDate);
      if (dueDateError) newErrors.dueDate = dueDateError;
    }
    
    // Validate rubric
    const totalRubricMarks = rubric.reduce((sum, item) => sum + item.marks, 0);
    if (totalRubricMarks > formData.totalMarks) {
      newErrors.rubric = `Rubric marks (${totalRubricMarks}) cannot exceed total marks (${formData.totalMarks})`;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  useEffect(() => {
    if (assignment) {
      setFormData({
        title: assignment.title,
        description: assignment.description || '',
        instructions: assignment.instructions || '',
        type: assignment.type,
        course: typeof assignment.course === 'string' ? assignment.course : assignment.course._id,
        totalMarks: assignment.totalMarks,
        passingMarks: assignment.passingMarks,
        dueDate: toLocalDateTimeInputValue(assignment.dueDate),
        startDate: toLocalDateTimeInputValue(assignment.startDate),
        allowLateSubmission: assignment.allowLateSubmission,
        latePenaltyPercentage: assignment.latePenaltyPercentage,
        maxAttempts: assignment.maxAttempts,
        allowedFileTypes: assignment.allowedFileTypes,
        maxFileSize: assignment.maxFileSize,
        isGroupAssignment: assignment.isGroupAssignment,
        maxGroupSize: assignment.maxGroupSize,
        autoGrade: assignment.autoGrade,
        timeLimit: assignment.timeLimit,
        showCorrectAnswers: assignment.showCorrectAnswers,
        allowReview: assignment.allowReview
      });
      setRubric(assignment.rubric || []);
    } else {
      setFormData({
        title: '',
        description: '',
        instructions: '',
        type: 'essay',
        course: '',
        totalMarks: 100,
        passingMarks: 50,
        maxAttempts: 1,
        allowLateSubmission: false,
        isGroupAssignment: false,
        autoGrade: false,
        showCorrectAnswers: true,
        allowReview: true
      });
      setRubric([]);
    }
    setErrors({});
  }, [assignment, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form before submission
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);

    try {
      const url = assignment ? `/api/assignments/${assignment._id}` : '/api/assignments';
      const method = assignment ? 'PUT' : 'POST';
      
      const processedData = {
        ...formData,
        startDate: toISOStringFromLocalInput(formData.startDate),
        dueDate: toISOStringFromLocalInput(formData.dueDate),
        rubric: rubric
      };

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
        if (data.error && data.error.includes('passingMarks')) {
          alert('Error: Passing marks cannot exceed total marks. Please check your values.');
        } else if (data.error) {
          alert('Error: ' + data.error);
        } else {
          alert('Failed to save assignment. Please try again.');
        }
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An unexpected error occurred. Please try again.');
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
    
    // Real-time validation
    const error = validateField(field, value);
    setErrors(prev => ({
      ...prev,
      [field]: error
    }));
  };

  const getTypeIcon = (type: string) => {
    const typeConfig = assignmentTypes.find(t => t.value === type);
    return typeConfig ? <typeConfig.icon className="w-4 h-4" /> : <LuFileText className="w-4 h-4" />;
  };

  const getTypeDescription = (type: string) => {
    const typeConfig = assignmentTypes.find(t => t.value === type);
    return typeConfig?.description || '';
  };

  const addRubricItem = () => {
    if (newRubricItem.criteria && newRubricItem.marks > 0) {
      const updatedRubric = [...rubric, newRubricItem];
      setRubric(updatedRubric);
      
      // Validate rubric total
      const totalRubricMarks = updatedRubric.reduce((sum, item) => sum + item.marks, 0);
      if (totalRubricMarks > formData.totalMarks) {
        setErrors(prev => ({
          ...prev,
          rubric: `Rubric marks (${totalRubricMarks}) cannot exceed total marks (${formData.totalMarks})`
        }));
      } else {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.rubric;
          return newErrors;
        });
      }
      
      setNewRubricItem({ criteria: '', description: '', marks: 0 });
    }
  };

  const removeRubricItem = (index: number) => {
    const updatedRubric = rubric.filter((_, i) => i !== index);
    setRubric(updatedRubric);
    
    // Re-validate rubric total
    const totalRubricMarks = updatedRubric.reduce((sum, item) => sum + item.marks, 0);
    if (totalRubricMarks > formData.totalMarks) {
      setErrors(prev => ({
        ...prev,
        rubric: `Rubric marks (${totalRubricMarks}) cannot exceed total marks (${formData.totalMarks})`
      }));
    } else {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.rubric;
        return newErrors;
      });
    }
  };

  return (
    <FormModal
      open={open}
      onClose={onClose}
      onSubmit={handleSubmit}
      title={assignment ? 'Edit Assignment' : 'Create New Assignment'}
      description="Configure your assignment settings and requirements"
      submitText={assignment ? 'Update Assignment' : 'Create Assignment'}
      loading={loading}
      size="2xl"
      submitVariant="primary"
    >
          {/* Basic LuInformation */}
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <AttractiveInput
                  id="title"
                  label="Assignment Title *"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Enter assignment title"
                  variant="default"
                  colorScheme="primary"
                  size="md"
                  icon="file"
                  helperText="Give your assignment a descriptive title"
                  required
                />
                {errors.title && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <span className="text-red-500">⚠️</span>
                    {errors.title}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Assignment Type *
                </label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => handleInputChange('type', value)}
                >
                  <SelectTrigger className="h-12 border-2 border-blue-300 hover:border-blue-400 focus:border-blue-500 focus:ring-blue-500/20 focus:shadow-lg focus:shadow-blue-500/10 rounded-lg bg-white text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 transition-all duration-200 font-medium text-sm">
                    <SelectValue placeholder="Select assignment type" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-200 rounded-lg shadow-lg">
                    {assignmentTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value} className="hover:bg-gray-100">
                        <div className="flex items-center gap-2">
                          {getTypeIcon(type.value)}
                          <div>
                            <div className="font-medium">{type.label}</div>
                            <div className="text-xs text-gray-500">{type.description}</div>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500">{getTypeDescription(formData.type)}</p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-foreground mb-2">
                Course *
              </label>
              <Select
                value={formData.course}
                onValueChange={(value) => handleInputChange('course', value)}
                disabled={coursesLoading}
              >
                <SelectTrigger className="h-12 border-2 border-blue-300 hover:border-blue-400 focus:border-blue-500 focus:ring-blue-500/20 focus:shadow-lg focus:shadow-blue-500/10 rounded-lg bg-white text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 transition-all duration-200 font-medium text-sm disabled:opacity-70">
                  <SelectValue placeholder={coursesLoading ? 'Loading courses...' : (courses?.length === 0 ? 'No courses found' : 'Select a course')} />
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-200 rounded-lg shadow-lg">
                  {coursesLoading ? (
                    <div className="py-6 text-center text-sm text-muted-foreground">
                      Loading courses...
                    </div>
                  ) : courses?.length === 0 ? (
                    <div className="py-6 text-center text-sm text-muted-foreground">
                      No courses available. Create a course first.
                    </div>
                  ) : (
                    courses?.map((course) => (
                      <SelectItem key={course._id} value={course._id} className="hover:bg-gray-100">
                        {course.title}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {errors.course && (
                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                  <span className="text-red-500">⚠️</span>
                  {errors.course}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-foreground mb-2">Description</label>
              <CustomEditor
                value={formData.description}
                onChange={(data) => handleInputChange('description', data)}
                placeholder="Enter assignment description"
              />
              <p className="text-xs text-gray-500">Provide a brief description of the assignment</p>
            </div>

            <AttractiveTextarea
              id="instructions"
              label="Instructions"
              value={formData.instructions}
              onChange={(e) => handleInputChange('instructions', e.target.value)}
              placeholder="Enter assignment instructions for students"
              rows={3}
              variant="default"
              colorScheme="primary"
              size="md"
              helperText="Provide clear instructions for students"
            />
          </div>

          {/* Assignment Settings */}
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
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
                  helperText="Maximum possible score for this assignment"
                  required
                />
                {errors.totalMarks && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <span className="text-red-500">⚠️</span>
                    {errors.totalMarks}
                  </p>
                )}
              </div>
              <div>
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
                {errors.passingMarks && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <span className="text-red-500">⚠️</span>
                    {errors.passingMarks}
                  </p>
                )}
              </div>
              <div>
                <AttractiveInput
                  id="maxAttempts"
                  label="Maximum Attempts"
                  type="number"
                  min="1"
                  max="10"
                  value={formData.maxAttempts}
                  onChange={(e) => handleInputChange('maxAttempts', parseInt(e.target.value) || 1)}
                  placeholder="Enter maximum attempts"
                  variant="default"
                  colorScheme="primary"
                  size="md"
                  icon="users"
                  helperText="Number of times a student can attempt this assignment"
                />
                {errors.maxAttempts && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <span className="text-red-500">⚠️</span>
                    {errors.maxAttempts}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Schedule */}
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <AttractiveInput
                  id="startDate"
                  label="Start Date & Time"
                  type="datetime-local"
                  value={formData.startDate || ''}
                  onChange={(e) => handleInputChange('startDate', e.target.value || undefined)}
                  variant="default"
                  colorScheme="primary"
                  size="md"
                  icon="calendar"
                  helperText="Leave empty for immediate availability"
                />
                {errors.startDate && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <span className="text-red-500">⚠️</span>
                    {errors.startDate}
                  </p>
                )}
              </div>
              <div>
                <AttractiveInput
                  id="dueDate"
                  label="Due Date & Time"
                  type="datetime-local"
                  value={formData.dueDate || ''}
                  onChange={(e) => handleInputChange('dueDate', e.target.value || undefined)}
                  variant="default"
                  colorScheme="primary"
                  size="md"
                  icon="calendar"
                  helperText="Leave empty for no due date"
                />
                {errors.dueDate && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <span className="text-red-500">⚠️</span>
                    {errors.dueDate}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Advanced Settings */}
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-blue-200 shadow-md hover:shadow-lg transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-blue-600" />
                      Allow Late Submissions
                    </label>
                    <p className="text-sm text-gray-600">Allow students to submit after due date</p>
                  </div>
                  <Switch
                    checked={formData.allowLateSubmission}
                    onCheckedChange={(checked) => handleInputChange('allowLateSubmission', checked)}
                    className="data-[state=checked]:bg-blue-600 data-[state=unchecked]:bg-gray-300"
                  />
                </div>
              </div>

              {formData.allowLateSubmission && (
                <div>
                  <AttractiveInput
                    id="latePenalty"
                    label="Late Penalty (%)"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.latePenaltyPercentage || 0}
                    onChange={(e) => handleInputChange('latePenaltyPercentage', parseInt(e.target.value) || 0)}
                    placeholder="Enter late penalty percentage"
                    variant="default"
                    colorScheme="primary"
                    size="md"
                    icon="clock"
                    helperText="Percentage penalty for late submissions"
                  />
                  {errors.latePenaltyPercentage && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <span className="text-red-500">⚠️</span>
                      {errors.latePenaltyPercentage}
                    </p>
                  )}
                </div>
              )}

              <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-green-200 shadow-md hover:shadow-lg transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                      <Users className="w-4 h-4 text-green-600" />
                      Group Assignment
                    </label>
                    <p className="text-sm text-gray-600">Allow students to work in groups</p>
                  </div>
                  <Switch
                    checked={formData.isGroupAssignment}
                    onCheckedChange={(checked) => handleInputChange('isGroupAssignment', checked)}
                    className="data-[state=checked]:bg-green-600 data-[state=unchecked]:bg-gray-300"
                  />
                </div>
              </div>

              {formData.isGroupAssignment && (
                <div>
                  <AttractiveInput
                    id="maxGroupSize"
                    label="Max Group Size"
                    type="number"
                    min="2"
                    max="20"
                    value={formData.maxGroupSize || 2}
                    onChange={(e) => handleInputChange('maxGroupSize', parseInt(e.target.value) || 2)}
                    placeholder="Enter maximum group size"
                    variant="default"
                    colorScheme="primary"
                    size="md"
                    icon="users"
                    helperText="Maximum number of students per group"
                  />
                  {errors.maxGroupSize && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <span className="text-red-500">⚠️</span>
                      {errors.maxGroupSize}
                    </p>
                  )}
                </div>
              )}

              <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-purple-200 shadow-md hover:shadow-lg transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                      <Target className="w-4 h-4 text-purple-600" />
                      Auto Grade
                    </label>
                    <p className="text-sm text-gray-600">Automatically grade quiz assignments</p>
                  </div>
                  <Switch
                    checked={formData.autoGrade}
                    onCheckedChange={(checked) => handleInputChange('autoGrade', checked)}
                    className="data-[state=checked]:bg-purple-600 data-[state=unchecked]:bg-gray-300"
                  />
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-orange-200 shadow-md hover:shadow-lg transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-orange-600" />
                      Show Correct Answers
                    </label>
                    <p className="text-sm text-gray-600">Show correct answers after submission</p>
                  </div>
                  <Switch
                    checked={formData.showCorrectAnswers}
                    onCheckedChange={(checked) => handleInputChange('showCorrectAnswers', checked)}
                    className="data-[state=checked]:bg-orange-600 data-[state=unchecked]:bg-gray-300"
                  />
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-indigo-200 shadow-md hover:shadow-lg transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                      <LuFile className="w-4 h-4 text-indigo-600" />
                      Allow Review
                    </label>
                    <p className="text-sm text-gray-600">Allow students to review their submissions</p>
                  </div>
                  <Switch
                    checked={formData.allowReview}
                    onCheckedChange={(checked) => handleInputChange('allowReview', checked)}
                    className="data-[state=checked]:bg-indigo-600 data-[state=unchecked]:bg-gray-300"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* LuFile Upload Settings */}
          {formData.type === 'file_upload' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">LuFile Upload Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <AttractiveInput
                    id="allowedFileTypes"
                    label="Allowed LuFile Types"
                    value={formData.allowedFileTypes?.join(', ') || ''}
                    onChange={(e) => handleInputChange('allowedFileTypes', e.target.value.split(',').map(t => t.trim()).filter(t => t))}
                    placeholder="e.g., .pdf, .doc, .docx, .jpg, .png"
                    variant="default"
                    colorScheme="primary"
                    size="md"
                    icon="file"
                    helperText="Comma-separated list of allowed file extensions"
                  />
                  <div>
                    <AttractiveInput
                      id="maxFileSize"
                      label="Max LuFile Size (MB)"
                      type="number"
                      min="1"
                      max="1000"
                      value={formData.maxFileSize || 10}
                      onChange={(e) => handleInputChange('maxFileSize', parseInt(e.target.value) || 10)}
                      placeholder="Enter maximum file size"
                      variant="default"
                      colorScheme="primary"
                      size="md"
                      icon="file"
                      helperText="Maximum file size in megabytes"
                    />
                    {errors.maxFileSize && (
                      <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                        <span className="text-red-500">⚠️</span>
                        {errors.maxFileSize}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Quiz Time Limit */}
          {formData.type === 'quiz' && (
            <div className="space-y-6">
              <div>
                <AttractiveInput
                  id="timeLimit"
                  label="Time Limit (minutes)"
                  type="number"
                  min="1"
                  max="1440"
                  value={formData.timeLimit || ''}
                  onChange={(e) => handleInputChange('timeLimit', parseInt(e.target.value) || undefined)}
                  placeholder="Enter time limit in minutes"
                  variant="default"
                  colorScheme="primary"
                  size="md"
                  icon="clock"
                  helperText="Leave empty for no time limit"
                />
                {errors.timeLimit && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <span className="text-red-500">⚠️</span>
                    {errors.timeLimit}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Rubric */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Grading Rubric</h3>
              <Badge variant="outline">
                {rubric.reduce((sum, item) => sum + item.marks, 0)} / {formData.totalMarks} marks
              </Badge>
            </div>
            {errors.rubric && (
              <p className="text-red-500 text-sm flex items-center gap-1">
                <span className="text-red-500">⚠️</span>
                {errors.rubric}
              </p>
            )}

            {rubric.length > 0 && (
              <div className="space-y-2">
                {rubric.map((item, index) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="font-medium">{item.criteria}</div>
                          {item.description && (
                            <div className="text-sm text-gray-500">{item.description}</div>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">{item.marks} marks</Badge>
                          <button
                            type="button"
                            onClick={() => removeRubricItem(index)}
                            className="p-1 hover:bg-gray-100 rounded"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Add Rubric Item</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <AttractiveInput
                    id="criteria"
                    label="Criteria"
                    value={newRubricItem.criteria}
                    onChange={(e) => setNewRubricItem(prev => ({ ...prev, criteria: e.target.value }))}
                    placeholder="e.g., Content Quality, Grammar, Structure"
                    variant="default"
                    colorScheme="primary"
                    size="md"
                    icon="target"
                    helperText="What aspect will be graded"
                  />
                  <AttractiveInput
                    id="marks"
                    label="Marks"
                    type="number"
                    min="0"
                    max={formData.totalMarks}
                    value={newRubricItem.marks}
                    onChange={(e) => setNewRubricItem(prev => ({ ...prev, marks: parseInt(e.target.value) || 0 }))}
                    placeholder="Enter marks"
                    variant="default"
                    colorScheme="primary"
                    size="md"
                    icon="target"
                    helperText="Points for this criteria"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-foreground mb-2">Description</label>
                  <CustomEditor
                    value={newRubricItem.description}
                    onChange={(data) => setNewRubricItem(prev => ({ ...prev, description: data }))}
                    placeholder="Brief description of the criteria"
                  />
                  <p className="text-xs text-gray-500">Detailed description of the criteria</p>
                </div>
                <button
                  type="button"
                  onClick={addRubricItem}
                  disabled={!newRubricItem.criteria || newRubricItem.marks <= 0}
                  className="w-full p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Rubric Item
                </button>
              </CardContent>
            </Card>
          </div>

    </FormModal>
  );
}

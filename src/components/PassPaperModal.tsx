'use client';

import { useState, useEffect, FormEvent } from 'react';
import FormModal from '@/components/ui/form-modal';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { AttractiveInput } from '@/components/ui/attractive-input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import CustomEditor from '@/components/custom-editor';
import { Badge } from '@/components/ui/badge';
import PDFUpload from '@/components/PDFUpload';
import { LuFileText as LuFileText, LuCalendar as Calendar, LuBookOpen as BookOpen, LuAward as Award, LuUsers as Users, LuTag as Tag, LuTriangleAlert as AlertCircle, LuCheck as CheckCircle, LuX as X } from 'react-icons/lu';;
import { PassPaper, CreatePassPaperDto, UpdatePassPaperDto } from '@/types/pass-paper';

interface PassPaperModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  passPaper?: PassPaper | null;
}

export default function PassPaperModal({ open, onClose, onSuccess, passPaper }: PassPaperModalProps) {
  const isEdit = !!passPaper;
  
  // Form data state
  const [formData, setFormData] = useState<CreatePassPaperDto>({
    course: 'none',
    sessionName: '',
    year: new Date().getFullYear(),
    subject: '',
    examType: '',
    questionPaperUrl: '',
    marksPdfUrl: '',
    workSolutionUrl: '',
    description: '',
    tags: '',
    isActive: true
  });

  // Courses state
  const [courses, setCourses] = useState<Array<{ _id: string; title: string }>>([]);
  const [coursesLoading, setCoursesLoading] = useState(false);

  // File upload states
  const [questionPaperFile, setQuestionPaperFile] = useState<File | null>(null);
  const [marksPdfFile, setMarksPdfFile] = useState<File | null>(null);
  const [workSolutionFile, setWorkSolutionFile] = useState<File | null>(null);

  // UI states
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<Record<string, 'idle' | 'uploading' | 'success' | 'error'>>({
    questionPaper: 'idle',
    marksPdf: 'idle',
    workSolution: 'idle'
  });

  // Initialize form data
  useEffect(() => {
    if (isEdit && passPaper) {
      setFormData({
        course: (passPaper as any).course?._id || (passPaper as any).course || 'none',
        sessionName: passPaper.sessionName,
        year: passPaper.year,
        subject: passPaper.subject,
        examType: passPaper.examType,
        questionPaperUrl: passPaper.questionPaperUrl || '',
        marksPdfUrl: passPaper.marksPdfUrl || '',
        workSolutionUrl: passPaper.workSolutionUrl || '',
        description: passPaper.description || '',
        tags: passPaper.tags || '',
        isActive: passPaper.isActive ?? true
      });
    } else {
      setFormData({
        course: 'none',
        sessionName: '',
        year: new Date().getFullYear(),
        subject: '',
        examType: '',
        questionPaperUrl: '',
        marksPdfUrl: '',
        workSolutionUrl: '',
        description: '',
        tags: '',
        isActive: true
      });
    }
  }, [isEdit, passPaper]);

  // Fetch courses when modal opens
  useEffect(() => {
    const loadCourses = async () => {
      try {
        setCoursesLoading(true);
        const resp = await fetch('/api/courses', {
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        });
        if (resp.ok) {
          const data = await resp.json();
          const list = data.data?.courses || data.courses || data.data || [];
          const normalized = list.map((c: any) => ({ _id: c._id || c.id, title: c.title || c.name || 'Untitled Course' }))
            .filter((c: any) => c._id);
          setCourses(normalized);
        } else {
          console.error('Failed to fetch courses');
        }
      } catch (e) {
        console.error('Error fetching courses:', e);
      } finally {
        setCoursesLoading(false);
      }
    };
    if (open) {
      loadCourses();
    }
  }, [open]);

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      setFormData({
        sessionName: '',
        year: new Date().getFullYear(),
        subject: '',
        examType: '',
        questionPaperUrl: '',
        marksPdfUrl: '',
        workSolutionUrl: '',
        description: '',
        tags: '',
        isActive: true
      });
      setErrors({});
      setQuestionPaperFile(null);
      setMarksPdfFile(null);
      setWorkSolutionFile(null);
      setUploadProgress(0);
      setUploadStatus({
        questionPaper: 'idle',
        marksPdf: 'idle',
        workSolution: 'idle'
      });
    }
  }, [open]);

  // Handle input changes
  const handleInputChange = (field: keyof CreatePassPaperDto, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Handle file uploads
  const handleFileUpload = async (file: File, type: 'questionPaper' | 'marksPdf' | 'workSolution') => {
    try {
      setUploadStatus(prev => ({ ...prev, [type]: 'uploading' }));
      
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);
      uploadFormData.append('folder', `lms/pass-papers/${type.replace(/([A-Z])/g, '-$1').toLowerCase()}`);
      uploadFormData.append('description', `${type} - ${formData.sessionName} ${formData.year} ${formData.subject}`);

      const response = await fetch('/api/upload/pdf', {
        method: 'POST',
        body: uploadFormData
      });

      const result = await response.json();

      if (result.success && result.pdf) {
        const urlField = `${type}Url` as keyof CreatePassPaperDto;
        handleInputChange(urlField, result.pdf.url);
        setUploadStatus(prev => ({ ...prev, [type]: 'success' }));
      } else {
        throw new Error(result.error || 'Upload failed');
      }
    } catch (error) {
      console.error(`Upload error for ${type}:`, error);
      setUploadStatus(prev => ({ ...prev, [type]: 'error' }));
    }
  };

  // Handle file selection
  const handleFileSelect = (file: File, type: 'questionPaper' | 'marksPdf' | 'workSolution') => {
    if (file.type !== 'application/pdf') {
      setErrors(prev => ({ ...prev, [type]: 'Please select a PDF file' }));
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      setErrors(prev => ({ ...prev, [type]: 'File size must be less than 10MB' }));
      return;
    }

    setErrors(prev => ({ ...prev, [type]: '' }));
    
    if (type === 'questionPaper') setQuestionPaperFile(file);
    if (type === 'marksPdf') setMarksPdfFile(file);
    if (type === 'workSolution') setWorkSolutionFile(file);

    handleFileUpload(file, type);
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.course || formData.course === 'none') {
      newErrors.course = 'Course is required';
    }

    if (!formData.sessionName.trim()) {
      newErrors.sessionName = 'Session name is required';
    }

    if (!formData.year || formData.year < 1900 || formData.year > new Date().getFullYear() + 1) {
      newErrors.year = 'Year must be between 1900 and next year';
    }

    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required';
    }

    if (!formData.examType.trim()) {
      newErrors.examType = 'Exam type is required';
    }

    // All PDFs are optional - no validation needed

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setLoading(true);

      const url = isEdit ? `/api/pass-papers/${passPaper._id}` : '/api/pass-papers';
      const method = isEdit ? 'PUT' : 'POST';

      console.log('Submitting pass paper:', formData);

      // Convert 'none' to undefined for API
      const payload = { ...formData, course: formData.course === 'none' ? undefined : formData.course } as any;

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = 'Failed to save pass paper';
        
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorMessage;
        } catch {
          errorMessage = errorText || errorMessage;
        }
        
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log('Pass paper saved successfully:', result);
      onSuccess();
    } catch (error) {
      console.error('Error saving pass paper:', error);
      setErrors({ submit: error instanceof Error ? error.message : 'Failed to save pass paper' });
    } finally {
      setLoading(false);
    }
  };

  // Get upload status icon
  const getUploadStatusIcon = (type: 'questionPaper' | 'marksPdf' | 'workSolution') => {
    const status = uploadStatus[type];
    switch (status) {
      case 'uploading':
        return <div className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#7B2CBF' }} />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <X className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <FormModal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit Pass Paper' : 'Add New Pass Paper'}
      description={isEdit ? 'Update pass paper information and files' : 'Create a new pass paper with question papers, marks PDFs, and work solutions'}
      onSubmit={handleSubmit}
      loading={loading}
      size="lg"
      formId="pass-paper-form"
      submitText={isEdit ? 'Update Pass Paper' : 'Create Pass Paper'}
    >
      <div className="space-y-6 max-h-96 overflow-y-auto">
        {/* Basic LuInformation */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <LuFileText className="w-5 h-5" style={{ color: '#7B2CBF' }} />
            Basic LuInformation
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Course Select */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-900">Course</label>
            <Select value={formData.course} onValueChange={(v) => handleInputChange('course', v)}>
              <SelectTrigger className={`w-full border ${errors.course ? 'border-red-500' : 'border-gray-300'}`}>
                <SelectValue placeholder="Select a course" />
              </SelectTrigger>
              <SelectContent className="bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                <SelectItem value="none">Select a course</SelectItem>
                {coursesLoading && (
                  <SelectItem value="loading" disabled>Loading...</SelectItem>
                )}
                {!coursesLoading && courses.map((course) => (
                  <SelectItem key={course._id} value={course._id}>{course.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.course && (
              <p className="text-xs text-red-600 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.course}</p>
            )}
          </div>

            <AttractiveInput
              label="Session Name"
              icon={<Calendar className="w-4 h-4" />}
              placeholder="e.g., Spring 2024, Fall 2023"
              value={formData.sessionName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('sessionName', e.target.value)}
              error={errors.sessionName}
              variant="default"
              colorScheme="primary"
              size="md"
            />

            <AttractiveInput
              label="Year"
              icon={<Calendar className="w-4 h-4" />}
              type="number"
              placeholder="2024"
              value={formData.year}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('year', parseInt(e.target.value) || '')}
              error={errors.year}
              variant="default"
              colorScheme="primary"
              size="md"
            />

            <AttractiveInput
              label="Subject"
              icon={<BookOpen className="w-4 h-4" />}
              placeholder="e.g., Mathematics, Physics"
              value={formData.subject}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('subject', e.target.value)}
              error={errors.subject}
              variant="default"
              colorScheme="primary"
              size="md"
            />

            <AttractiveInput
              label="Exam Type"
              icon={<Award className="w-4 h-4" />}
              placeholder="e.g., Midterm, Final, Quiz"
              value={formData.examType}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('examType', e.target.value)}
              error={errors.examType}
              variant="default"
              colorScheme="primary"
              size="md"
            />
          </div>
        </div>

        {/* File Uploads */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-green-600" />
            Paper Files
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Question Paper */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                <LuFileText className="w-4 h-4 text-purple-600" />
                Question Paper
                {getUploadStatusIcon('questionPaper')}
              </label>
              <PDFUpload
                currentPDF={formData.questionPaperUrl}
                onPDFChange={(url) => handleInputChange('questionPaperUrl', url)}
                onPDFRemove={() => handleInputChange('questionPaperUrl', '')}
                onError={(error) => setErrors(prev => ({ ...prev, questionPaper: error }))}
                size="sm"
                folder="lms/pass-papers/question-papers"
                description={`Question paper - ${formData.sessionName} ${formData.year} ${formData.subject}`}
              />
              {errors.questionPaper && (
                <div className="flex items-center gap-2 text-xs text-red-600">
                  <AlertCircle className="w-3 h-3" />
                  {errors.questionPaper}
                </div>
              )}
            </div>

            {/* Marks PDF */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                <Award className="w-4 h-4 text-orange-600" />
                Marks PDF
                {getUploadStatusIcon('marksPdf')}
              </label>
              <PDFUpload
                currentPDF={formData.marksPdfUrl}
                onPDFChange={(url) => handleInputChange('marksPdfUrl', url)}
                onPDFRemove={() => handleInputChange('marksPdfUrl', '')}
                onError={(error) => setErrors(prev => ({ ...prev, marksPdf: error }))}
                size="sm"
                folder="lms/pass-papers/marks-pdfs"
                description={`Marks PDF - ${formData.sessionName} ${formData.year} ${formData.subject}`}
              />
              {errors.marksPdf && (
                <div className="flex items-center gap-2 text-xs text-red-600">
                  <AlertCircle className="w-3 h-3" />
                  {errors.marksPdf}
                </div>
              )}
            </div>

            {/* Work Solution */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                <Users className="w-4 h-4 text-indigo-600" />
                Work Solution
                {getUploadStatusIcon('workSolution')}
              </label>
              <PDFUpload
                currentPDF={formData.workSolutionUrl}
                onPDFChange={(url) => handleInputChange('workSolutionUrl', url)}
                onPDFRemove={() => handleInputChange('workSolutionUrl', '')}
                onError={(error) => setErrors(prev => ({ ...prev, workSolution: error }))}
                size="sm"
                folder="lms/pass-papers/work-solutions"
                description={`Work solution - ${formData.sessionName} ${formData.year} ${formData.subject}`}
              />
              {errors.workSolution && (
                <div className="flex items-center gap-2 text-xs text-red-600">
                  <AlertCircle className="w-3 h-3" />
                  {errors.workSolution}
                </div>
              )}
            </div>
          </div>

          {errors.papers && (
            <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 p-2 rounded-md">
              <AlertCircle className="w-3 h-3" />
              {errors.papers}
            </div>
          )}
        </div>

        {/* Additional LuInformation */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Tag className="w-5 h-5 text-gray-600" />
            Additional LuInformation
          </h3>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">Description</label>
              <CustomEditor
                value={formData.description}
                onChange={(data) => handleInputChange('description', data)}
                placeholder="Additional details about this pass paper..."
              />
            </div>

            <AttractiveInput
              label="Tags"
              icon={<Tag className="w-4 h-4" />}
              placeholder="e.g., math, midterm, spring2024 (comma-separated)"
              value={formData.tags}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('tags', e.target.value)}
              variant="default"
              colorScheme="primary"
              size="md"
            />

            {/* Status */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => handleInputChange('isActive', e.target.checked)}
                className="w-4 h-4 bg-gray-100 border-gray-300 rounded"
                style={{
                  accentColor: '#7B2CBF',
                }}
              />
              <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                Active (visible to students)
              </label>
            </div>
          </div>
        </div>

        {/* Submit Error */}
        {errors.submit && (
          <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-md">
            <AlertCircle className="w-4 h-4" />
            {errors.submit}
          </div>
        )}
      </div>
    </FormModal>
  );
}

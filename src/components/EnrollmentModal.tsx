import React, { useState, useEffect, useRef } from 'react';
import FormModal from '@/components/ui/form-modal';
import { AttractiveInput } from '@/components/ui/attractive-input';
import { AttractiveTextarea } from '@/components/ui/attractive-textarea';
import { Button } from '@/components/ui/button';
import { Enrollment, CreateEnrollmentRequest, UpdateEnrollmentRequest } from '@/types/enrollment';
import { LuUser as User, LuBookOpen as BookOpen, LuDollarSign as DollarSign, LuCreditCard, LuAward as Award, LuDownload as Download, LuTrendingUp as TrendingUp } from 'react-icons/lu';;

interface EnrollmentModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  enrollment?: Enrollment | null;
  createEnrollment?: (data: CreateEnrollmentRequest) => Promise<Enrollment | null>;
  updateEnrollment?: (id: string, data: UpdateEnrollmentRequest) => Promise<Enrollment | null>;
}

const EnrollmentModal: React.FC<EnrollmentModalProps> = ({
  open,
  onClose,
  onSuccess,
  enrollment,
  createEnrollment,
  updateEnrollment
}) => {
  const [formData, setFormData] = useState({
    student: '',
    course: '',
    status: 'active' as 'active' | 'completed' | 'dropped' | 'suspended',
    progress: 0,
    paymentStatus: 'pending' as 'pending' | 'paid' | 'refunded' | 'failed',
    paymentAmount: '',
    paymentMethod: '',
    paymentId: '',
    notes: ''
  });

  const [students, setStudents] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<any[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<any[]>([]);
  const [showStudentDropdown, setShowStudentDropdown] = useState(false);
  const [showCourseDropdown, setShowCourseDropdown] = useState(false);
  const [studentSearch, setStudentSearch] = useState('');
  const [courseSearch, setCourseSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [issuingCertificate, setIssuingCertificate] = useState(false);
  const [certificateIssueError, setCertificateIssueError] = useState<string | null>(null);
  const [certificateInfo, setCertificateInfo] = useState<{
    issued: boolean;
    url: string;
    issuedAt: string | null;
  }>({
    issued: false,
    url: '',
    issuedAt: null,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const studentDropdownRef = useRef<HTMLDivElement>(null);
  const courseDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      fetchStudents();
      fetchCourses();
    }
  }, [open]);

  useEffect(() => {
    if (enrollment) {
      setFormData({
        student: enrollment.student,
        course: enrollment.course,
        status: enrollment.status,
        progress: enrollment.progress,
        paymentStatus: enrollment.paymentStatus,
        paymentAmount: enrollment.paymentAmount?.toString() || '',
        paymentMethod: enrollment.paymentMethod || '',
        paymentId: enrollment.paymentId || '',
        notes: enrollment.notes || ''
      });
      setCertificateInfo({
        issued: Boolean(enrollment.certificateIssued) || Boolean(enrollment.certificateUrl),
        url: enrollment.certificateUrl || '',
        issuedAt: enrollment.certificateIssuedAt || null,
      });
      setCertificateIssueError(null);
      // Set the student search display name
      if (enrollment.studentInfo?.firstName && enrollment.studentInfo?.lastName) {
        setStudentSearch(`${enrollment.studentInfo.firstName} ${enrollment.studentInfo.lastName}`);
      }
      // Set the course search display name
      if (enrollment.courseInfo?.title) {
        setCourseSearch(enrollment.courseInfo.title);
      }
    } else {
      setFormData({
        student: '',
        course: '',
        status: 'active',
        progress: 0,
        paymentStatus: 'pending',
        paymentAmount: '',
        paymentMethod: '',
        paymentId: '',
        notes: ''
      });
      setCertificateInfo({
        issued: false,
        url: '',
        issuedAt: null,
      });
      setCertificateIssueError(null);
      setStudentSearch('');
      setCourseSearch('');
    }
    setErrors({});
  }, [enrollment, open]);

  const fetchStudents = async () => {
    try {
      const response = await fetch('/api/users?role=student');
      const data = await response.json();
      if (response.ok) {
        setStudents(data.users || []);
        setFilteredStudents(data.users || []);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await fetch('/api/courses');
      const data = await response.json();
      if (response.ok) {
        setCourses(data.data?.courses || []);
        setFilteredCourses(data.data?.courses || []);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const handleStudentSearch = (searchTerm: string) => {
    setStudentSearch(searchTerm);
    if (searchTerm.trim() === '') {
      setFilteredStudents(students);
    } else {
      const filtered = students.filter(student =>
        student.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredStudents(filtered);
    }
  };

  const handleCourseSearch = (searchTerm: string) => {
    setCourseSearch(searchTerm);
    if (searchTerm.trim() === '') {
      setFilteredCourses(courses);
    } else {
      const filtered = courses.filter(course =>
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.category?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCourses(filtered);
    }
  };

  const handleStudentSelect = (student: any) => {
    setFormData(prev => ({ ...prev, student: student._id }));
    setStudentSearch(`${student.firstName} ${student.lastName}`);
    setShowStudentDropdown(false);
  };

  const handleCourseSelect = (course: any) => {
    setFormData(prev => ({ ...prev, course: course._id }));
    setCourseSearch(course.title);
    setShowCourseDropdown(false);
  };

  // Handle click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (studentDropdownRef.current && !studentDropdownRef.current.contains(event.target as Node)) {
        setShowStudentDropdown(false);
      }
      if (courseDropdownRef.current && !courseDropdownRef.current.contains(event.target as Node)) {
        setShowCourseDropdown(false);
      }
    };

    if (showStudentDropdown || showCourseDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showStudentDropdown, showCourseDropdown]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.student) {
      newErrors.student = 'Student is required';
    }

    if (!formData.course) {
      newErrors.course = 'Course is required';
    }

    if (formData.progress < 0 || formData.progress > 100) {
      newErrors.progress = 'Progress must be between 0 and 100';
    }

    if (formData.paymentAmount && isNaN(Number(formData.paymentAmount))) {
      newErrors.paymentAmount = 'Payment amount must be a valid number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);

    try {
      const enrollmentData = {
        ...formData,
        paymentAmount: formData.paymentAmount ? Number(formData.paymentAmount) : undefined
      };

      if (enrollment && updateEnrollment) {
        await updateEnrollment(enrollment._id, enrollmentData);
      } else if (createEnrollment) {
        await createEnrollment(enrollmentData);
      }

      onSuccess();
    } catch (error) {
      console.error('Error saving enrollment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleGenerateCertificate = async () => {
    if (!enrollment?._id) return;

    setIssuingCertificate(true);
    setCertificateIssueError(null);
    try {
      const response = await fetch(`/api/enrollments/${enrollment._id}/certificate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await response.json();
      console.log("data",data);

      if (!response.ok || !data?.success) {
        throw new Error(data?.error || 'Failed to generate certificate');
      }

      setCertificateInfo({
        issued: true,
        url: data?.data?.certificateUrl || '',
        issuedAt: data?.data?.certificateIssuedAt || new Date().toISOString(),
      });
    } catch (error: any) {
      setCertificateIssueError(error?.message || 'Failed to generate certificate');
    } finally {
      setIssuingCertificate(false);
    }
  };

  return (
    <FormModal
      open={open}
      onClose={onClose}
      onSubmit={handleSubmit}
      title={enrollment ? 'Edit Enrollment' : 'Add New Enrollment'}
      size="xl"
      formId="enrollment-form"
      submitText={enrollment ? 'Update Enrollment' : 'Create Enrollment'}
      loading={submitting}
    >
      <div className="space-y-6">
        {/* Student and Course Selection */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Student Selection */}
          <div className="relative" ref={studentDropdownRef}>
            <label className="block text-sm font-semibold text-foreground mb-2">
              Student *
            </label>
            <AttractiveInput
              value={studentSearch}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                handleStudentSearch(e.target.value);
                setShowStudentDropdown(true);
              }}
              onFocus={() => setShowStudentDropdown(true)}
              placeholder="Search students..."
              icon={<User className="w-5 h-5" />}
              rightAddon={studentSearch ? (
                <button
                  type="button"
                  onClick={() => {
                    setStudentSearch('');
                    setFormData(prev => ({ ...prev, student: '' }));
                    setShowStudentDropdown(false);
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              ) : undefined}
              error={errors.student}
              colorScheme="primary"
              size="md"
            />
            
            {/* Student Dropdown */}
            {showStudentDropdown && (
              <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {filteredStudents.length > 0 ? (
                  filteredStudents.map((student) => (
                    <button
                      key={student._id}
                      type="button"
                      onClick={() => handleStudentSelect(student)}
                      className="w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 focus:bg-gray-100 dark:focus:bg-gray-700 focus:outline-none border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                    >
                      <div className="font-medium text-gray-900 dark:text-gray-100">
                        {student.firstName} {student.lastName}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {student.email}
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="px-4 py-3 text-gray-500 dark:text-gray-400 text-center">
                    No students found
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Course Selection */}
          <div className="relative" ref={courseDropdownRef}>
            <label className="block text-sm font-semibold text-foreground mb-2">
              Course *
            </label>
            <AttractiveInput
              value={courseSearch}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                handleCourseSearch(e.target.value);
                setShowCourseDropdown(true);
              }}
              onFocus={() => setShowCourseDropdown(true)}
              placeholder="Search courses..."
              icon={<BookOpen className="w-5 h-5" />}
              rightAddon={courseSearch ? (
                <button
                  type="button"
                  onClick={() => {
                    setCourseSearch('');
                    setFormData(prev => ({ ...prev, course: '' }));
                    setShowCourseDropdown(false);
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              ) : undefined}
              error={errors.course}
              colorScheme="primary"
              size="md"
            />
            
            {/* Course Dropdown */}
            {showCourseDropdown && (
              <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {filteredCourses.length > 0 ? (
                  filteredCourses.map((course) => (
                    <button
                      key={course._id}
                      type="button"
                      onClick={() => handleCourseSelect(course)}
                      className="w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 focus:bg-gray-100 dark:focus:bg-gray-700 focus:outline-none border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                    >
                      <div className="font-medium text-gray-900 dark:text-gray-100">
                        {course.title}
                      </div>
                      {course.category && (
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {course.category}
                        </div>
                      )}
                    </button>
                  ))
                ) : (
                  <div className="px-4 py-3 text-gray-500 dark:text-gray-400 text-center">
                    No courses found
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Status and Progress */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => handleInputChange('status', e.target.value)}
              className="w-full px-4 py-3 text-foreground placeholder-muted-foreground bg-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary focus:bg-background transition-all duration-200 hover:border-primary/50"
            >
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="dropped">Dropped</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              Progress (%)
            </label>
            <AttractiveInput
              type="number"
              min="0"
              max="100"
              value={formData.progress}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('progress', parseInt(e.target.value) || 0)}
              placeholder="0"
              icon={<TrendingUp className="w-5 h-5" />}
              error={errors.progress}
              colorScheme="primary"
              size="md"
            />
          </div>
        </div>

        {/* Payment LuInformation */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">
            Payment LuInformation
          </h3>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                Payment Status
              </label>
              <select
                value={formData.paymentStatus}
                onChange={(e) => handleInputChange('paymentStatus', e.target.value)}
                className="w-full px-4 py-3 text-foreground placeholder-muted-foreground bg-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary focus:bg-background transition-all duration-200 hover:border-primary/50"
              >
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="refunded">Refunded</option>
                <option value="failed">Failed</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                Payment Amount
              </label>
              <AttractiveInput
                type="number"
                step="0.01"
                min="0"
                value={formData.paymentAmount}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('paymentAmount', e.target.value)}
                placeholder="0.00"
                icon={<DollarSign className="w-5 h-5" />}
                error={errors.paymentAmount}
                colorScheme="primary"
                size="md"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                Payment Method
              </label>
              <AttractiveInput
                value={formData.paymentMethod}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('paymentMethod', e.target.value)}
                placeholder="Credit Card, PayPal, etc."
                icon={<LuCreditCard className="w-5 h-5" />}
                colorScheme="primary"
                size="md"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                Payment ID
              </label>
              <AttractiveInput
                value={formData.paymentId}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('paymentId', e.target.value)}
                placeholder="Transaction ID"
                icon={<LuCreditCard className="w-5 h-5" />}
                colorScheme="primary"
                size="md"
              />
            </div>
          </div>
        </div>

        {/* Certificate */}
        {enrollment && (
          <div className="space-y-4 rounded-2xl border border-purple-200 bg-purple-50 p-3 sm:p-4">
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-foreground">Certificate</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Click once to auto-generate the certificate PDF for this student.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
              <Button
                type="button"
                onClick={handleGenerateCertificate}
                disabled={issuingCertificate}
                className="w-full flex items-center justify-center gap-2"
              >
                <Award className="w-4 h-4" />
                {issuingCertificate ? 'Generating PDF...' : 'Generate Certificate PDF'}
              </Button>

              {certificateInfo.url && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => window.open(certificateInfo.url, '_blank', 'noopener,noreferrer')}
                  className="w-full flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Open PDF
                </Button>
              )}
            </div>

            {certificateInfo.issuedAt && (
              <div className="text-xs text-muted-foreground">
                Issued at: {new Date(certificateInfo.issuedAt).toLocaleString()}
              </div>
            )}

            {certificateIssueError && (
              <div className="text-xs text-red-600">
                {certificateIssueError}
              </div>
            )}
          </div>
        )}

        {/* Notes */}
        <div>
          <label className="block text-sm font-semibold text-foreground mb-2">
            Notes
          </label>
          <AttractiveTextarea
            value={formData.notes}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange('notes', e.target.value)}
            placeholder="Additional notes about this enrollment..."
            colorScheme="primary"
            size="md"
            rows={3}
          />
        </div>


      </div>
    </FormModal>
  );
};

export default EnrollmentModal;

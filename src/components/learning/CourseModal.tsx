'use client';

import { useState, useEffect } from 'react';
import { Course, CreateCourseRequest, UpdateCourseRequest } from '@/types/course';
import { CourseCategory } from '@/types/course-category';
import { Input } from '@/components/ui/input';
import FormModal from '@/components/ui/form-modal';
import { Checkbox } from '@/components/ui/checkbox';
import { AttractiveInput } from '@/components/ui/attractive-input';
import { InstructorSelector } from '@/components/ui/instructor-selector';
import CustomEditor from '@/components/custom-editor';
import { LuDollarSign as DollarSign, LuTag as Tag, LuImage as Image, LuBookOpen as BookOpen, LuLoader as Loader2, LuChevronDown as ChevronDown, LuUser as User, LuSearch as Search, LuX as X } from 'react-icons/lu';;
import { useTeachers } from '@/hooks/useTeachers';
import { htmlToPlainText } from '@/lib/utils';

interface CourseModalProps {
  open: boolean;
  course?: Course | null;
  onClose: () => void;
  onSuccess: () => void;
  showInstructorField?: boolean;
}

export default function CourseModal({
  open,
  course,
  onClose,
  onSuccess,
  showInstructorField = true
}: CourseModalProps) {
  const [formData, setFormData] = useState<CreateCourseRequest>({
    title: '',
    shortDescription: '',
    category: '',
    thumbnailUrl: '',
    isPaid: false,
    status: 'draft',
    price: undefined,
    salePrice: undefined,
    instructor: undefined
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [categories, setCategories] = useState<CourseCategory[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showInstructorDropdown, setShowInstructorDropdown] = useState(false);
  const [instructorSearch, setInstructorSearch] = useState('');
  const { teachers, loading: loadingTeachers } = useTeachers();

  // Filter teachers based on search
  const filteredTeachers = teachers.filter(teacher =>
    teacher.firstName.toLowerCase().includes(instructorSearch.toLowerCase()) ||
    teacher.lastName.toLowerCase().includes(instructorSearch.toLowerCase()) ||
    teacher.email.toLowerCase().includes(instructorSearch.toLowerCase())
  );

  const fetchCategories = async () => {
    try {
      setLoadingCategories(true);
      const response = await fetch('/api/categories?limit=100');
      const data = await response.json();
      
      if (response.ok) {
        setCategories(data.data.categories || []);
      } else {
        console.error('Failed to fetch categories:', data.error);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoadingCategories(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchCategories();
    }
  }, [open]);

  useEffect(() => {
    if (course) {
      setFormData({
        title: course.title,
        shortDescription: (course as Course & { shortDescription?: string }).shortDescription || '',
        category: course.category || '',
        thumbnailUrl: course.thumbnailUrl || '',
        isPaid: course.isPaid,
        status: course.status,
        price: course.price,
        salePrice: course.salePrice,
        instructor: typeof course.instructor === 'string' ? course.instructor : course.instructor?._id
      });
    } else {
      setFormData({
        title: '',
        shortDescription: '',
        category: '',
        thumbnailUrl: '',
        isPaid: false,
        status: 'draft',
        price: undefined,
        salePrice: undefined,
        instructor: undefined
      });
    }
    setErrors({});
  }, [course, open]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    const plainShortDescription = (formData.shortDescription || '')
      .replace(/<[^>]*>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    if (!formData.title.trim()) {
      newErrors.title = 'Course title is required';
    }

    if (formData.isPaid && (!formData.price || formData.price <= 0)) {
      newErrors.price = 'Paid courses must have a valid price';
    }

    if (formData.salePrice && formData.price && formData.salePrice >= formData.price) {
      newErrors.salePrice = 'Sale price must be less than regular price';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const url = course ? `/api/courses/${course._id}` : '/api/courses';
      const method = course ? 'PUT' : 'POST';
      const plainShortDescription = (formData.shortDescription || '')
        .replace(/<[^>]*>/g, ' ')
        .replace(/&nbsp;/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      const payload = {
        ...formData,
        shortDescription: plainShortDescription,
      };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        console.log(course ? 'Course updated successfully' : 'Course created successfully');
        onSuccess();
      } else {
        console.error('Failed to save course:', data.error);
        setErrors({ submit: data.error || 'Failed to save course' });
      }
    } catch (error) {
      console.error('Error saving course:', error);
      setErrors({ submit: 'An error occurred while saving the course' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof CreateCourseRequest, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handlePaidToggle = (checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      isPaid: checked,
      price: checked ? prev.price || 0 : undefined,
      salePrice: checked ? prev.salePrice : undefined
    }));
  };

  return (
    <FormModal
      open={open}
      onClose={onClose}
      onSubmit={handleSubmit}
      title={course ? 'Edit Course' : 'Add New Course'}
      description={course ? 'Update course information and settings' : 'Create a new course for your students'}
      submitText={course ? 'Update Course' : 'Create Course'}
      loading={loading}
      size="lg"
      formId="course-form"
    >
      <AttractiveInput
        label="Course Title"
        icon={<BookOpen className="w-4 h-4" />}
        placeholder="Enter course title"
        value={formData.title}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('title', e.target.value)}
        error={errors.title}
        variant="default"
        colorScheme="primary"
        size="md"
        disabled={loading}
      />

      <div className="space-y-2">
        <label htmlFor="shortDescription" className="flex items-center gap-2 text-xs font-semibold text-gray-800">
          Short Description
        </label>
        <CustomEditor
          value={formData.shortDescription ?? ''}
          onChange={(data) => handleInputChange('shortDescription', data)}
          placeholder="Brief summary for cards and listings"
        />
        {errors.shortDescription && (
          <p className="text-xs text-red-600">{errors.shortDescription}</p>
        )}
      </div>

      {/* Category and Thumbnail */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Category */}
        <div className="space-y-2">
          <label htmlFor="category" className="flex items-center gap-2 text-xs font-semibold text-gray-800">
            <Tag className="w-3 h-3" style={{ color: '#7B2CBF' }} />
            Category
          </label>
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
              className="w-full h-9 px-3 py-2 text-sm border-2 border-gray-200 rounded-lg transition-all duration-200 focus:ring-2 hover:border-gray-300 flex items-center justify-between bg-white"
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#7B2CBF';
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(123, 44, 191, 0.1)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#e5e7eb';
                e.currentTarget.style.boxShadow = 'none';
              }}
              disabled={loading || loadingCategories}
            >
              <div className="flex items-center gap-2">
                {formData.category ? (
                  <>
                    <div 
                      className="w-4 h-4 rounded-full border border-gray-300"
                      style={{ 
                        backgroundColor: categories.find(c => c.name === formData.category)?.color || '#3B82F6' 
                      }}
                    ></div>
                    <span className="text-gray-900">{formData.category}</span>
                  </>
                ) : (
                  <span className="text-gray-500">Select a category</span>
                )}
              </div>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </button>
            
            {showCategoryDropdown && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                <div className="p-2">
                  <button
                    type="button"
                    onClick={() => {
                      handleInputChange('category', '');
                      setShowCategoryDropdown(false);
                    }}
                    className="w-full text-left px-3 py-2 text-sm text-gray-500 hover:bg-gray-100 rounded-md"
                  >
                    No category
                  </button>
                </div>
                {categories.map((category) => (
                  <div key={category._id} className="p-2">
                    <button
                      type="button"
                      onClick={() => {
                        handleInputChange('category', category.name);
                        setShowCategoryDropdown(false);
                      }}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded-md flex items-center gap-3"
                    >
                      <div 
                        className="w-4 h-4 rounded-full border border-gray-300"
                        style={{ backgroundColor: category.color || '#3B82F6' }}
                      ></div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{category.name}</div>
                        {category.description && (
                          <div className="text-xs text-gray-500">{htmlToPlainText(category.description)}</div>
                        )}
                      </div>
                      {category.icon && (
                        <span className="text-lg">{category.icon}</span>
                      )}
                    </button>
                  </div>
                ))}
                {loadingCategories && (
                  <div className="p-4 text-center text-sm text-gray-500">
                    <Loader2 className="w-4 h-4 animate-spin mx-auto mb-2" />
                    Loading categories...
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <AttractiveInput
          label="Thumbnail URL"
          icon={<Image className="w-4 h-4" />}
          type="url"
          placeholder="Enter thumbnail image URL"
          value={formData.thumbnailUrl}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('thumbnailUrl', e.target.value)}
          variant="default"
          colorScheme="primary"
          size="md"
          disabled={loading}
        />
      </div>

      {/* Instructor Selection */}
      {showInstructorField && (
        <InstructorSelector
          value={formData.instructor}
          onChange={(instructorId) => handleInputChange('instructor', instructorId)}
          label="Instructor"
          placeholder="Select an instructor"
          disabled={loading}
        />
      )}

      {/* Paid Course Toggle */}
      <div className="rounded-lg p-3" style={{
        background: "linear-gradient(135deg, rgba(123, 44, 191, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%)",
        border: '1px solid rgba(123, 44, 191, 0.2)',
      }}>
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Checkbox
              id="isPaid"
              checked={formData.isPaid}
              onCheckedChange={handlePaidToggle}
              className="w-4 h-4 border-2 data-[state=checked]:bg-[#7B2CBF] data-[state=checked]:border-[#7B2CBF]"
              style={{
                borderColor: '#7B2CBF',
              }}
              disabled={loading}
            />
          </div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md" style={{ backgroundColor: 'rgba(123, 44, 191, 0.1)' }}>
              <DollarSign className="w-3 h-3" style={{ color: '#7B2CBF' }} />
            </div>
            <div>
              <label htmlFor="isPaid" className="text-xs font-semibold text-gray-800 cursor-pointer">
                Paid Course
              </label>
              <p className="text-xs text-gray-600 mt-1">
                This course requires payment to access
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Price Fields - Only show if course is paid */}
      {formData.isPaid && (
        <div className="space-y-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
          <h4 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-green-600" />
            Pricing LuInformation
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AttractiveInput
              label="Regular Price"
              icon={<DollarSign className="w-4 h-4" />}
              type="number"
              min="0"
              step="0.01"
              value={formData.price || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('price', parseFloat(e.target.value) || 0)}
              placeholder="0.00"
              error={errors.price}
              variant="default"
              colorScheme="primary"
              size="md"
              disabled={loading}
            />

            <AttractiveInput
              label="Sale Price (Optional)"
              icon={<DollarSign className="w-4 h-4" />}
              type="number"
              min="0"
              step="0.01"
              value={formData.salePrice || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('salePrice', parseFloat(e.target.value) || undefined)}
              placeholder="0.00"
              error={errors.salePrice}
              variant="default"
              colorScheme="primary"
              size="md"
              disabled={loading}
              helperText={formData.salePrice && formData.price && formData.salePrice < formData.price ? 
                `Discount: ${Math.round(((formData.price - formData.salePrice) / formData.price) * 100)}% off` : undefined
              }
            />
          </div>
        </div>
      )}

      {/* Submit Error */}
      {errors.submit && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{errors.submit}</p>
        </div>
      )}
    </FormModal>
  );
}

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAppDispatch } from '@/lib/hooks';
import { Teacher, TeacherFormData, TeacherUpdateData } from '@/types/teacher';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import FormModal from '@/components/ui/form-modal';
import { AttractiveInput } from '@/components/ui/attractive-input';
import AvatarUpload from '@/components/AvatarUpload';
import { LuUser as User, LuPhone as Phone, LuUserCheck as UserCheck, LuLoader as Loader2, LuLock as Lock } from 'react-icons/lu';

interface TeacherModalProps {
  open: boolean;
  teacher?: Teacher | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function TeacherModal({ open, teacher, onClose, onSuccess }: TeacherModalProps) {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const [checkingPhone, setCheckingPhone] = useState(false);
  const isEdit = !!teacher;

  const [formData, setFormData] = useState<TeacherFormData>({
    phone: '',
    firstName: '',
    lastName: '',
    isActive: true,
    avatar: '',
    address: {
      fullAddress: ''
    },
    password: isEdit ? undefined : 'Teacher123!' // Default password for new teachers
  });
  const [errors, setErrors] = useState<Partial<TeacherFormData>>({});

  // Debounced phone check
  const debouncedPhoneCheck = useCallback(
    (() => {
      let timeoutId: NodeJS.Timeout;
      return (phone: string) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(async () => {
          if (phone && phone.trim()) {
            // Only check for new teachers or when phone is changed
            if (!isEdit || (isEdit && phone !== (teacher as any)?.phone)) {
              const phoneExists = await checkPhoneExists(phone);
              if (phoneExists) {
                setErrors(prev => ({ ...prev, phone: 'Phone number already exists' }));
              } else {
                setErrors(prev => ({ ...prev, phone: undefined }));
              }
            }
          }
        }, 500);
      };
    })(),
    [isEdit, (teacher as any)?.phone]
  );

  // Check if phone exists
  const checkPhoneExists = async (phone: string): Promise<boolean> => {
    if (!phone || !phone.trim()) {
      return false;
    }

    try {
      setCheckingPhone(true);
      const response = await fetch(`/api/users?phone=${encodeURIComponent(phone)}&checkExists=true`);
      const data = await response.json();
      return data.exists || false;
    } catch (error) {
      console.error('Error checking phone:', error);
      return false;
    } finally {
      setCheckingPhone(false);
    }
  };

  // Reset form when modal opens or teacher changes
  useEffect(() => {
    if (open) {
      if (teacher) {
        // Edit mode - populate form with teacher data
        setFormData({
          phone: (teacher as any).phone || '',
          firstName: teacher.firstName,
          lastName: teacher.lastName,
          isActive: teacher.isActive,
          avatar: teacher.avatar || '',
          address: teacher.address || {
            fullAddress: ''
          }
        });
      } else {
        // Create mode - reset form to default values
        setFormData({
          phone: '',
          firstName: '',
          lastName: '',
          isActive: true,
          avatar: '',
          address: {
            fullAddress: ''
          },
          password: 'Teacher123!' // Default password for new teachers
        });
      }
      // Clear any existing errors when modal opens
      setErrors({});
    }
  }, [open, teacher, isEdit]);

  const validateForm = async (): Promise<boolean> => {
    const newErrors: Partial<TeacherFormData> = {};

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else {
      // Basic phone number validation (allows various formats)
      const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
      const cleanPhone = formData.phone.replace(/[\s\-\(\)]/g, '');
      if (!phoneRegex.test(cleanPhone)) {
        newErrors.phone = 'Phone number is invalid';
      } else {
        if (!isEdit || (isEdit && formData.phone !== (teacher as any)?.phone)) {
          const phoneExists = await checkPhoneExists(formData.phone);
          if (phoneExists) {
            newErrors.phone = 'Phone number already exists';
          }
        }
      }
    }

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!isEdit && formData.password && formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!(await validateForm())) {
      return;
    }

    setLoading(true);

    try {
      const url = isEdit ? `/api/teachers/${teacher._id}` : '/api/teachers';
      const method = isEdit ? 'PUT' : 'POST';

      const payload = isEdit
        ? {
            phone: formData.phone,
            firstName: formData.firstName,
            lastName: formData.lastName,
            isActive: formData.isActive,
            avatar: formData.avatar,
            address: formData.address?.fullAddress ? { fullAddress: formData.address.fullAddress } : undefined
          } as TeacherUpdateData
        : {
            ...formData,
            address: formData.address?.fullAddress ? { fullAddress: formData.address.fullAddress } : undefined,
            password: formData.password || 'Teacher123!' // Default password for new teachers
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
        console.log(isEdit ? 'Teacher updated successfully' : 'Teacher created successfully');
        onSuccess();
      } else {
        console.error(`Failed to ${isEdit ? 'update' : 'create'} teacher:`, data.error);
      }
    } catch (error) {
      console.error('Error saving teacher:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof TeacherFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }

    // Check phone existence in real-time
    if (field === 'phone' && typeof value === 'string') {
      debouncedPhoneCheck(value);
    }
  };

  const handleAddressChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      address: {
        fullAddress: value
      }
    }));
    if (errors.address && errors.address?.fullAddress) {
      setErrors(prev => ({
        ...prev,
        address: {
          fullAddress: undefined
        }
      }));
    }
  };

  return (
    <FormModal
      open={open}
      onClose={onClose}
      onSubmit={handleSubmit}
      title={isEdit ? 'Edit Teacher' : 'Add New Teacher'}
      description={isEdit ? 'Update teacher information and settings' : 'Create a new teacher with address and password'}
      submitText={isEdit ? 'Update Teacher' : 'Create Teacher'}
      loading={loading}
      size="2xl"
      formId="teacher-form"
    >
        {/* Avatar Upload */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-xs font-semibold text-gray-800">
            <User className="w-3 h-3 text-blue-600" />
            Profile Picture
          </label>
          <div className="flex justify-center">
            <AvatarUpload
              currentAvatar={formData.avatar}
              onAvatarChange={(imageUrl, publicId) => {
                setFormData(prev => ({ ...prev, avatar: imageUrl }));
              }}
              onAvatarRemove={() => {
                setFormData(prev => ({ ...prev, avatar: '' }));
              }}
              size="md"
              disabled={loading}
            />
          </div>
        </div>

        <AttractiveInput
          label="Phone Number"
          icon={<Phone className="w-4 h-4" />}
          type="tel"
          placeholder="Enter teacher phone number"
          value={formData.phone}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('phone', e.target.value)}
          error={errors.phone}
          loading={checkingPhone}
          variant="default"
          colorScheme="primary"
          size="md"
        />

        {/* Name Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AttractiveInput
            label="First Name"
            icon={<User className="w-4 h-4" />}
            type="text"
            placeholder="Enter first name"
            value={formData.firstName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('firstName', e.target.value)}
            error={errors.firstName}
            variant="default"
            colorScheme="primary"
            size="md"
          />

          <AttractiveInput
            label="Last Name"
            icon={<User className="w-4 h-4" />}
            type="text"
            placeholder="Enter last name"
            value={formData.lastName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('lastName', e.target.value)}
            error={errors.lastName}
            variant="default"
            colorScheme="primary"
            size="md"
          />
        </div>

        {/* Address Field */}
        <AttractiveInput
          label="Address"
          icon={<User className="w-4 h-4" />}
          type="text"
          placeholder="Enter full address"
          value={formData.address?.fullAddress || ''}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleAddressChange(e.target.value)}
          variant="default"
          colorScheme="primary"
          size="md"
        />

        {!isEdit && (
          <AttractiveInput
            label="Password"
            icon={<Lock className="w-4 h-4" />}
            type="password"
            placeholder="Enter password for teacher"
            value={formData.password || ''}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('password', e.target.value)}
            error={errors.password}
            variant="default"
            colorScheme="primary"
            size="md"
          />
        )}

        {/* Active Status */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Checkbox
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => handleInputChange('isActive', checked as boolean)}
                className="w-4 h-4 border-2 border-green-300 data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
              />
            </div>
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-green-100 rounded-md">
                <UserCheck className="w-3 h-3 text-green-600" />
              </div>
              <div>
                <label htmlFor="isActive" className="text-xs font-semibold text-gray-800 cursor-pointer">
                  Active Teacher
                </label>
                <p className="text-xs text-gray-600 mt-1">
                  Teacher will have full access to the system
                </p>
              </div>
            </div>
          </div>
        </div>
    </FormModal>
  );
}

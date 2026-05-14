'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { InstructorRoleShell } from '@/components/role-area/InstructorRoleShell';
import PageSection from '@/components/PageSection';
import WelcomeSection from '@/components/WelcomeSection';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  LuBookOpen as BookOpen,
  LuAward as Award,
  LuClock as Clock,
  LuPencil as Edit,
  LuSave as Save,
  LuX as X,
  LuUsers as Users,
  LuCircle as HelpCircle,
  LuUser as User,
  LuUpload as Upload,
} from 'react-icons/lu';
import { useAvatarUpload } from '@/hooks/useAvatarUpload';
import { fetchAccountProfile, putAccountProfile } from '@/lib/accountClient';

interface TeacherProfile {
  _id: string;
  firstName: string;
  lastName: string;
  email?: string;
  role: string;
  isActive: boolean;
  avatar?: string;
  specialization?: string;
  bio?: string;
  experience?: string;
  education?: string;
  address?: string;
  socialLinks?: { linkedin?: string; twitter?: string; website?: string };
  createdAt: string;
  lastLogin?: string;
}

export default function TeacherProfile() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<TeacherProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const { uploadAvatar, isUploading, uploadProgress } = useAvatarUpload();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    specialization: '',
    bio: '',
    experience: '',
    education: '',
    address: '',
    linkedin: '',
    twitter: '',
    website: '',
  });

  useEffect(() => {
    if (status === 'loading') return;
    
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }
    
    if (session?.user?.role !== 'instructor') {
      router.push('/unauthorized');
      return;
    }
    
    fetchProfile();
  }, [status, session?.user?.id, session?.user?.role, router]);

  const fetchProfile = async () => {
    try {
      setLoading(true);

      const response = await fetchAccountProfile();

      if (response.ok) {
        const json = (await response.json()) as { success?: boolean; data?: TeacherProfile };
        if (json.success && json.data) {
          const u = json.data;
          setProfile(u);
          const sl = u.socialLinks || {};
          setFormData({
            firstName: u.firstName || '',
            lastName: u.lastName || '',
            specialization: u.specialization || '',
            bio: u.bio || '',
            experience: u.experience != null ? String(u.experience) : '',
            education: u.education || '',
            address: u.address || '',
            linkedin: sl.linkedin || '',
            twitter: sl.twitter || '',
            website: sl.website || '',
          });
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setEditing(true);
  };

  const handleCancel = () => {
    setEditing(false);
    const sl = profile?.socialLinks || {};
    setFormData({
      firstName: profile?.firstName || '',
      lastName: profile?.lastName || '',
      specialization: profile?.specialization || '',
      bio: profile?.bio || '',
      experience: profile?.experience != null ? String(profile.experience) : '',
      education: profile?.education || '',
      address: profile?.address || '',
      linkedin: sl.linkedin || '',
      twitter: sl.twitter || '',
      website: sl.website || '',
    });
  };

  const handleSave = async () => {
    try {
      const response = await putAccountProfile({
        firstName: formData.firstName,
        lastName: formData.lastName,
        specialization: formData.specialization,
        bio: formData.bio,
        experience: formData.experience,
        education: formData.education,
        address: formData.address,
        socialLinks: {
          linkedin: formData.linkedin,
          twitter: formData.twitter,
          website: formData.website,
        },
      });

      if (response.ok) {
        const json = (await response.json()) as { success?: boolean; data?: TeacherProfile };
        if (json.success && json.data) {
          setProfile(json.data);
          setEditing(false);
        }
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAvatarUpload = async (file: File) => {
    const userId = session?.user?.id;
    if (!file || !userId) return;

    const result = await uploadAvatar(file);
    if (!result || !result.success || !result.imageUrl) {
      return;
    }

    try {
      const response = await putAccountProfile({ avatar: result.imageUrl });

      if (response.ok) {
        const json = (await response.json()) as { success?: boolean; data?: TeacherProfile };
        if (json.success && json.data) {
          setProfile(json.data);
        }
      }
    } catch (error) {
      console.error('Error saving avatar to profile:', error);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <InstructorRoleShell>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      </InstructorRoleShell>
    );
  }

  if (!profile) {
    return (
      <InstructorRoleShell>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">Profile not found</p>
        </div>
      </InstructorRoleShell>
    );
  }

  return (
    <InstructorRoleShell>
      <main className="relative z-10 p-2 sm:p-4">
        {/* Welcome Section */}
        <WelcomeSection 
          title="My Profile 👨‍🏫"
          description="Manage your teaching profile and account settings"
        />

        <PageSection
          title="Profile Photo"
          description="Upload or change your profile picture"
          className="mb-2 sm:mb-4"
        >
          <div className="flex items-center gap-4">
            <div className="relative h-24 w-24 overflow-hidden rounded-full border-2 border-gray-200 bg-gray-100">
              {profile.avatar ? (
                <Image
                  src={profile.avatar}
                  alt="Profile avatar"
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <User className="h-8 w-8 text-gray-400" />
                </div>
              )}
              {isUploading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 text-xs text-white">
                  <div className="mb-1">Uploading...</div>
                  <div>{uploadProgress}%</div>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <label className="block text-sm text-gray-700">
                Recommended size up to 5MB (JPEG, PNG, GIF, WebP)
              </label>
              <div className="flex items-center gap-2">
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium hover:bg-gray-50">
                  <Upload className="h-4 w-4" />
                  <span>{isUploading ? 'Uploading...' : 'Upload Photo'}</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                    className="hidden"
                    disabled={isUploading}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        void handleAvatarUpload(file);
                      }
                    }}
                  />
                </label>
              </div>
            </div>
          </div>
        </PageSection>

        {/* Profile information */}
        <PageSection 
          title="Personal information"
          description="Update your personal details and teaching information"
          className="mb-2 sm:mb-4"
          actions={
            !editing ? (
              <Button variant="outline" onClick={handleEdit}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button onClick={handleSave}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
                <Button variant="outline" onClick={handleCancel}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
            )
          }
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                First Name
              </label>
              {editing ? (
                <Input
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  placeholder="Enter first name"
                />
              ) : (
                <p className="text-gray-900 p-3 bg-gray-50 rounded-lg">{profile.firstName}</p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Last Name
              </label>
              {editing ? (
                <Input
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  placeholder="Enter last name"
                />
              ) : (
                <p className="text-gray-900 p-3 bg-gray-50 rounded-lg">{profile.lastName}</p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Email Address
              </label>
              <p className="text-gray-900 p-3 bg-gray-50 rounded-lg">{profile.email || 'Not provided'}</p>
              <p className="text-xs text-amber-700 mt-1">Email and phone are not editable here.</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Specialization
              </label>
              {editing ? (
                <Input
                  value={formData.specialization}
                  onChange={(e) => handleInputChange('specialization', e.target.value)}
                  placeholder="e.g., Mathematics, Science, English"
                />
              ) : (
                <p className="text-gray-900 p-3 bg-gray-50 rounded-lg">{profile.specialization || 'Not specified'}</p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Teaching experience
              </label>
              {editing ? (
                <Input
                  value={formData.experience}
                  onChange={(e) => handleInputChange('experience', e.target.value)}
                  placeholder="e.g. 5 years or summary"
                />
              ) : (
                <p className="text-gray-900 p-3 bg-gray-50 rounded-lg">{profile.experience || 'Not specified'}</p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Education
              </label>
              {editing ? (
                <Input
                  value={formData.education}
                  onChange={(e) => handleInputChange('education', e.target.value)}
                  placeholder="e.g., Master's in Education"
                />
              ) : (
                <p className="text-gray-900 p-3 bg-gray-50 rounded-lg">{profile.education || 'Not specified'}</p>
              )}
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Bio
              </label>
              {editing ? (
                <textarea
                  value={formData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  placeholder="Tell us about yourself and your teaching philosophy..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  rows={4}
                />
              ) : (
                <p className="text-gray-900 p-3 bg-gray-50 rounded-lg min-h-[100px]">
                  {profile.bio || 'No bio provided'}
                </p>
              )}
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-gray-700 mb-2 block">Address</label>
              {editing ? (
                <textarea
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="Address"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  rows={2}
                />
              ) : (
                <p className="text-gray-900 p-3 bg-gray-50 rounded-lg">{profile.address || 'Not specified'}</p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">LinkedIn</label>
              {editing ? (
                <Input
                  value={formData.linkedin}
                  onChange={(e) => handleInputChange('linkedin', e.target.value)}
                  placeholder="https://linkedin.com/in/..."
                />
              ) : (
                <p className="text-gray-900 p-3 bg-gray-50 rounded-lg">{profile.socialLinks?.linkedin || 'Not specified'}</p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Website</label>
              {editing ? (
                <Input
                  value={formData.website}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  placeholder="https://..."
                />
              ) : (
                <p className="text-gray-900 p-3 bg-gray-50 rounded-lg">{profile.socialLinks?.website || 'Not specified'}</p>
              )}
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-gray-700 mb-2 block">Twitter / X</label>
              {editing ? (
                <Input
                  value={formData.twitter}
                  onChange={(e) => handleInputChange('twitter', e.target.value)}
                  placeholder="Profile URL or handle"
                />
              ) : (
                <p className="text-gray-900 p-3 bg-gray-50 rounded-lg">{profile.socialLinks?.twitter || 'Not specified'}</p>
              )}
            </div>
          </div>
        </PageSection>

        {/* Account information & stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Account Status */}
          <PageSection 
            title="Account Status"
            className="mb-2 sm:mb-4"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">Status</span>
                <Badge className={profile.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                  {profile.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">Role</span>
                <span className="text-sm font-medium text-gray-900 capitalize">{profile.role}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">Member Since</span>
                <span className="text-sm font-medium text-gray-900">
                  {formatDate(profile.createdAt)}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">Last Login</span>
                <span className="text-sm font-medium text-gray-900">
                  {formatDate(profile.lastLogin)}
                </span>
              </div>
            </div>
          </PageSection>

          {/* Teaching Stats */}
          <PageSection 
            title="Teaching Statistics"
            className="mb-2 sm:mb-4"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <span className="text-sm text-gray-600">Courses Created</span>
                <span className="text-sm font-medium text-purple-900">0</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <span className="text-sm text-gray-600">Students Taught</span>
                <span className="text-sm font-medium text-blue-900">0</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <span className="text-sm text-gray-600">Average Rating</span>
                <span className="text-sm font-medium text-green-900">0.0</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                <span className="text-sm text-gray-600">Teaching Hours</span>
                <span className="text-sm font-medium text-orange-900">0h</span>
              </div>
            </div>
          </PageSection>
        </div>

        {/* Quick Actions */}
        <PageSection 
          title="Quick Actions"
          description="Common tasks and shortcuts"
          className="mt-2"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button 
              variant="outline" 
              className="h-20 flex flex-col items-center justify-center gap-2"
              onClick={() => router.push('/instructor/courses')}
            >
              <BookOpen className="h-6 w-6" />
              <span className="text-sm">My Courses</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex flex-col items-center justify-center gap-2"
              onClick={() => router.push('/instructor/students')}
            >
              <Users className="h-6 w-6" />
              <span className="text-sm">Students</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex flex-col items-center justify-center gap-2"
              onClick={() => router.push('/instructor/assignments')}
            >
              <Award className="h-6 w-6" />
              <span className="text-sm">Assignments</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex flex-col items-center justify-center gap-2"
              onClick={() => router.push('/instructor/support')}
            >
              <HelpCircle className="h-6 w-6" />
              <span className="text-sm">Get Help</span>
            </Button>
          </div>
        </PageSection>
      </main>
    </InstructorRoleShell>
  );
}

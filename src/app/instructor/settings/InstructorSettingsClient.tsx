'use client';

import { useState, useEffect } from 'react';
import { useAppSelector } from '@/lib/hooks';
import useInstructorSettings from '@/hooks/useInstructorSettings';
import { AdminRoleShell } from '@/components/role-area/AdminRoleShell';
import PageSection from '@/components/PageSection';
import WelcomeSection from '@/components/WelcomeSection';
import InstructorPageWrapper from '@/components/InstructorPageWrapper';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AttractiveInput } from '@/components/ui/attractive-input';
import { LuSettings as Settings, LuLock as Lock, LuSave as Save, LuRefreshCw as RefreshCw, LuTriangleAlert as AlertTriangle, LuCheck as CheckCircle, LuRotateCcw, LuKey } from 'react-icons/lu';;
import { InstructorRoleShell } from '@/components/role-area/InstructorRoleShell';

interface SystemSettings {
  siteName: string;
  siteDescription: string;
  siteUrl: string;
  adminEmail: string;
  supportEmail: string;
  timezone: string;
  language: string;
  maintenanceMode: boolean;
  registrationEnabled: boolean;
  emailVerificationRequired: boolean;
}

interface InstructorSettings {
  profileVisibility: boolean;
  courseNotifications: boolean;
  studentNotifications: boolean;
  emailNotifications: boolean;
  autoApproveEnrollments: boolean;
  allowStudentMessages: boolean;
  showContactLuInfo: boolean;
  bio: string;
  expertise: string[];
  teachingExperience: number;
  preferredLanguage: string;
}

interface EmailSettings {
  smtpHost: string;
  smtpPort: number;
  smtpUsername: string;
  smtpPassword: string;
  useSSL: boolean;
  fromEmail: string;
  fromName: string;
}

function InstructorSettingsPageContent() {
  const { user } = useAppSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState('general');
  const [hasChanges, setHasChanges] = useState(false);
  
  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  
  // Local state to track changes without API calls
  const [localSettings, setLocalSettings] = useState<Record<string, Record<string, any>>>({});
  
  const {
    settings,
    isLoading,
    error,
    saveStatus,
    updateSettings,
    saveAllSettings,
    resetSettings
  } = useInstructorSettings();

  const tabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'password', label: 'Password', icon: LuKey },
  ];

  const handleSave = async () => {
    if (!hasChanges) return;
    
    try {
      // Merge local changes with original settings
      const mergedSettings = { ...settings } as any;
      Object.keys(localSettings).forEach(category => {
        mergedSettings[category] = {
          ...mergedSettings[category],
          ...localSettings[category]
        };
      });
      
      await saveAllSettings(mergedSettings);
      setHasChanges(false);
      setLocalSettings({}); // Clear local changes after successful save
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  const handleReset = async (category?: string) => {
    try {
      await resetSettings(category);
      setHasChanges(false);
      setLocalSettings({}); // Clear local changes when resetting
    } catch (error) {
      console.error('Error resetting settings:', error);
    }
  };

  // Helper function to get current setting value (original + local changes)
  const getCurrentSetting = (category: string, key: string) => {
    const originalValue = (settings as any)[category]?.[key];
    const localValue = localSettings[category]?.[key];
    return localValue !== undefined ? localValue : originalValue;
  };

  const handleSettingChange = (category: string, key: string, value: any) => {
    // Update local state instead of calling API immediately
    setLocalSettings((prev: Record<string, Record<string, any>>) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
    setHasChanges(true);
  };

  const handlePasswordChange = (field: string, value: string) => {
    setPasswordData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (passwordErrors[field]) {
      setPasswordErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validatePassword = () => {
    const errors: Record<string, string> = {};
    
    if (!passwordData.currentPassword) {
      errors.currentPassword = 'Current password is required';
    }
    
    if (!passwordData.newPassword) {
      errors.newPassword = 'New password is required';
    } else if (passwordData.newPassword.length < 8) {
      errors.newPassword = 'Password must be at least 8 characters long';
    }
    
    if (!passwordData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your new password';
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChangePassword = async () => {
    if (!validatePassword()) return;
    
    setIsChangingPassword(true);
    try {
      const response = await fetch('/api/instructor/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      if (response.ok) {
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setPasswordErrors({});
        alert('Password changed successfully!');
      } else {
        const error = await response.json();
        setPasswordErrors({ currentPassword: error.message || 'Failed to change password' });
      }
    } catch (error) {
      console.error('Error changing password:', error);
      setPasswordErrors({ currentPassword: 'An error occurred while changing password' });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const renderGeneralSettings = () => {
    const instructorSettings = settings.instructor || {};

    return (
      <div className="space-y-6">
        <PageSection
          title="General Settings"
          description="Configure your instructor account settings"
          className="bg-gradient-to-br from-blue-50 via-white to-purple-50 border-2 border-blue-200 shadow-lg hover:shadow-xl transition-all duration-200 my-6"
        >
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <AttractiveInput
                label="Display Name"
                value={getCurrentSetting('instructor', 'displayName') || user?.name || ''}
                onChange={(e) => handleSettingChange('instructor', 'displayName', e.target.value)}
                placeholder="Enter your display name"
                icon="user"
                variant="floating"
                colorScheme="primary"
                size="md"
              />
              <AttractiveInput
                label="Email"
                value={getCurrentSetting('instructor', 'email') || user?.email || ''}
                onChange={(e) => handleSettingChange('instructor', 'email', e.target.value)}
                placeholder="your-email@example.com"
                icon="mail"
                variant="floating"
                colorScheme="primary"
                size="md"
              />
            </div>
            <div className="space-y-4">
              <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-blue-200 shadow-md hover:shadow-lg transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-semibold text-foreground">Profile Visibility</label>
                    <p className="text-sm text-muted-foreground">Make your profile visible to students</p>
                  </div>
                  <Button
                    variant={getCurrentSetting('instructor', 'profileVisibility') ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleSettingChange('instructor', 'profileVisibility', !getCurrentSetting('instructor', 'profileVisibility'))}
                    className="border-2 border-blue-300 hover:border-blue-400 transition-all duration-200 font-semibold"
                  >
                    {getCurrentSetting('instructor', 'profileVisibility') ? "Visible" : "Hidden"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </PageSection>
      </div>
    );
  };



  const renderPasswordSettings = () => {
    return (
      <div className="space-y-6">
        <PageSection
          title="Change Password"
          description="Update your account password"
          className="bg-gradient-to-br from-red-50 via-white to-pink-50 border-2 border-red-200 shadow-lg hover:shadow-xl transition-all duration-200 my-6"
        >
          <div className="space-y-6">
            <AttractiveInput
              label="Current Password"
              type="password"
              value={passwordData.currentPassword}
              onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
              placeholder="Enter current password"
              icon="lock"
              variant="default"
              colorScheme="primary"
              size="md"
              error={passwordErrors.currentPassword}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <AttractiveInput
                label="New Password"
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                placeholder="Enter new password"
                icon="lock"
                variant="default"
                colorScheme="primary"
                size="md"
                error={passwordErrors.newPassword}
                helperText="Minimum 8 characters"
              />
              <AttractiveInput
                label="Confirm New Password"
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                placeholder="Confirm new password"
                icon="lock"
                variant="default"
                colorScheme="primary"
                size="md"
                error={passwordErrors.confirmPassword}
              />
            </div>
            <div className="flex justify-end">
              <Button
                onClick={handleChangePassword}
                disabled={isChangingPassword}
                className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white border-2 border-red-400 shadow-lg transition-all duration-200 font-semibold"
              >
                {isChangingPassword ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Changing...
                  </>
                ) : (
                  <>
                    <LuKey className="h-4 w-4 mr-2" />
                    Change Password
                  </>
                )}
              </Button>
            </div>
          </div>
        </PageSection>
      </div>
    );
  };


  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return renderGeneralSettings();
      case 'password':
        return renderPasswordSettings();
      default:
        return renderGeneralSettings();
    }
  };

  return (
    <InstructorRoleShell>
      <main className="relative z-10 p-2 sm:p-4">
        <WelcomeSection 
          title="Instructor Settings" 
          description="Manage your instructor account settings and preferences"
          className="mb-6"
        />
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Settings Navigation */}
          <PageSection
            title="Settings"
            description="Choose a category to configure"
            className="bg-gradient-to-br from-slate-50 via-white to-gray-50 border-2 border-slate-200 shadow-lg hover:shadow-xl transition-all duration-200 my-6"
          >
            <nav className="space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all duration-200 rounded-lg border-2 ${
                      isActive
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-blue-400 shadow-lg'
                        : 'hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:border-blue-200 hover:shadow-md border-transparent'
                    }`}
                  >
                    <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-slate-600'}`} />
                    <span className={`text-sm font-semibold ${isActive ? 'text-white' : 'text-slate-700'}`}>
                      {tab.label}
                    </span>
                  </button>
                );
              })}
            </nav>
          </PageSection>

          {/* Settings Content */}
          <div className="lg:col-span-3">
            {isLoading ? (
              <div className="mb-4 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-700">
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Loading settings...</span>
              </div>
            ) : null}
            {renderTabContent()}
            
            {/* Error Display */}
            {error && (
              <PageSection
                title="Error"
                description={error}
                className="bg-gradient-to-br from-red-50 via-white to-pink-50 border-2 border-red-200 shadow-lg hover:shadow-xl transition-all duration-200 my-6"
              >
                <div className="flex items-center gap-2 text-red-700">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="text-sm font-medium">Please check the error details above</span>
                </div>
              </PageSection>
            )}

            {/* Save Button */}
            <PageSection
              title="Save Changes"
              description={hasChanges ? 'You have unsaved changes' : 'All changes saved'}
              className="bg-gradient-to-br from-emerald-50 via-white to-teal-50 border-2 border-emerald-200 shadow-lg hover:shadow-xl transition-all duration-200 my-6"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {hasChanges ? (
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                  ) : (
                    <CheckCircle className="h-4 w-4 text-emerald-600" />
                  )}
                  <span className={`text-sm font-medium ${hasChanges ? 'text-amber-700' : 'text-emerald-700'}`}>
                    {hasChanges ? 'You have unsaved changes' : 'All changes saved'}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => handleReset()}
                    disabled={!hasChanges}
                    className="border-2 border-emerald-300 hover:border-emerald-400 transition-all duration-200 font-semibold"
                  >
                    <LuRotateCcw className="h-4 w-4 mr-2" />
                    Reset
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={!hasChanges || saveStatus === 'saving'}
                    className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white border-2 border-emerald-400 shadow-lg transition-all duration-200 font-semibold"
                  >
                    {saveStatus === 'saving' ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </PageSection>
          </div>
        </div>
      </main>
    </InstructorRoleShell>
  );
}

export default function InstructorSettingsPage() {
  return (
    <InstructorPageWrapper>
      <InstructorSettingsPageContent />
    </InstructorPageWrapper>
  );
}


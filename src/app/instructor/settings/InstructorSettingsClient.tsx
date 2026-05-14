'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { useAppSelector } from '@/lib/hooks';
import useInstructorSettings from '@/hooks/useInstructorSettings';
import PageSection from '@/components/PageSection';
import WelcomeSection from '@/components/WelcomeSection';
import InstructorPageWrapper from '@/components/InstructorPageWrapper';
import { Button } from '@/components/ui/button';
import { AttractiveInput } from '@/components/ui/attractive-input';
import {
  LuSettings as Settings,
  LuSave as Save,
  LuRefreshCw as RefreshCw,
  LuTriangleAlert as AlertTriangle,
  LuCheck as CheckCircle,
  LuRotateCcw,
  LuKey,
  LuBell,
  LuMail as Mail,
} from 'react-icons/lu';
import AccountChangePasswordPanel from '@/components/AccountChangePasswordPanel';
import { InstructorRoleShell } from '@/components/role-area/InstructorRoleShell';
import { fetchAccountProfile, putAccountProfile } from '@/lib/accountClient';

type AccountDraft = {
  bio: string;
  education: string;
  address: string;
  specialization: string;
  experience: string;
  linkedin: string;
  twitter: string;
  website: string;
};

const emptyAccountDraft: AccountDraft = {
  bio: '',
  education: '',
  address: '',
  specialization: '',
  experience: '',
  linkedin: '',
  twitter: '',
  website: '',
};

function InstructorSettingsPageContent() {
  const { user } = useAppSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState('general');
  const [hasChanges, setHasChanges] = useState(false);
  const [accountDraft, setAccountDraft] = useState<AccountDraft>(emptyAccountDraft);
  const [accountDirty, setAccountDirty] = useState(false);

  const [localSettings, setLocalSettings] = useState<Record<string, Record<string, unknown>>>({});

  const { settings, isLoading, error, saveStatus, saveAllSettings, resetSettings, refetch } =
    useInstructorSettings();

  const loadAccount = useCallback(async () => {
    try {
      const res = await fetchAccountProfile();
      if (!res.ok) return;
      const json = (await res.json()) as { success?: boolean; data?: Record<string, unknown> };
      const d = json.data;
      if (!d || json.success === false) return;
      const sl = (d.socialLinks as Record<string, string> | undefined) || {};
      setAccountDraft({
        bio: String(d.bio || ''),
        education: String(d.education || ''),
        address: String(d.address || ''),
        specialization: String(d.specialization || ''),
        experience: d.experience != null ? String(d.experience) : '',
        linkedin: String(sl.linkedin || ''),
        twitter: String(sl.twitter || ''),
        website: String(sl.website || ''),
      });
      setAccountDirty(false);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    void loadAccount();
  }, [loadAccount]);

  const anyDirty = hasChanges || accountDirty;

  const tabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'notifications', label: 'Notifications', icon: LuBell },
    { id: 'email', label: 'Email', icon: Mail },
    { id: 'password', label: 'Password', icon: LuKey },
  ];

  const handleSave = async () => {
    if (!hasChanges && !accountDirty) return;

    try {
      if (accountDirty) {
        const res = await putAccountProfile({
          bio: accountDraft.bio,
          education: accountDraft.education,
          address: accountDraft.address,
          specialization: accountDraft.specialization,
          experience: accountDraft.experience,
          socialLinks: {
            linkedin: accountDraft.linkedin,
            twitter: accountDraft.twitter,
            website: accountDraft.website,
          },
        });
        if (!res.ok) {
          console.error('Account profile save failed');
        } else {
          await loadAccount();
        }
      }

      if (hasChanges) {
        const mergedSettings = { ...settings } as Record<string, Record<string, unknown>>;
        Object.keys(localSettings).forEach((category) => {
          mergedSettings[category] = {
            ...mergedSettings[category],
            ...localSettings[category],
          };
        });

        await saveAllSettings(mergedSettings as Parameters<typeof saveAllSettings>[0]);
        setHasChanges(false);
        setLocalSettings({});
      }

      await refetch();
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  const handleReset = async () => {
    try {
      await resetSettings();
      setHasChanges(false);
      setLocalSettings({});
      await loadAccount();
      await refetch();
    } catch (error) {
      console.error('Error resetting settings:', error);
    }
  };

  const getCurrentSetting = (category: string, key: string) => {
    const originalValue = (settings as Record<string, Record<string, unknown>>)[category]?.[key];
    const localValue = localSettings[category]?.[key];
    return localValue !== undefined ? localValue : originalValue;
  };

  const patchAccountDraft = (partial: Partial<AccountDraft>) => {
    setAccountDraft((prev) => ({ ...prev, ...partial }));
    setAccountDirty(true);
  };

  const handleSettingChange = (category: string, key: string, value: unknown) => {
    setLocalSettings((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value,
      },
    }));
    setHasChanges(true);
  };

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <PageSection
        title="General Settings"
        description="Configure your instructor account settings"
        className="bg-gradient-to-br from-blue-50 via-white to-purple-50 border-2 border-blue-200 shadow-lg hover:shadow-xl transition-all duration-200 my-6"
      >
        <div className="space-y-6">
          <div className="rounded-lg border border-blue-100 bg-white/80 p-4 text-sm text-slate-700 shadow-sm">
            <p>
              <span className="font-semibold text-foreground">Name:</span> {user?.name || '—'}
            </p>
            <p className="mt-1">
              <span className="font-semibold text-foreground">Email:</span> {user?.email || '—'}
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              Name and login email are edited on{' '}
              <Link href="/instructor/profile" className="font-medium text-primary underline">
                My Profile
              </Link>
              .
            </p>
          </div>
          <div className="space-y-4">
            <div className="rounded-lg border border-blue-200 bg-white/80 p-4 shadow-md backdrop-blur-sm transition-all duration-200 hover:shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-semibold text-foreground">Profile Visibility</label>
                  <p className="text-sm text-muted-foreground">Make your profile visible to students</p>
                </div>
                <Button
                  variant={getCurrentSetting('instructor', 'profileVisibility') ? 'default' : 'outline'}
                  size="sm"
                  onClick={() =>
                    handleSettingChange(
                      'instructor',
                      'profileVisibility',
                      !getCurrentSetting('instructor', 'profileVisibility'),
                    )
                  }
                  className="border-2 border-blue-300 font-semibold transition-all duration-200 hover:border-blue-400"
                >
                  {getCurrentSetting('instructor', 'profileVisibility') ? 'Visible' : 'Hidden'}
                </Button>
              </div>
            </div>
            <div className="rounded-lg border border-purple-200 bg-white/80 p-4 shadow-md backdrop-blur-sm transition-all duration-200 hover:shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-semibold text-foreground">Allow Student Messages</label>
                  <p className="text-sm text-muted-foreground">Let students contact you directly</p>
                </div>
                <Button
                  variant={getCurrentSetting('instructor', 'allowStudentMessages') ? 'default' : 'outline'}
                  size="sm"
                  onClick={() =>
                    handleSettingChange(
                      'instructor',
                      'allowStudentMessages',
                      !getCurrentSetting('instructor', 'allowStudentMessages'),
                    )
                  }
                  className="border-2 border-purple-300 font-semibold transition-all duration-200 hover:border-purple-400"
                >
                  {getCurrentSetting('instructor', 'allowStudentMessages') ? 'Allowed' : 'Disabled'}
                </Button>
              </div>
            </div>
            <div className="rounded-lg border border-green-200 bg-white/80 p-4 shadow-md backdrop-blur-sm transition-all duration-200 hover:shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-semibold text-foreground">Show Contact Info</label>
                  <p className="text-sm text-muted-foreground">Display your contact details where appropriate</p>
                </div>
                <Button
                  variant={getCurrentSetting('instructor', 'showContactInfo') ? 'default' : 'outline'}
                  size="sm"
                  onClick={() =>
                    handleSettingChange(
                      'instructor',
                      'showContactInfo',
                      !getCurrentSetting('instructor', 'showContactInfo'),
                    )
                  }
                  className="border-2 border-green-300 font-semibold transition-all duration-200 hover:border-green-400"
                >
                  {getCurrentSetting('instructor', 'showContactInfo') ? 'Shown' : 'Hidden'}
                </Button>
              </div>
            </div>
          </div>

          <AttractiveInput
            label="Bio"
            value={accountDraft.bio}
            onChange={(e) => patchAccountDraft({ bio: e.target.value })}
            placeholder="Tell students about your teaching..."
            icon="user"
            variant="default"
            colorScheme="primary"
            size="md"
            helperText="Saved to your account (not notification settings)."
          />
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <AttractiveInput
              label="Specialization"
              value={accountDraft.specialization}
              onChange={(e) => patchAccountDraft({ specialization: e.target.value })}
              placeholder="e.g., Mathematics, Science"
              icon="book"
              variant="default"
              colorScheme="primary"
              size="md"
            />
            <AttractiveInput
              label="Teaching experience"
              value={accountDraft.experience}
              onChange={(e) => patchAccountDraft({ experience: e.target.value })}
              placeholder="e.g., 5 years"
              icon="edit"
              variant="default"
              colorScheme="primary"
              size="md"
            />
          </div>
          <AttractiveInput
            label="Education"
            value={accountDraft.education}
            onChange={(e) => patchAccountDraft({ education: e.target.value })}
            placeholder="Degrees and certifications"
            icon="book"
            variant="default"
            colorScheme="primary"
            size="md"
          />
          <AttractiveInput
            label="Address"
            value={accountDraft.address}
            onChange={(e) => patchAccountDraft({ address: e.target.value })}
            placeholder="Mailing address"
            icon="edit"
            variant="default"
            colorScheme="primary"
            size="md"
          />
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <AttractiveInput
              label="LinkedIn"
              value={accountDraft.linkedin}
              onChange={(e) => patchAccountDraft({ linkedin: e.target.value })}
              placeholder="https://linkedin.com/in/..."
              icon="user"
              variant="default"
              colorScheme="primary"
              size="md"
            />
            <AttractiveInput
              label="Website"
              value={accountDraft.website}
              onChange={(e) => patchAccountDraft({ website: e.target.value })}
              placeholder="https://..."
              icon="mail"
              variant="default"
              colorScheme="primary"
              size="md"
            />
            <AttractiveInput
              label="Twitter / X"
              value={accountDraft.twitter}
              onChange={(e) => patchAccountDraft({ twitter: e.target.value })}
              placeholder="Profile URL"
              icon="mail"
              variant="default"
              colorScheme="primary"
              size="md"
            />
          </div>
        </div>
      </PageSection>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <PageSection
        title="Notification Preferences"
        description="Configure your notification settings"
        className="my-6 border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-teal-50 shadow-lg transition-all duration-200 hover:shadow-xl"
      >
        <div className="space-y-4">
          {[
            {
              key: 'courseNotifications',
              label: 'Course Notifications',
              description: 'Get notified about course updates and activity',
            },
            {
              key: 'studentNotifications',
              label: 'Student Notifications',
              description: 'Get notified about student messages and enrollments',
            },
            {
              key: 'emailNotifications',
              label: 'Email Notifications',
              description: 'Receive notifications via email',
            },
          ].map((setting) => (
            <div
              key={setting.key}
              className="flex items-center justify-between rounded-lg border border-emerald-100 bg-white/50 p-4 transition-all duration-200 hover:bg-white/70"
            >
              <div className="flex-1">
                <label className="text-sm font-semibold text-slate-700">{setting.label}</label>
                <p className="mt-1 text-sm text-slate-600">{setting.description}</p>
              </div>
              <Button
                variant={getCurrentSetting('instructor', setting.key) ? 'default' : 'outline'}
                size="sm"
                onClick={() =>
                  handleSettingChange(
                    'instructor',
                    setting.key,
                    !getCurrentSetting('instructor', setting.key),
                  )
                }
                className={`font-semibold transition-all duration-200 ${
                  getCurrentSetting('instructor', setting.key)
                    ? 'border-2 border-emerald-400 bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg hover:from-emerald-700 hover:to-teal-700'
                    : 'border-2 border-emerald-300 text-emerald-700 hover:border-emerald-400 hover:bg-emerald-50'
                }`}
              >
                {getCurrentSetting('instructor', setting.key) ? 'Enabled' : 'Disabled'}
              </Button>
            </div>
          ))}
        </div>
      </PageSection>
    </div>
  );

  const renderEmailSettings = () => (
    <div className="space-y-6">
      <PageSection
        title="Email Configuration"
        description="Configure your email preferences"
        className="my-6 border-2 border-blue-200 bg-gradient-to-br from-blue-50 via-white to-cyan-50 shadow-lg transition-all duration-200 hover:shadow-xl"
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <AttractiveInput
              label="Preferred Email"
              value={String(getCurrentSetting('instructor', 'preferredEmail') || user?.email || '')}
              onChange={(e) => handleSettingChange('instructor', 'preferredEmail', e.target.value)}
              placeholder="your-email@example.com"
              icon="mail"
              variant="floating"
              colorScheme="primary"
              size="md"
              helperText="Email address for notifications"
            />
            <AttractiveInput
              label="Email Signature"
              value={String(getCurrentSetting('instructor', 'emailSignature') || '')}
              onChange={(e) => handleSettingChange('instructor', 'emailSignature', e.target.value)}
              placeholder="Best regards, [Your Name]"
              icon="edit"
              variant="floating"
              colorScheme="primary"
              size="md"
              helperText="Signature for outgoing emails"
            />
          </div>
        </div>
      </PageSection>
    </div>
  );

  const renderPasswordSettings = () => <AccountChangePasswordPanel />;

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return renderGeneralSettings();
      case 'notifications':
        return renderNotificationSettings();
      case 'email':
        return renderEmailSettings();
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

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
          <PageSection
            title="Settings"
            description="Choose a category to configure"
            className="my-6 border-2 border-slate-200 bg-gradient-to-br from-slate-50 via-white to-gray-50 shadow-lg transition-all duration-200 hover:shadow-xl"
          >
            <nav className="space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex w-full items-center gap-3 rounded-lg border-2 px-4 py-3 text-left transition-all duration-200 ${
                      isActive
                        ? 'border-blue-400 bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                        : 'border-transparent hover:border-blue-200 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:shadow-md'
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

          <div className="lg:col-span-3">
            {isLoading ? (
              <div className="mb-4 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-700">
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Loading settings...</span>
              </div>
            ) : null}
            {renderTabContent()}

            {error ? (
              <PageSection
                title="Error"
                description={error}
                className="my-6 border-2 border-red-200 bg-gradient-to-br from-red-50 via-white to-pink-50 shadow-lg transition-all duration-200 hover:shadow-xl"
              >
                <div className="flex items-center gap-2 text-red-700">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="text-sm font-medium">Please check the error details above</span>
                </div>
              </PageSection>
            ) : null}

            <PageSection
              title="Save Changes"
              description={anyDirty ? 'You have unsaved changes' : 'All changes saved'}
              className="my-6 border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-teal-50 shadow-lg transition-all duration-200 hover:shadow-xl"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {anyDirty ? (
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                  ) : (
                    <CheckCircle className="h-4 w-4 text-emerald-600" />
                  )}
                  <span className={`text-sm font-medium ${anyDirty ? 'text-amber-700' : 'text-emerald-700'}`}>
                    {anyDirty ? 'You have unsaved changes' : 'All changes saved'}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => void handleReset()}
                    disabled={!anyDirty}
                    className="border-2 border-emerald-300 font-semibold transition-all duration-200 hover:border-emerald-400"
                  >
                    <LuRotateCcw className="mr-2 h-4 w-4" />
                    Reset
                  </Button>
                  <Button
                    type="button"
                    onClick={() => void handleSave()}
                    disabled={!anyDirty || saveStatus === 'saving'}
                    className="border-2 border-emerald-400 bg-gradient-to-r from-emerald-600 to-teal-600 font-semibold text-white shadow-lg transition-all duration-200 hover:from-emerald-700 hover:to-teal-700"
                  >
                    {saveStatus === 'saving' ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
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

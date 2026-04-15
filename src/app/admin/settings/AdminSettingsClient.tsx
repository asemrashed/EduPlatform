'use client';

import { useState, useEffect } from 'react';
import { useAppSelector } from '@/lib/hooks';
import { useSettings } from '@/hooks/useSettings';
import { AdminRoleShell } from '@/components/role-area/AdminRoleShell';
import PageSection from '@/components/PageSection';
import WelcomeSection from '@/components/WelcomeSection';
import AdminPageWrapper from '@/components/AdminPageWrapper';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AttractiveInput } from '@/components/ui/attractive-input';
import { LuSettings as Settings, LuUser as User, LuMail as Mail, LuLock as Lock, LuSave as Save, LuRefreshCw as RefreshCw, LuTriangleAlert as AlertTriangle, LuCheck as CheckCircle, LuInfo as LuInfo, LuRotateCcw, LuKey, LuCreditCard } from 'react-icons/lu';;

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




function SettingsPageContent() {
  const { user } = useAppSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState('password');
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
    saveCategorySettings,
    resetSettings
  } = useSettings();

  const tabs = [
    // { id: 'general', label: 'General', icon: Settings },
    { id: 'password', label: 'Password', icon: LuKey },
    { id: 'email', label: 'Email', icon: Mail },
    { id: 'payment', label: 'Payment', icon: LuCreditCard },
  ];

  const handleSave = async () => {
    if (!hasChanges) return;
    
    try {
      // Only send categories that have local changes to avoid validating unrelated categories
      const categoriesChanged = Object.keys(localSettings);

      if (categoriesChanged.length === 1) {
        const category = categoriesChanged[0] as keyof typeof settings;
        await saveCategorySettings(category, localSettings[category]);
      } else {
        const settingsToSave: Record<string, any> = {};
        categoriesChanged.forEach((category) => {
          const originalCategory = (settings as any)[category] || {};
          settingsToSave[category] = {
            ...originalCategory,
            ...localSettings[category]
          };
        });
        await saveAllSettings(settingsToSave as any);
      }

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
    
    if (passwordData.currentPassword === passwordData.newPassword) {
      errors.newPassword = 'New password must be different from current password';
    }
    
    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChangePassword = async () => {
    if (!validatePassword()) return;
    
    setIsChangingPassword(true);
    try {
      const response = await fetch('/api/admin/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to change password');
      }
      
      // Reset form on success
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setPasswordErrors({});
      
      // Show success message (you could add a toast notification here)
      alert('Password changed successfully!');
      
    } catch (error) {
      console.error('Error changing password:', error);
      setPasswordErrors({ general: error instanceof Error ? error.message : 'Failed to change password' });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const renderGeneralSettings = () => {
    const systemSettings = settings.system;
    if (!systemSettings) return <div>Loading...</div>;

    return (
      <div className="space-y-6">
        <div
          style={{
            background: "linear-gradient(135deg, rgba(123, 44, 191, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%)",
            borderColor: 'rgba(123, 44, 191, 0.2)',
          }}
          className="border-2 rounded-xl"
        >
          <PageSection
            title="Site Configuration"
            description="Configure basic site information and settings"
            className="shadow-lg hover:shadow-xl transition-all duration-200 border-0"
          >
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <AttractiveInput
                label="Site Name"
                value={getCurrentSetting('system', 'siteName') || ''}
                onChange={(e) => handleSettingChange('system', 'siteName', e.target.value)}
                placeholder="Enter site name"
                icon="user"
                variant="default"
                colorScheme="primary"
                size="md"
              />
              <AttractiveInput
                label="Site URL"
                value={getCurrentSetting('system', 'siteUrl') || ''}
                onChange={(e) => handleSettingChange('system', 'siteUrl', e.target.value)}
                placeholder="https://your-site.com"
                icon="globe"
                variant="default"
                colorScheme="primary"
                size="md"
              />
            </div>
            <AttractiveInput
              label="Site Description"
              value={getCurrentSetting('system', 'siteDescription') || ''}
              onChange={(e) => handleSettingChange('system', 'siteDescription', e.target.value)}
              placeholder="Enter site description"
              icon="info"
              variant="default"
              colorScheme="primary"
              size="md"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <AttractiveInput
                label="Admin Email"
                value={getCurrentSetting('system', 'adminEmail') || ''}
                onChange={(e) => handleSettingChange('system', 'adminEmail', e.target.value)}
                placeholder="admin@example.com"
                icon="mail"
                variant="default"
                colorScheme="primary"
                size="md"
              />
              <AttractiveInput
                label="Support Email"
                value={getCurrentSetting('system', 'supportEmail') || ''}
                onChange={(e) => handleSettingChange('system', 'supportEmail', e.target.value)}
                placeholder="support@example.com"
                icon="mail"
                variant="default"
                colorScheme="primary"
                size="md"
              />
            </div>
          </div>
        </PageSection>
        </div>

        <div
          style={{
            background: "linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(123, 44, 191, 0.1) 100%)",
            borderColor: 'rgba(16, 185, 129, 0.2)',
          }}
          className="border-2 rounded-xl"
        >
          <PageSection
            title="User Management"
            description="Configure user registration and verification settings"
            className="shadow-lg hover:shadow-xl transition-all duration-200 border-0"
          >
          <div className="space-y-6">
            <div className="bg-white rounded-lg p-4 shadow-md hover:shadow-lg transition-all duration-200" style={{
              border: '1px solid rgba(123, 44, 191, 0.2)',
            }}>
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-semibold text-foreground">Enable Registration</label>
                  <p className="text-sm text-muted-foreground">Allow new users to register</p>
                </div>
                <Button
                  variant={getCurrentSetting('system', 'registrationEnabled') ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleSettingChange('system', 'registrationEnabled', !getCurrentSetting('system', 'registrationEnabled'))}
                  className="border-2 transition-all duration-200 font-semibold"
                  style={{
                    borderColor: '#7B2CBF',
                  }}
                  onMouseEnter={(e) => {
                    if (!getCurrentSetting('system', 'registrationEnabled')) {
                      e.currentTarget.style.borderColor = '#A855F7';
                      e.currentTarget.style.backgroundColor = 'rgba(123, 44, 191, 0.1)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!getCurrentSetting('system', 'registrationEnabled')) {
                      e.currentTarget.style.borderColor = '#7B2CBF';
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  {getCurrentSetting('system', 'registrationEnabled') ? "Enabled" : "Disabled"}
                </Button>
              </div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-green-200 shadow-md hover:shadow-lg transition-all duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-semibold text-foreground">Email Verification Required</label>
                  <p className="text-sm text-muted-foreground">Require email verification for new accounts</p>
                </div>
                <Button
                  variant={getCurrentSetting('system', 'emailVerificationRequired') ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleSettingChange('system', 'emailVerificationRequired', !getCurrentSetting('system', 'emailVerificationRequired'))}
                  className="border-2 border-green-300 hover:border-green-400 transition-all duration-200 font-semibold"
                >
                  {getCurrentSetting('system', 'emailVerificationRequired') ? "Required" : "Optional"}
                </Button>
              </div>
            </div>
          </div>
        </PageSection>
        </div>
      </div>
    );
  };




  const renderEmailSettings = () => (
    <div className="space-y-6">
      <div
        style={{
          background: "linear-gradient(135deg, rgba(123, 44, 191, 0.1) 0%, rgba(14, 165, 233, 0.1) 100%)",
          borderColor: 'rgba(123, 44, 191, 0.2)',
        }}
        className="border-2 rounded-xl"
      >
        <PageSection
          title="Email Configuration"
          description="Configure email server and template settings"
          className="shadow-lg hover:shadow-xl transition-all duration-200 border-0"
        >
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 bg-white rounded-lg border hover:bg-white transition-all duration-200" style={{
              borderColor: 'rgba(123, 44, 191, 0.1)',
            }}>
              <label className="text-sm font-semibold text-slate-700 mb-2 block">SMTP Host</label>
              <Input 
                placeholder="smtp.gmail.com" 
                value={getCurrentSetting('email', 'smtpHost') || ''}
                onChange={(e) => handleSettingChange('email', 'smtpHost', e.target.value)}
                className="border-2 transition-all duration-200"
                style={{
                  borderColor: 'rgba(123, 44, 191, 0.2)',
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = '#7B2CBF'}
                onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(123, 44, 191, 0.2)'}
              />
            </div>
            <div className="p-4 bg-white rounded-lg border hover:bg-white transition-all duration-200" style={{
              borderColor: 'rgba(123, 44, 191, 0.1)',
            }}>
              <label className="text-sm font-semibold text-slate-700 mb-2 block">SMTP Port</label>
              <Input 
                placeholder="587" 
                value={getCurrentSetting('email', 'smtpPort') || ''}
                onChange={(e) => handleSettingChange('email', 'smtpPort', Number(e.target.value) || 0)}
                className="border-2 transition-all duration-200"
                style={{
                  borderColor: 'rgba(123, 44, 191, 0.2)',
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = '#7B2CBF'}
                onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(123, 44, 191, 0.2)'}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 bg-white rounded-lg border hover:bg-white transition-all duration-200" style={{
              borderColor: 'rgba(123, 44, 191, 0.1)',
            }}>
              <label className="text-sm font-semibold text-slate-700 mb-2 block">SMTP Username</label>
              <Input 
                placeholder="your-email@gmail.com" 
                value={getCurrentSetting('email', 'smtpUsername') || ''}
                onChange={(e) => handleSettingChange('email', 'smtpUsername', e.target.value)}
                className="border-2 transition-all duration-200"
                style={{
                  borderColor: 'rgba(123, 44, 191, 0.2)',
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = '#7B2CBF'}
                onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(123, 44, 191, 0.2)'}
              />
            </div>
            <div className="p-4 bg-white rounded-lg border hover:bg-white transition-all duration-200" style={{
              borderColor: 'rgba(123, 44, 191, 0.1)',
            }}>
              <label className="text-sm font-semibold text-slate-700 mb-2 block">SMTP Password</label>
              <Input 
                type="password" 
                placeholder="••••••••" 
                value={getCurrentSetting('email', 'smtpPassword') || ''}
                onChange={(e) => handleSettingChange('email', 'smtpPassword', e.target.value)}
                className="border-2 transition-all duration-200"
                style={{
                  borderColor: 'rgba(123, 44, 191, 0.2)',
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = '#7B2CBF'}
                onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(123, 44, 191, 0.2)'}
              />
            </div>
          </div>
          <div className="p-4 bg-white rounded-lg border hover:bg-white transition-all duration-200" style={{
            borderColor: 'rgba(123, 44, 191, 0.1)',
          }}>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <label className="text-sm font-semibold text-slate-700">Use SSL/TLS</label>
                <p className="text-sm text-slate-600 mt-1">Enable secure email transmission</p>
              </div>
              <Button 
                onClick={() => handleSettingChange('email', 'useSSL', !getCurrentSetting('email', 'useSSL'))}
                variant={getCurrentSetting('email', 'useSSL') ? 'default' : 'outline'} 
                size="sm"
                className="text-white border-2 shadow-lg transition-all duration-200 font-semibold"
                style={getCurrentSetting('email', 'useSSL') ? {
                  background: "linear-gradient(135deg, #EC4899 0%, #A855F7 100%)",
                  borderColor: '#A855F7',
                  boxShadow: "0 4px 15px rgba(236, 72, 153, 0.3)",
                } : {
                  borderColor: '#7B2CBF',
                  backgroundColor: 'transparent',
                  color: '#7B2CBF',
                }}
                onMouseEnter={(e) => {
                  if (getCurrentSetting('email', 'useSSL')) {
                    e.currentTarget.style.background = "linear-gradient(135deg, #DB2777 0%, #9333EA 100%)";
                    e.currentTarget.style.boxShadow = "0 6px 20px rgba(236, 72, 153, 0.4)";
                  } else {
                    e.currentTarget.style.borderColor = '#A855F7';
                    e.currentTarget.style.backgroundColor = 'rgba(123, 44, 191, 0.1)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (getCurrentSetting('email', 'useSSL')) {
                    e.currentTarget.style.background = "linear-gradient(135deg, #EC4899 0%, #A855F7 100%)";
                    e.currentTarget.style.boxShadow = "0 4px 15px rgba(236, 72, 153, 0.3)";
                  } else {
                    e.currentTarget.style.borderColor = '#7B2CBF';
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                {getCurrentSetting('email', 'useSSL') ? 'Enabled' : 'Disabled'}
              </Button>
            </div>
          </div>
        </div>
      </PageSection>
      </div>
    </div>
  );

  const renderPaymentSettings = () => (
    <div className="space-y-6">
      <PageSection
        title="Payment Gateway (SSLCOMMERZ)"
        description="Configure payment provider credentials and callback URLs"
        className="bg-gradient-to-br from-amber-50 via-white to-yellow-50 border-2 border-amber-200 shadow-lg hover:shadow-xl transition-all duration-200"
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 bg-white/50 rounded-lg border border-amber-100 hover:bg-white/70 transition-all duration-200">
              <label className="text-sm font-semibold text-slate-700 mb-2 block">Environment</label>
              <select
                className="w-full h-10 rounded-md border-2 border-amber-200 px-3 focus:outline-none focus:border-amber-400 transition-all duration-200 bg-white"
                value={getCurrentSetting('payment', 'environment') || 'sandbox'}
                onChange={(e) => handleSettingChange('payment', 'environment', e.target.value)}
              >
                <option value="sandbox">Sandbox</option>
                <option value="live">Live</option>
              </select>
            </div>
            <div className="p-4 bg-white/50 rounded-lg border border-amber-100 hover:bg-white/70 transition-all duration-200">
              <label className="text-sm font-semibold text-slate-700 mb-2 block">Provider</label>
              <Input
                placeholder="sslcommerz"
                value={getCurrentSetting('payment', 'provider') || 'sslcommerz'}
                onChange={(e) => handleSettingChange('payment', 'provider', e.target.value)}
                className="border-2 border-amber-200 focus:border-amber-400 transition-all duration-200"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 bg-white/50 rounded-lg border border-amber-100 hover:bg-white/70 transition-all duration-200">
              <label className="text-sm font-semibold text-slate-700 mb-2 block">Store ID</label>
              <Input
                placeholder="SSLCOMMERZ_STORE_ID"
                value={getCurrentSetting('payment', 'storeId') || ''}
                onChange={(e) => handleSettingChange('payment', 'storeId', e.target.value)}
                className="border-2 border-amber-200 focus:border-amber-400 transition-all duration-200"
              />
            </div>
            <div className="p-4 bg-white/50 rounded-lg border border-amber-100 hover:bg-white/70 transition-all duration-200">
              <label className="text-sm font-semibold text-slate-700 mb-2 block">Store Password</label>
              <Input
                type="password"
                placeholder="SSLCOMMERZ_STORE_PASSWORD"
                value={getCurrentSetting('payment', 'storePassword') || ''}
                onChange={(e) => handleSettingChange('payment', 'storePassword', e.target.value)}
                className="border-2 border-amber-200 focus:border-amber-400 transition-all duration-200"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 bg-white/50 rounded-lg border border-amber-100 hover:bg-white/70 transition-all duration-200">
              <label className="text-sm font-semibold text-slate-700 mb-2 block">Sandbox URL</label>
              <Input
                placeholder="https://sandbox.sslcommerz.com"
                value={getCurrentSetting('payment', 'sandboxUrl') || ''}
                onChange={(e) => handleSettingChange('payment', 'sandboxUrl', e.target.value)}
                className="border-2 border-amber-200 focus:border-amber-400 transition-all duration-200"
              />
            </div>
            <div className="p-4 bg-white/50 rounded-lg border border-amber-100 hover:bg-white/70 transition-all duration-200">
              <label className="text-sm font-semibold text-slate-700 mb-2 block">Live URL</label>
              <Input
                placeholder="https://securepay.sslcommerz.com"
                value={getCurrentSetting('payment', 'liveUrl') || ''}
                onChange={(e) => handleSettingChange('payment', 'liveUrl', e.target.value)}
                className="border-2 border-amber-200 focus:border-amber-400 transition-all duration-200"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 bg-white/50 rounded-lg border border-amber-100 hover:bg-white/70 transition-all duration-200">
              <label className="text-sm font-semibold text-slate-700 mb-2 block">Success URL</label>
              <Input
                placeholder="http://your-site.com/payment/success"
                value={getCurrentSetting('payment', 'successUrl') || ''}
                onChange={(e) => handleSettingChange('payment', 'successUrl', e.target.value)}
                className="border-2 border-amber-200 focus:border-amber-400 transition-all duration-200"
              />
            </div>
            <div className="p-4 bg-white/50 rounded-lg border border-amber-100 hover:bg-white/70 transition-all duration-200">
              <label className="text-sm font-semibold text-slate-700 mb-2 block">Fail URL</label>
              <Input
                placeholder="http://your-site.com/payment/fail"
                value={getCurrentSetting('payment', 'failUrl') || ''}
                onChange={(e) => handleSettingChange('payment', 'failUrl', e.target.value)}
                className="border-2 border-amber-200 focus:border-amber-400 transition-all duration-200"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 bg-white/50 rounded-lg border border-amber-100 hover:bg-white/70 transition-all duration-200">
              <label className="text-sm font-semibold text-slate-700 mb-2 block">Cancel URL</label>
              <Input
                placeholder="http://your-site.com/payment/cancel"
                value={getCurrentSetting('payment', 'cancelUrl') || ''}
                onChange={(e) => handleSettingChange('payment', 'cancelUrl', e.target.value)}
                className="border-2 border-amber-200 focus:border-amber-400 transition-all duration-200"
              />
            </div>
            <div className="p-4 bg-white/50 rounded-lg border border-amber-100 hover:bg-white/70 transition-all duration-200">
              <label className="text-sm font-semibold text-slate-700 mb-2 block">IPN URL</label>
              <Input
                placeholder="http://your-site.com/api/payment/ipn"
                value={getCurrentSetting('payment', 'ipnUrl') || ''}
                onChange={(e) => handleSettingChange('payment', 'ipnUrl', e.target.value)}
                className="border-2 border-amber-200 focus:border-amber-400 transition-all duration-200"
              />
            </div>
          </div>
        </div>
      </PageSection>
    </div>
  );

  const renderPasswordSettings = () => {
    return (
      <div className="space-y-6">
        <PageSection
          title="Change Password"
          description="Update your account password for enhanced security"
          className="bg-gradient-to-br from-red-50 via-white to-pink-50 border-2 border-red-200 shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <div className="space-y-6">
            {/* General Error */}
            {passwordErrors.general && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg shadow-md">
                <div className="flex items-center gap-2 text-red-700">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="text-sm font-medium">{passwordErrors.general}</span>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <AttractiveInput
                type="password"
                label="Current Password"
                placeholder="Enter your current password"
                value={passwordData.currentPassword}
                onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                error={passwordErrors.currentPassword}
                icon="lock"
                variant="default"
                colorScheme="primary"
                size="md"
                helperText="Enter your current password to verify your identity"
              />

              <AttractiveInput
                type="password"
                label="New Password"
                placeholder="Enter your new password"
                value={passwordData.newPassword}
                onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                error={passwordErrors.newPassword}
                icon="lock"
                variant="default"
                colorScheme="primary"
                size="md"
                helperText="Password must be at least 8 characters long"
              />

              <AttractiveInput
                type="password"
                label="Confirm New Password"
                placeholder="Confirm your new password"
                value={passwordData.confirmPassword}
                onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                error={passwordErrors.confirmPassword}
                icon="lock"
                variant="default"
                colorScheme="primary"
                size="md"
                helperText="Re-enter your new password to confirm"
              />
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-red-200 shadow-md hover:shadow-lg transition-all duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-sm text-foreground">Password Requirements</h4>
                  <ul className="text-xs text-muted-foreground mt-1 space-y-1">
                    <li>• At least 8 characters long</li>
                    <li>• Must be different from current password</li>
                    <li>• Consider using a mix of letters, numbers, and symbols</li>
                  </ul>
                </div>
                <Button
                  onClick={handleChangePassword}
                  disabled={isChangingPassword || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
                  className="flex items-center gap-2 border-2 border-red-300 hover:border-red-400 transition-all duration-200 font-semibold"
                >
                  {isChangingPassword ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <LuKey className="h-4 w-4" />
                  )}
                  {isChangingPassword ? 'Changing...' : 'Change Password'}
                </Button>
              </div>
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
      case 'email':
        return renderEmailSettings();
      case 'payment':
        return renderPaymentSettings();
      default:
        return renderGeneralSettings();
    }
  };

  return (
    <AdminRoleShell>
      <main className="relative z-10 p-2 sm:p-4">
        <WelcomeSection 
          title="System Settings"
          description="Configure and manage your LMS system settings"
        />

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Settings Navigation */}
          <div className="lg:w-64 flex-shrink-0">
            <PageSection
              title="Settings"
              description="Configure your system preferences"
              className="bg-gradient-to-br from-slate-50 via-white to-gray-50 border-2 border-slate-200 shadow-lg hover:shadow-xl transition-all duration-200"
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
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all duration-200 rounded-lg border-2 ${
                        isActive
                          ? 'text-white shadow-lg'
                          : 'border-transparent'
                      }`}
                      style={isActive ? {
                        background: "linear-gradient(135deg, #EC4899 0%, #A855F7 100%)",
                        borderColor: '#A855F7',
                        boxShadow: "0 4px 15px rgba(236, 72, 153, 0.3)",
                      } : {}}
                      onMouseEnter={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.background = "linear-gradient(135deg, rgba(236, 72, 153, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%)";
                          e.currentTarget.style.borderColor = 'rgba(123, 44, 191, 0.2)';
                          e.currentTarget.style.boxShadow = "0 2px 8px rgba(123, 44, 191, 0.1)";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.background = 'transparent';
                          e.currentTarget.style.borderColor = 'transparent';
                          e.currentTarget.style.boxShadow = 'none';
                        }
                      }}
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
          </div>

          {/* Settings Content */}
          <div className="flex-1">
            <div className="space-y-6">
              {renderTabContent()}
              
              {/* Error Display */}
              {error && (
                <PageSection
                  title="Error"
                  description={error}
                  className="bg-gradient-to-br from-red-50 via-white to-pink-50 border-2 border-red-200 shadow-lg hover:shadow-xl transition-all duration-200"
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
                className="bg-gradient-to-br from-emerald-50 via-white to-teal-50 border-2 border-emerald-200 shadow-lg hover:shadow-xl transition-all duration-200"
                actions={
                  <div className="flex items-center gap-3">
                    {saveStatus === 'saved' && (
                      <Badge variant="default" className="flex items-center gap-1 bg-emerald-500 hover:bg-emerald-600">
                        <CheckCircle className="h-3 w-3" />
                        Saved
                      </Badge>
                    )}
                    {saveStatus === 'error' && (
                      <Badge variant="destructive" className="flex items-center gap-1 bg-red-500 hover:bg-red-600">
                        <AlertTriangle className="h-3 w-3" />
                        Error
                      </Badge>
                    )}
                    <Button 
                      onClick={() => handleReset(activeTab)}
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2 border-2 border-red-300 hover:border-red-400 hover:bg-red-50 transition-all duration-200 font-semibold"
                    >
                      <LuRotateCcw className="h-4 w-4 text-red-600" />
                      Reset
                    </Button>
                    <Button 
                      onClick={handleSave} 
                      disabled={!hasChanges || isLoading || saveStatus === 'saving'}
                      className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                      {isLoading || saveStatus === 'saving' ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4" />
                      )}
                      {saveStatus === 'saving' ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                }
              >
                <div className="text-center text-sm text-muted-foreground">
                  {hasChanges ? 'Click "Save Changes" to apply your modifications' : 'All settings have been saved successfully'}
                </div>
              </PageSection>
            </div>
          </div>
        </div>
      </main>
    </AdminRoleShell>
  );
}

export default function AdminSettings() {
  return (
    <AdminPageWrapper>
      <SettingsPageContent />
    </AdminPageWrapper>
  );
}

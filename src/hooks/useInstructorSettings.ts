import { useState, useEffect, useCallback } from 'react';

interface InstructorSettings {
  displayName: string;
  email: string;
  profileVisibility: boolean;
  bio: string;
  expertise: string;
  teachingExperience: number;
  allowStudentMessages: boolean;
  showContactInfo: boolean;
  preferredEmail: string;
  emailSignature: string;
  courseNotifications: boolean;
  studentNotifications: boolean;
  emailNotifications: boolean;
}

interface AllSettings {
  instructor?: InstructorSettings;
}

interface UseInstructorSettingsReturn {
  settings: AllSettings;
  isLoading: boolean;
  error: string | null;
  saveStatus: 'idle' | 'saving' | 'saved' | 'error';
  updateSettings: (category: string, newSettings: any) => Promise<void>;
  saveAllSettings: (allSettings: AllSettings) => Promise<void>;
  resetSettings: (category?: string) => Promise<void>;
}

const defaultInstructorSettings: InstructorSettings = {
  displayName: '',
  email: '',
  profileVisibility: true,
  bio: '',
  expertise: '',
  teachingExperience: 0,
  allowStudentMessages: true,
  showContactInfo: true,
  preferredEmail: '',
  emailSignature: '',
  courseNotifications: true,
  studentNotifications: true,
  emailNotifications: true,
};

export default function useInstructorSettings(): UseInstructorSettingsReturn {
  const [settings, setSettings] = useState<AllSettings>({
    instructor: defaultInstructorSettings
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  const loadSettings = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Loading instructor settings...');
      const response = await fetch('/api/instructor/settings', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', errorText);
        throw new Error(`Failed to load settings: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Settings data:', data);
      
      if (data.success) {
        // If no settings exist, use defaults
        const settingsData = data.data;
        if (!settingsData || Object.keys(settingsData).length === 0) {
          console.log('No settings found, using defaults');
          setSettings({
            instructor: defaultInstructorSettings
          });
        } else {
          setSettings(settingsData);
        }
      } else {
        throw new Error(data.error || 'Failed to load settings');
      }
    } catch (err) {
      console.error('Error loading instructor settings:', err);
      setError(err instanceof Error ? err.message : 'Failed to load settings');
      // Set default settings on error
      setSettings({
        instructor: defaultInstructorSettings
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateSettings = useCallback(async (category: string, newSettings: any) => {
    setSaveStatus('saving');
    setError(null);
    
    try {
      const response = await fetch('/api/instructor/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          category,
          settings: newSettings
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update settings');
      }

      const data = await response.json();
      
      if (data.success) {
        setSettings(prev => ({
          ...prev,
          [category]: newSettings
        }));
        setSaveStatus('saved');
      } else {
        throw new Error(data.error || 'Failed to update settings');
      }
    } catch (err) {
      console.error('Error updating instructor settings:', err);
      setError(err instanceof Error ? err.message : 'Failed to update settings');
      setSaveStatus('error');
    }
  }, []);

  const saveAllSettings = useCallback(async (allSettings: AllSettings) => {
    setSaveStatus('saving');
    setError(null);
    
    try {
      console.log('Saving instructor settings:', allSettings);
      
      const response = await fetch('/api/instructor/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          settings: allSettings
        }),
      });

      console.log('Save response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Save API Error:', errorText);
        throw new Error(`Failed to save settings: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('Save response data:', data);
      
      if (data.success) {
        setSettings(allSettings);
        setSaveStatus('saved');
      } else {
        throw new Error(data.error || 'Failed to save settings');
      }
    } catch (err) {
      console.error('Error saving instructor settings:', err);
      setError(err instanceof Error ? err.message : 'Failed to save settings');
      setSaveStatus('error');
    }
  }, []);

  const resetSettings = useCallback(async (category?: string) => {
    setSaveStatus('saving');
    setError(null);
    
    try {
      const url = category 
        ? `/api/instructor/settings?category=${category}`
        : '/api/instructor/settings';
        
      const response = await fetch(url, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to reset settings');
      }

      const data = await response.json();
      
      if (data.success) {
        // Reload settings after reset
        await loadSettings();
        setSaveStatus('saved');
      } else {
        throw new Error(data.error || 'Failed to reset settings');
      }
    } catch (err) {
      console.error('Error resetting instructor settings:', err);
      setError(err instanceof Error ? err.message : 'Failed to reset settings');
      setSaveStatus('error');
    }
  }, [loadSettings]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  // Fallback: if loading takes too long, show default settings
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (isLoading) {
        console.log('Loading timeout, showing default settings');
        setSettings({
          instructor: defaultInstructorSettings
        });
        setIsLoading(false);
      }
    }, 5000); // 5 second timeout

    return () => clearTimeout(timeout);
  }, [isLoading]);

  return {
    settings,
    isLoading,
    error,
    saveStatus,
    updateSettings,
    saveAllSettings,
    resetSettings,
  };
}

import { useState, useEffect } from 'react';

interface StudentSettings {
  displayName: string;
  email: string;
  profileVisibility: boolean;
  bio: string;
  interests: string;
  learningGoals: string;
  allowInstructorMessages: boolean;
  showProgress: boolean;
  preferredEmail: string;
  emailSignature: string;
  courseNotifications: boolean;
  assignmentNotifications: boolean;
  emailNotifications: boolean;
  reminderNotifications: boolean;
}

interface Settings {
  student: StudentSettings;
}

type SaveStatus = 'idle' | 'saving' | 'success' | 'error';

const defaultStudentSettings: StudentSettings = {
  displayName: '',
  email: '',
  profileVisibility: true,
  bio: '',
  interests: '',
  learningGoals: '',
  allowInstructorMessages: true,
  showProgress: true,
  preferredEmail: '',
  emailSignature: '',
  courseNotifications: true,
  assignmentNotifications: true,
  emailNotifications: true,
  reminderNotifications: true,
};

export default function useStudentSettings() {
  const [settings, setSettings] = useState<Settings>({
    student: defaultStudentSettings
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');

  // Fetch settings
  const fetchSettings = async () => {
    try {
      console.log('useStudentSettings: Fetching settings...');
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/student/settings');
      console.log('useStudentSettings: API response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('useStudentSettings: API error response:', errorText);
        throw new Error(`Failed to load settings: ${response.status} ${errorText}`);
      }
      
      const data = await response.json();
      console.log('useStudentSettings: API response data:', data);
      
      if (data.student) {
        setSettings(data);
        console.log('useStudentSettings: Settings loaded successfully');
      } else {
        console.log('useStudentSettings: No settings data, using defaults');
        setSettings({ student: defaultStudentSettings });
      }
      
    } catch (err) {
      console.error('useStudentSettings: Error fetching settings:', err);
      setError(err instanceof Error ? err.message : 'Failed to load settings');
      // Use default settings on error
      setSettings({ student: defaultStudentSettings });
    } finally {
      setIsLoading(false);
    }
  };

  // Update a specific setting
  const updateSettings = async (category: string, key: string, value: any) => {
    try {
      const response = await fetch('/api/student/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          settings: {
            [key]: value
          }
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update setting');
      }

      const data = await response.json();
      setSettings(prev => ({
        ...prev,
        [category]: {
          ...prev[category as keyof Settings],
          [key]: value
        }
      }));
    } catch (err) {
      console.error('Error updating setting:', err);
      setError(err instanceof Error ? err.message : 'Failed to update setting');
    }
  };

  // Save all settings
  const saveAllSettings = async (allSettings: Settings) => {
    try {
      setSaveStatus('saving');
      setError(null);
      
      const response = await fetch('/api/student/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          settings: allSettings.student
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to save settings: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      setSettings(allSettings);
      setSaveStatus('success');
      
      // Reset success status after 2 seconds
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (err) {
      console.error('Error saving settings:', err);
      setError(err instanceof Error ? err.message : 'Failed to save settings');
      setSaveStatus('error');
    }
  };

  // Reset settings
  const resetSettings = async (category?: string) => {
    try {
      if (category) {
        // Reset specific category
        setSettings(prev => ({
          ...prev,
          [category]: defaultStudentSettings
        }));
      } else {
        // Reset all settings
        setSettings({ student: defaultStudentSettings });
      }
      setError(null);
    } catch (err) {
      console.error('Error resetting settings:', err);
      setError(err instanceof Error ? err.message : 'Failed to reset settings');
    }
  };

  // Load settings on mount
  useEffect(() => {
    fetchSettings();
    
    // Add timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      if (isLoading) {
        console.log('useStudentSettings: Loading timeout, using default settings');
        setSettings({ student: defaultStudentSettings });
        setIsLoading(false);
      }
    }, 5000);
    
    return () => clearTimeout(timeout);
  }, []);

  return {
    settings,
    isLoading,
    error,
    saveStatus,
    updateSettings,
    saveAllSettings,
    resetSettings,
    refetch: fetchSettings
  };
}

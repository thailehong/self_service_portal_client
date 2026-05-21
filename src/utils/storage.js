const SETTINGS_KEY = 'employee-portal.settings';

export const defaultPreferences = {
  themeMode: 'light',
  primaryColor: '#0032FF',
  language: 'en',
  sidebarCollapsed: false,
  dashboardSectionOrder: [
    'user-info',
    'notifications',
    'events-training',
    'department-updates',
  ],
  dashboardHiddenSections: [],
};

export function loadPreferences() {
  if (typeof window === 'undefined') {
    return defaultPreferences;
  }

  try {
    const raw = window.localStorage.getItem(SETTINGS_KEY);
    if (!raw) {
      return defaultPreferences;
    }

    return {
      ...defaultPreferences,
      ...JSON.parse(raw),
    };
  } catch {
    return defaultPreferences;
  }
}

export function savePreferences(preferences) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(preferences));
}

import { createSlice } from '@reduxjs/toolkit';
import { defaultPreferences, loadPreferences } from '../../utils/storage';

const initialState = {
  ...defaultPreferences,
  ...loadPreferences(),
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setThemeMode: (state, action) => {
      state.themeMode = action.payload;
    },
    toggleThemeMode: (state) => {
      state.themeMode = state.themeMode === 'light' ? 'dark' : 'light';
    },
    setPrimaryColor: (state, action) => {
      state.primaryColor = action.payload;
    },
    setLanguage: (state, action) => {
      state.language = action.payload;
    },
    setSidebarCollapsed: (state, action) => {
      state.sidebarCollapsed = action.payload;
    },
    toggleSidebarCollapsed: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
    setDashboardSectionOrder: (state, action) => {
      state.dashboardSectionOrder = action.payload;
    },
    setDashboardHiddenSections: (state, action) => {
      state.dashboardHiddenSections = action.payload;
    },
    toggleDashboardSectionVisibility: (state, action) => {
      const sectionId = action.payload;

      if (state.dashboardHiddenSections.includes(sectionId)) {
        state.dashboardHiddenSections = state.dashboardHiddenSections.filter(
          (id) => id !== sectionId,
        );
        return;
      }

      state.dashboardHiddenSections.push(sectionId);
    },
  },
});

export const {
  setThemeMode,
  toggleThemeMode,
  setPrimaryColor,
  setLanguage,
  setSidebarCollapsed,
  toggleSidebarCollapsed,
  setDashboardSectionOrder,
  setDashboardHiddenSections,
  toggleDashboardSectionVisibility,
} = settingsSlice.actions;

export const selectSettings = (state) => state.settings;
export default settingsSlice.reducer;

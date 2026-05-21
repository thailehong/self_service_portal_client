import { useEffect, useMemo } from 'react';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import 'dayjs/locale/vi';
import 'dayjs/locale/en';
import { useAppSelector } from '../hooks/useAppSelector';
import { NotificationsProvider } from '../features/notifications/NotificationsProvider';
import { selectSettings } from '../features/settings/settingsSlice';
import { createAppTheme } from '../theme/createAppTheme';
import { AppSnackbarProvider } from '../components/common/AppSnackbar';
import i18n from '../i18n';

export function AppProviders({ children }) {
  const settings = useAppSelector(selectSettings);
  const theme = useMemo(
    () => createAppTheme({ mode: settings.themeMode, primaryColor: settings.primaryColor }),
    [settings.themeMode, settings.primaryColor]
  );

  useEffect(() => {
    if (i18n.language !== settings.language) {
      void i18n.changeLanguage(settings.language);
    }
  }, [settings.language]);

  return (
    <AppSnackbarProvider>
      <NotificationsProvider>
        <ThemeProvider theme={theme}>
          <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={settings.language === 'vi' ? 'vi' : 'en'}>
            <CssBaseline />
            {children}
          </LocalizationProvider>
        </ThemeProvider>
      </NotificationsProvider>
    </AppSnackbarProvider>
  );
}

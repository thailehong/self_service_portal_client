import { Box, Divider, Drawer, IconButton, ListItemButton, Stack, Typography } from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import PaletteRoundedIcon from '@mui/icons-material/PaletteRounded';
import TranslateRoundedIcon from '@mui/icons-material/TranslateRounded';
import DarkModeRoundedIcon from '@mui/icons-material/DarkModeRounded';
import { useTranslation } from 'react-i18next';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { useAppSelector } from '../../hooks/useAppSelector';
import { colorPresets } from '../../theme/tokens';
import { selectSettings, setLanguage, setPrimaryColor, toggleThemeMode } from '../../features/settings/settingsSlice';
import { AppSwitchField } from '../forms/AppSwitchField';
import { SectionCard } from './SectionCard';
import { useNotifier } from '../../hooks/useNotifier';

export function SettingsSidebar({ open, onClose }) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const settings = useAppSelector(selectSettings);
  const { notify } = useNotifier();

  const handleThemeToggle = () => {
    dispatch(toggleThemeMode());
    notify({ message: t('notifications.themeUpdated') });
  };

  const handleLanguageChange = (language) => {
    dispatch(setLanguage(language));
    notify({ message: t('notifications.languageUpdated') });
  };

  const handleColorChange = (color) => {
    dispatch(setPrimaryColor(color));
    notify({ message: t('notifications.themeUpdated') });
  };

  return (
    <Drawer anchor="right" open={open} onClose={onClose} sx={{ '& .MuiDrawer-paper': { width: { xs: '100%', sm: 420 }, p: 2 } }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ px: 1, py: 1.5 }}>
        <Box>
          <Typography variant="h5">{t('settings.title')}</Typography>
          <Typography color="text.secondary">{t('settings.sidebarDescription')}</Typography>
        </Box>
        <IconButton onClick={onClose}>
          <CloseRoundedIcon />
        </IconButton>
      </Stack>
      <Divider sx={{ mb: 2 }} />
      <Stack spacing={2}>
        <SectionCard title={t('settings.appearance')} subtitle={t('settings.appearanceDescription')}>
          <Stack spacing={2.5}>
            <AppSwitchField
              label={t('settings.themeMode')}
              checked={settings.themeMode === 'dark'}
              onChange={handleThemeToggle}
            />
            <Stack spacing={1}>
              <Stack direction="row" spacing={1} alignItems="center">
                <DarkModeRoundedIcon color="primary" fontSize="small" />
                <Typography variant="subtitle2">{t('settings.themeMode')}</Typography>
              </Stack>
              <Typography variant="body2" color="text.secondary">
                {settings.themeMode === 'dark' ? t('settings.dark') : t('settings.light')}
              </Typography>
            </Stack>
          </Stack>
        </SectionCard>

        <SectionCard title={t('settings.primaryColor')} subtitle={t('settings.primaryColorDescription')}>
          <Stack spacing={1}>
            {colorPresets.map((color) => (
              <ListItemButton
                key={color}
                selected={settings.primaryColor === color}
                onClick={() => handleColorChange(color)}
                sx={{ borderRadius: 3 }}
              >
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Box sx={{ width: 16, height: 16, borderRadius: '50%', bgcolor: color }} />
                  <PaletteRoundedIcon fontSize="small" color="action" />
                  <Typography variant="body2">{color}</Typography>
                </Stack>
              </ListItemButton>
            ))}
          </Stack>
        </SectionCard>

        <SectionCard title={t('settings.language')} subtitle={t('settings.languageDescription')}>
          <Stack spacing={1}>
            {[
              { value: 'en', label: t('languages.en') },
              { value: 'vi', label: t('languages.vi') },
            ].map((language) => (
              <ListItemButton
                key={language.value}
                selected={settings.language === language.value}
                onClick={() => handleLanguageChange(language.value)}
                sx={{ borderRadius: 3 }}
              >
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <TranslateRoundedIcon fontSize="small" color="action" />
                  <Typography variant="body2">{language.label}</Typography>
                </Stack>
              </ListItemButton>
            ))}
          </Stack>
        </SectionCard>
      </Stack>
    </Drawer>
  );
}

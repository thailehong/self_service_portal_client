import { IconButton, Tooltip } from '@mui/material';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import { useTranslation } from 'react-i18next';

export function SettingsLauncher({ onClick, color = 'inherit', sx }) {
  const { t } = useTranslation();

  return (
    <Tooltip title={t('settings.title')}>
      <IconButton onClick={onClick} color={color} sx={sx}>
        <SettingsRoundedIcon />
      </IconButton>
    </Tooltip>
  );
}

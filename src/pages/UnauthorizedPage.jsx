import AdminPanelSettingsRoundedIcon from '@mui/icons-material/AdminPanelSettingsRounded';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { EmptyState } from '../components/common/EmptyState';
import { PageContainer } from '../components/layout/PageContainer';

export function UnauthorizedPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <PageContainer>
      <EmptyState
        icon={<AdminPanelSettingsRoundedIcon color="primary" sx={{ fontSize: 48 }} />}
        title={t('states.unauthorizedTitle')}
        description={t('states.unauthorizedDescription')}
        actionLabel={t('pages.unauthorizedAction')}
        onAction={() => navigate('/')}
      />
    </PageContainer>
  );
}

import SearchOffRoundedIcon from '@mui/icons-material/SearchOffRounded';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { EmptyState } from '../components/common/EmptyState';
import { PageContainer } from '../components/layout/PageContainer';

export function NotFoundPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <PageContainer>
      <EmptyState
        icon={<SearchOffRoundedIcon color="primary" sx={{ fontSize: 48 }} />}
        title={t('states.notFoundTitle')}
        description={t('states.notFoundDescription')}
        actionLabel={t('pages.notFoundAction')}
        onAction={() => navigate('/dashboard')}
      />
    </PageContainer>
  );
}

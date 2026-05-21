import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import ScheduleRoundedIcon from '@mui/icons-material/ScheduleRounded';
import AssignmentTurnedInRoundedIcon from '@mui/icons-material/AssignmentTurnedInRounded';
import { Alert, Box, Button, Chip, Stack, Typography } from '@mui/material';
import { Navigate, useLocation } from 'react-router-dom';
import { matchPath } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { sidebarSectionItems } from '../app/navigation';
import { PageHeader } from '../components/layout/PageHeader';
import { SectionCard } from '../components/layout/SectionCard';
import { StatCard } from '../components/layout/StatCard';
import { EmptyState } from '../components/common/EmptyState';

function getSectionLabel(section, t) {
  return section.labelKey ? t(section.labelKey) : section.label;
}

export function WorkspaceSectionPage() {
  const { t } = useTranslation();
  const location = useLocation();

  const section = sidebarSectionItems.find((item) =>
    matchPath({ path: item.to, end: true }, location.pathname)
  );

  if (!section) {
    return <Navigate to="/404" replace />;
  }

  const parentLabel = section.parentLabelKey
    ? t(section.parentLabelKey)
    : section.parentLabel || t('dashboard.breadcrumbs.root');
  const sectionLabel = getSectionLabel(section, t);
  const sectionSubtitle = t('sectionPage.subtitle', { section: sectionLabel, parent: parentLabel });
  const workflowItems = t('sectionPage.workflowItems', {
    returnObjects: true,
    section: sectionLabel,
    parent: parentLabel,
  });

  const metrics = [
    {
      title: t('sectionPage.metrics.backlogTitle'),
      value: section.meta?.metricValues?.[0] || '0',
      trend: t('sectionPage.metrics.backlogTrend', { section: sectionLabel }),
      icon: <DashboardRoundedIcon />,
    },
    {
      title: t('sectionPage.metrics.ownersTitle'),
      value: section.meta?.metricValues?.[1] || '0',
      trend: t('sectionPage.metrics.ownersTrend', { parent: parentLabel }),
      icon: <AssignmentTurnedInRoundedIcon />,
    },
    {
      title: t('sectionPage.metrics.slaTitle'),
      value: section.meta?.metricValues?.[2] || '0',
      trend: t('sectionPage.metrics.slaTrend', { section: sectionLabel }),
      icon: <ScheduleRoundedIcon />,
    },
  ];

  return (
    <Stack spacing={3.5}>
      <PageHeader
        breadcrumbs={[
          { label: t('dashboard.breadcrumbs.root'), to: '/dashboard' },
          ...(section.parentId ? [{ label: parentLabel }] : []),
          { label: sectionLabel },
        ]}
        title={sectionLabel}
        subtitle={sectionSubtitle}
        actions={
          <Chip
            label={t('sectionPage.badge', { parent: parentLabel })}
            color="primary"
            variant="outlined"
          />
        }
      />

      <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', md: 'repeat(3, minmax(0, 1fr))' } }}>
        {metrics.map((metric) => (
          <StatCard
            key={metric.title}
            title={metric.title}
            value={metric.value}
            trend={metric.trend}
            icon={metric.icon}
            color={section.meta?.accentColor || 'primary.main'}
          />
        ))}
      </Box>

      <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', xl: '1.1fr 0.9fr' } }}>
        <SectionCard title={t('sectionPage.workflowTitle')} subtitle={t('sectionPage.workflowSubtitle', { section: sectionLabel })}>
          <Stack spacing={1.5}>
            {workflowItems.map((item) => (
              <Box
                key={item.title}
                sx={{
                  p: 2.25,
                  borderRadius: 4,
                  bgcolor: 'background.default',
                  border: (theme) => `1px solid ${theme.palette.divider}`,
                }}
              >
                <Typography variant="subtitle1">{item.title}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
                  {item.description}
                </Typography>
              </Box>
            ))}
          </Stack>
        </SectionCard>

        <SectionCard
          title={t('sectionPage.queueTitle')}
          subtitle={t('sectionPage.queueSubtitle', { section: sectionLabel })}
          action={<Button variant="outlined">{t('actions.viewAll')}</Button>}
        >
          <Stack spacing={2}>
            <Alert severity="info" variant="outlined">
              {t('sectionPage.infoBanner', { section: sectionLabel })}
            </Alert>
            <EmptyState
              title={t('sectionPage.emptyTitle', { section: sectionLabel })}
              description={t('sectionPage.emptyDescription', { parent: parentLabel })}
              actionLabel={t('sectionPage.emptyAction')}
              onAction={() => window.location.reload()}
            />
          </Stack>
        </SectionCard>
      </Box>
    </Stack>
  );
}

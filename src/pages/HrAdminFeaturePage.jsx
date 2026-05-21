import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { Alert, Box, Button, Chip, Stack, Typography } from '@mui/material';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, Navigate, useParams } from 'react-router-dom';
import { PageHeader } from '../components/layout/PageHeader';
import { SectionCard } from '../components/layout/SectionCard';
import { StatCard } from '../components/layout/StatCard';
import { getHrAdminFeatureById } from '../features/hrAdmin/hrAdminCatalog';

export function HrAdminFeaturePage() {
  const { t } = useTranslation();
  const { featureId } = useParams();
  const feature = useMemo(() => getHrAdminFeatureById(featureId, t), [featureId, t]);

  if (!feature) {
    return <Navigate to="/404" replace />;
  }

  const Icon = feature.icon;

  return (
    <Stack spacing={3.5}>
      <PageHeader
        breadcrumbs={[
          { label: t('dashboard.breadcrumbs.root'), to: '/dashboard' },
          { label: t('nav.hr_admin'), to: '/dashboard/hr-admin' },
          { label: feature.title },
        ]}
        title={feature.title}
        subtitle={feature.description}
        actions={
          <Chip
            label={feature.category}
            color="primary"
            variant="outlined"
            icon={<Icon />}
          />
        }
      />

      <Box
        sx={{
          display: 'grid',
          gap: 3,
          gridTemplateColumns: { xs: '1fr', md: 'repeat(3, minmax(0, 1fr))' },
        }}
      >
        {feature.metrics.map((metric) => {
          const MetricIcon = metric.icon;

          return (
            <StatCard
              key={metric.title}
              title={metric.title}
              value={metric.value}
              trend={metric.trend}
              icon={<MetricIcon />}
              color={metric.color}
            />
          );
        })}
      </Box>

      <Box
        sx={{
          display: 'grid',
          gap: 3,
          gridTemplateColumns: { xs: '1fr', xl: '1.1fr 0.9fr' },
        }}
      >
        <SectionCard
          title={t('hrAdmin.featureOverviewTitle', { defaultValue: 'Service Overview' })}
          subtitle={t('hrAdmin.featureOverviewSubtitle', {
            defaultValue: 'Key operating guidance for this workflow before it is connected to live backend data.',
          })}
        >
          <Stack spacing={1.5}>
            {feature.highlights.map((item) => (
              <Stack
                key={item}
                direction="row"
                spacing={1.25}
                alignItems="flex-start"
                sx={{
                  p: 2,
                  borderRadius: 3,
                  bgcolor: 'background.default',
                  border: (theme) => `1px solid ${theme.palette.divider}`,
                }}
              >
                <CheckCircleRoundedIcon sx={{ color: feature.accentColor, mt: 0.15 }} fontSize="small" />
                <Typography variant="body2" color="text.secondary">
                  {item}
                </Typography>
              </Stack>
            ))}
          </Stack>
        </SectionCard>

        <SectionCard
          title={t('hrAdmin.quickActionsTitle', { defaultValue: 'Quick Actions' })}
          subtitle={t('hrAdmin.quickActionsSubtitle', {
            defaultValue: 'Navigate back to the directory or keep this placeholder page ready for future API integration.',
          })}
          action={<InfoOutlinedIcon color="action" />}
        >
          <Stack spacing={2}>
            <Alert severity="info" variant="outlined">
              {t('hrAdmin.featureInfoBanner', {
                defaultValue:
                  'This service page is prepared for real workflow data, forms, and approvals once the related API is connected.',
              })}
            </Alert>
            <Stack spacing={1.25}>
              <Button
                component={Link}
                to="/dashboard/hr-admin"
                variant="contained"
                startIcon={<ArrowBackRoundedIcon />}
              >
                {t('hrAdmin.backToDirectory', { defaultValue: 'Back to HR & Admin' })}
              </Button>
              <Button component={Link} to="/dashboard" variant="outlined">
                {t('dashboard.breadcrumbs.root')}
              </Button>
            </Stack>
            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
              <Chip label={feature.status} size="small" color="primary" />
              {feature.meta.map((item) => (
                <Chip key={item} label={item} size="small" variant="outlined" />
              ))}
            </Stack>
          </Stack>
        </SectionCard>
      </Box>

      <SectionCard
        title={t('hrAdmin.workflowTitle', { defaultValue: 'Typical Workflow' })}
        subtitle={t('hrAdmin.workflowSubtitle', {
          defaultValue: 'A simple sequence the team can follow when the live service is wired into production data.',
        })}
      >
        <Box
          sx={{
            display: 'grid',
            gap: 2,
            gridTemplateColumns: { xs: '1fr', md: 'repeat(3, minmax(0, 1fr))' },
          }}
        >
          {feature.workflowSteps.map((step, index) => (
            <Box
              key={step}
              sx={{
                p: 2.5,
                borderRadius: 3,
                border: (theme) => `1px solid ${theme.palette.divider}`,
                bgcolor: 'background.default',
              }}
            >
              <Typography variant="overline" color="text.secondary">
                {t('hrAdmin.stepLabel', { defaultValue: 'Step' })} {index + 1}
              </Typography>
              <Typography variant="body1" sx={{ mt: 0.75 }}>
                {step}
              </Typography>
            </Box>
          ))}
        </Box>
      </SectionCard>
    </Stack>
  );
}

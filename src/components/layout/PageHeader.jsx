import { Stack, Typography } from '@mui/material';
import { BreadcrumbsNav } from './BreadcrumbsNav';

export function PageHeader({ breadcrumbs, title, subtitle, actions }) {
  return (
    <Stack spacing={2.2} sx={{ mb: 4 }}>
      {breadcrumbs?.length ? <BreadcrumbsNav items={breadcrumbs} /> : null}
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        justifyContent="space-between"
        spacing={2.5}
        alignItems={{ md: 'center' }}
      >
        <Stack spacing={1} sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="h3">{title}</Typography>
          {subtitle ? (
            <Typography color="text.secondary" sx={{ maxWidth: 840 }}>
              {subtitle}
            </Typography>
          ) : null}
        </Stack>
        {actions ? <Stack sx={{ flexShrink: 0, alignItems: { md: 'flex-end' } }}>{actions}</Stack> : null}
      </Stack>
    </Stack>
  );
}

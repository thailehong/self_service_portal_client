import { Stack, Typography } from '@mui/material';
import { BreadcrumbsNav } from './BreadcrumbsNav';

export function PageHeader({ breadcrumbs, title, subtitle, actions }) {
  const hasHeaderContent = title || subtitle || actions;

  return (
    <Stack spacing={2.2} sx={{ mb: 4 }}>
      {breadcrumbs?.length ? <BreadcrumbsNav items={breadcrumbs} /> : null}
      {hasHeaderContent ? (
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          justifyContent="space-between"
          spacing={2.5}
          alignItems={{ md: 'center' }}
        >
          {(title || subtitle) ? (
            <Stack spacing={1} sx={{ flex: 1, minWidth: 0 }}>
              {title ? <Typography variant="h3">{title}</Typography> : null}
              {subtitle ? (
                <Typography color="text.secondary" sx={{ maxWidth: 840 }}>
                  {subtitle}
                </Typography>
              ) : null}
            </Stack>
          ) : null}
          {actions ? <Stack sx={{ flexShrink: 0, alignItems: { md: 'flex-end' } }}>{actions}</Stack> : null}
        </Stack>
      ) : null}
    </Stack>
  );
}

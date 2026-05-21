import { Card, CardContent, Stack, Typography } from '@mui/material';

export function SectionCard({ title, subtitle, action, children, contentSx, cardSx }) {
  return (
    <Card sx={cardSx}>
      <CardContent sx={{ p: 3, '&:last-child': { pb: 3 }, ...contentSx }}>
        {(title || subtitle || action) && (
          <Stack direction="row" spacing={2} justifyContent="space-between" alignItems="flex-start" sx={{ mb: 3 }}>
            <Stack spacing={0.75} sx={{ flex: 1, minWidth: 0 }}>
              {title && <Typography variant="h5">{title}</Typography>}
              {subtitle && <Typography color="text.secondary">{subtitle}</Typography>}
            </Stack>
            {action ? <Stack sx={{ flexShrink: 0, alignItems: 'flex-end' }}>{action}</Stack> : null}
          </Stack>
        )}
        {children}
      </CardContent>
    </Card>
  );
}

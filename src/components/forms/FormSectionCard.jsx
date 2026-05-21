import { Card, CardContent, Stack, Typography } from '@mui/material';

export function FormSectionCard({ title, subtitle, children }) {
  return (
    <Card>
      <CardContent sx={{ p: 3 }}>
        <Stack spacing={2.5}>
          <Stack spacing={0.75}>
            <Typography variant="h6">{title}</Typography>
            {subtitle && <Typography color="text.secondary">{subtitle}</Typography>}
          </Stack>
          {children}
        </Stack>
      </CardContent>
    </Card>
  );
}

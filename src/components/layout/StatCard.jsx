import { Avatar, Card, CardContent, Stack, Typography } from '@mui/material';

export function StatCard({ title, value, trend, icon, color = 'primary.main' }) {
  return (
    <Card>
      <CardContent sx={{ p: 3 }}>
        <Stack spacing={2}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography color="text.secondary" sx={{ flex: 1, minWidth: 0 }}>
              {title}
            </Typography>
            <Stack sx={{ flexShrink: 0, alignItems: 'flex-end' }}>
              <Avatar sx={{ bgcolor: `${color}`, color: '#fff', width: 42, height: 42 }}>
                {icon}
              </Avatar>
            </Stack>
          </Stack>
          <Typography variant="h3">{value}</Typography>
          <Typography variant="body2" color="text.secondary">
            {trend}
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
}

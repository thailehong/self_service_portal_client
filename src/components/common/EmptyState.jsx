import { Button, Paper, Stack, Typography } from '@mui/material';
import InboxRoundedIcon from '@mui/icons-material/InboxRounded';

export function EmptyState({ title, description, actionLabel, onAction, icon }) {
  return (
    <Paper sx={{ p: 4, textAlign: 'center' }}>
      <Stack spacing={2} alignItems="center">
        {icon || <InboxRoundedIcon color="primary" sx={{ fontSize: 40 }} />}
        <Typography variant="h5">{title}</Typography>
        <Typography color="text.secondary" sx={{ maxWidth: 420 }}>
          {description}
        </Typography>
        {actionLabel && (
          <Button variant="contained" onClick={onAction}>
            {actionLabel}
          </Button>
        )}
      </Stack>
    </Paper>
  );
}

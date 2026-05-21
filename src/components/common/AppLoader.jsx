import { Box, CircularProgress, Stack, Typography } from '@mui/material';

export function AppLoader({ message }) {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
      }}
    >
      <Stack spacing={2} alignItems="center">
        <CircularProgress size={42} thickness={4} />
        <Typography variant="h6">{message}</Typography>
      </Stack>
    </Box>
  );
}

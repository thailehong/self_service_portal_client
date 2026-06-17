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
      <Stack
        direction="row"
        spacing={1.5}
        alignItems="center"
        justifyContent="center"
      >
        <CircularProgress size={24} thickness={4} />
        <Typography variant="h6">{message}</Typography>
      </Stack>
    </Box>
  );
}

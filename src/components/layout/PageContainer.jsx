import { Box } from '@mui/material';

export function PageContainer({ children }) {
  return (
    <Box sx={{ px: { xs: 2, md: 4 }, py: { xs: 2.5, md: 4 }, maxWidth: 1600, mx: 'auto', width: '100%' }}>
      {children}
    </Box>
  );
}

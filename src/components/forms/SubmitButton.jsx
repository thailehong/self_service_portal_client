import { Button, CircularProgress, Stack } from '@mui/material';

export function SubmitButton({ loading = false, children, ...props }) {
  return (
    <Button type="submit" variant="contained" size="large" disabled={loading} {...props}>
      <Stack direction="row" spacing={1.2} alignItems="center">
        {loading ? <CircularProgress size={18} color="inherit" /> : null}
        <span>{children}</span>
      </Stack>
    </Button>
  );
}

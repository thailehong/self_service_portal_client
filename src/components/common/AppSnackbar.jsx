import { createContext, useMemo, useState } from 'react';
import { Alert, Snackbar } from '@mui/material';

export const AppSnackbarContext = createContext({
  notify: () => {},
});

export function AppSnackbarProvider({ children }) {
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const value = useMemo(
    () => ({
      notify: ({ message, severity = 'success' }) => {
        setSnackbar({ open: true, message, severity });
      },
    }),
    []
  );

  return (
    <AppSnackbarContext.Provider value={value}>
      {children}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3200}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        onClose={() => setSnackbar((current) => ({ ...current, open: false }))}
      >
        <Alert
          severity={snackbar.severity}
          variant="filled"
          onClose={() => setSnackbar((current) => ({ ...current, open: false }))}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </AppSnackbarContext.Provider>
  );
}

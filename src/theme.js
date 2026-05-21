import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#0b7285',
      dark: '#084c61',
      light: '#66d9e8',
    },
    secondary: {
      main: '#f08c00',
      dark: '#c56a00',
    },
    background: {
      default: '#edf2f7',
      paper: '#ffffff',
    },
    success: {
      main: '#2b8a3e',
    },
    warning: {
      main: '#f59f00',
    },
    error: {
      main: '#c92a2a',
    },
    text: {
      primary: '#102a43',
      secondary: '#52606d',
    },
  },
  shape: {
    borderRadius: 18,
  },
  typography: {
    fontFamily: 'Aptos, Bahnschrift, "Segoe UI Variable", "Segoe UI", sans-serif',
    h1: {
      fontWeight: 800,
      letterSpacing: '-0.04em',
    },
    h2: {
      fontWeight: 800,
      letterSpacing: '-0.03em',
    },
    h3: {
      fontWeight: 700,
      letterSpacing: '-0.02em',
    },
    h4: {
      fontWeight: 700,
    },
    h5: {
      fontWeight: 700,
    },
    h6: {
      fontWeight: 700,
    },
    button: {
      textTransform: 'none',
      fontWeight: 700,
    },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: '0 24px 80px rgba(16,42,67,0.08)',
          backgroundImage: 'none',
        },
      },
    },
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          borderRadius: 14,
          paddingInline: 18,
          minHeight: 44,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 22,
        },
      },
    },
  },
});

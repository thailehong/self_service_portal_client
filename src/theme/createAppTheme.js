import { alpha, createTheme, darken, lighten } from '@mui/material/styles';
import { radius, shadows } from './tokens';

export function createAppTheme({ mode, primaryColor }) {
  const isDark = mode === 'dark';
  const primaryMain = primaryColor || '#0032FF';

  return createTheme({
    palette: {
      mode,
      primary: {
        main: primaryMain,
        light: lighten(primaryMain, 0.18),
        dark: darken(primaryMain, 0.24),
        contrastText: '#ffffff',
      },
      secondary: {
        main: isDark ? '#7dd3fc' : '#164e63',
      },
      success: {
        main: '#0f9f6e',
      },
      warning: {
        main: '#d97706',
      },
      error: {
        main: '#dc2626',
      },
      info: {
        main: '#0284c7',
      },
      background: {
        default: isDark ? '#081120' : '#f3f6fb',
        paper: isDark ? '#101a2b' : '#ffffff',
      },
      text: {
        primary: isDark ? '#e2e8f0' : '#0f172a',
        secondary: isDark ? '#94a3b8' : '#475569',
      },
      divider: isDark ? alpha('#e2e8f0', 0.08) : alpha('#0f172a', 0.08),
    },
    shape: {
      borderRadius: radius.md,
    },
    spacing: 8,
    typography: {
      fontFamily: '"Noto Sans", Aptos, Bahnschrift, "Segoe UI Variable", "Segoe UI", Arial, sans-serif',
      h1: { fontSize: '3.2rem', fontWeight: 800, letterSpacing: '-0.04em' },
      h2: { fontSize: '2.6rem', fontWeight: 800, letterSpacing: '-0.03em' },
      h3: { fontSize: '2rem', fontWeight: 750, letterSpacing: '-0.025em' },
      h4: { fontSize: '1.6rem', fontWeight: 750 },
      h5: { fontSize: '1.2rem', fontWeight: 700 },
      h6: { fontSize: '1rem', fontWeight: 700 },
      subtitle1: { fontSize: '1rem', fontWeight: 600 },
      body1: { fontSize: '0.98rem', lineHeight: 1.7 },
      body2: { fontSize: '0.9rem', lineHeight: 1.6 },
      button: { textTransform: 'none', fontWeight: 700 },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundImage: isDark
              ? 'radial-gradient(circle at top left, rgba(0, 50, 255, 0.18), transparent 24%), radial-gradient(circle at bottom right, rgba(14, 165, 233, 0.12), transparent 30%)'
              : 'radial-gradient(circle at top left, rgba(0, 50, 255, 0.10), transparent 22%), radial-gradient(circle at bottom right, rgba(14, 165, 233, 0.08), transparent 28%)',
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            boxShadow: isDark ? shadows.dark : shadows.light,
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: radius.lg,
            border: `1px solid ${isDark ? alpha('#e2e8f0', 0.06) : alpha('#0f172a', 0.06)}`,
          },
        },
      },
      MuiButton: {
        defaultProps: {
          disableElevation: true,
        },
        styleOverrides: {
          root: {
            minHeight: 44,
            borderRadius: radius.sm,
            paddingInline: 18,
          },
        },
      },
      MuiTextField: {
        defaultProps: {
          fullWidth: true,
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: radius.sm,
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 999,
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            borderRight: 'none',
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          head: {
            fontWeight: 700,
            color: isDark ? '#cbd5e1' : '#334155',
          },
        },
      },
    },
  });
}

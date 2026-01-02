/* Material Design 3 themed configuration for MUI */
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  spacing: 8,
  typography: {
    fontFamily: 'Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, Noto Sans, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", sans-serif',
    h1: { fontWeight: 800 },
    h2: { fontWeight: 800 },
    h3: { fontWeight: 700 },
    h4: { fontWeight: 700 },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 700 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  shape: {
    borderRadius: 12,
  },
  palette: {
    mode: 'light',
    primary: {
      main: '#E91E63', // Psy-Q pink as primary (MD3 accent)
      light: '#F06292',
      dark: '#C2185B',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#1E88E5',
      light: '#64B5F6',
      dark: '#1565C0',
      contrastText: '#ffffff',
    },
    background: {
      default: '#ffffff',
      paper: '#ffffff',
    },
    text: {
      primary: '#1a1a1a',
      secondary: '#5f6368',
    },
    divider: 'rgba(0,0,0,0.08)',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          paddingLeft: 16,
          paddingRight: 16,
        },
      },
      defaultProps: {
        disableElevation: true,
      },
    },
    MuiPaper: {
      styleOverrides: {
        rounded: {
          borderRadius: 16,
        },
      },
    },
    MuiAppBar: {
      defaultProps: { color: 'inherit', elevation: 0 },
      styleOverrides: {
        root: { borderBottom: '1px solid rgba(0,0,0,0.08)', backdropFilter: 'saturate(180%) blur(8px)' },
      },
    },
    MuiContainer: {
      defaultProps: { maxWidth: 'lg' },
    },
  },
});

export default theme;

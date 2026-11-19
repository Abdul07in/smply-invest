import { createTheme } from "@mui/material/styles";

export const appTheme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#84aaff" },
    secondary: { main: "#3bd3a0" },
    background: { default: "#0b1119", paper: "#111a25" },
    text: { primary: "#ecf2f8", secondary: "#8290a1" },
    success: { main: "#3bd3a0" },
    error: { main: "#f17783" },
    divider: "#233141",
  },
  typography: {
    fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    h1: { fontWeight: 750, letterSpacing: "-0.045em" },
    h2: { fontWeight: 700, letterSpacing: "-0.035em" },
    button: { fontWeight: 650, textTransform: "none" },
  },
  shape: { borderRadius: 10 },
  components: {
    MuiCssBaseline: { styleOverrides: { body: { minHeight: "100vh" } } },
    MuiButton: { styleOverrides: { root: { minHeight: "2.5rem", borderRadius: "0.5625rem" } } },
    MuiTextField: { defaultProps: { fullWidth: true, size: "small" } },
    MuiOutlinedInput: { styleOverrides: { root: { backgroundColor: "rgba(9, 15, 22, .58)" } } },
    MuiPaper: { styleOverrides: { root: { backgroundImage: "none" } } },
  },
});

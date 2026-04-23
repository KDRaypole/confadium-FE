// Backward compatibility — all consumers of useDarkMode and DarkModeProvider
// continue to work via ThemeContext
export { ThemeProvider as DarkModeProvider, useDarkMode } from "./ThemeContext";

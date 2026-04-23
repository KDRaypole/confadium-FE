/** @type {import('tailwindcss').Config} */
export default {
  content: ["./app/**/*.{js,jsx,ts,tsx}"],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          primary: 'rgb(var(--color-primary) / <alpha-value>)',
          'primary-hover': 'rgb(var(--color-primary-hover) / <alpha-value>)',
          secondary: 'rgb(var(--color-secondary) / <alpha-value>)',
          accent: 'rgb(var(--color-accent) / <alpha-value>)',
          sidebar: 'rgb(var(--color-sidebar) / <alpha-value>)',
          'sidebar-text': 'rgb(var(--color-sidebar-text) / <alpha-value>)',
          'sidebar-active': 'rgb(var(--color-sidebar-active) / <alpha-value>)',
          'sidebar-hover': 'rgb(var(--color-sidebar-hover) / <alpha-value>)',
        },
      },
    },
  },
  plugins: [],
}


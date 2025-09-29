import { createTheme } from '@mantine/core';

export const theme = createTheme({
  // Color scheme - 'light' or 'dark' or 'auto'
  defaultRadius: 'xs',

  // Primary color from your color palette
  primaryColor: 'primary',

  // Custom colors
  colors: {
    // Add custom color palettes here
    // https://gemini.google.com/app/9ab7b5b03f5b2b2a
    // Can you suggest a color palette for mantine base on this color `13956f`
    primary: [
      '#e1f8f1', // 0
      '#c6efdf', // 1
      '#a1e5ce', // 2
      '#7adcb8', // 3
      '#56d2a4', // 4
      '#32c991', // 5
      '#13956f', // 6 - Your base color
      '#0f8263', // 7
      '#0a6f57', // 8
      '#055a47', // 9
    ],
    gold: [
      '#fff6e2', // 0
      '#fdf1ce', // 1
      '#fae4a3', // 2
      '#f5d57b', // 3
      '#efc65a', // 4
      '#e9b63a', // 5
      '#B89350', // 6 - Your base color
      '#917740', // 7
      '#6e5a32', // 8
      '#493c24', // 9
    ],
  },

  // Font settings
  fontFamily:
    '"IBM Plex Sans", -apple-system, BlinkMacSystemFont, Roboto, Arial, sans-serif',
  fontFamilyMonospace: 'Monaco, Courier, monospace',

  headings: {
    fontFamily:
      '"IBM Plex Sans", -apple-system, BlinkMacSystemFont, Roboto, Arial, sans-serif',
    fontWeight: '600',
    sizes: {
      h1: { fontSize: '2rem', lineHeight: '1.3' },
      h2: { fontSize: '1.625rem', lineHeight: '1.35' },
      h3: { fontSize: '1.375rem', lineHeight: '1.4' },
      h4: { fontSize: '1.125rem', lineHeight: '1.45' },
      h5: { fontSize: '1rem', lineHeight: '1.5' },
      h6: { fontSize: '0.875rem', lineHeight: '1.5' },
    },
  },

  // Spacing scale
  spacing: {
    xs: '0.625rem',
    sm: '0.75rem',
    md: '1rem',
    lg: '1.25rem',
    xl: '1.5rem',
  },

  // Border radius scale
  radius: {
    xs: '0.125rem',
    sm: '0.25rem',
    md: '0.5rem',
    lg: '1rem',
    xl: '2rem',
  },

  // Shadow definitions
  shadows: {
    xs: '0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.1)',
    sm: '0 1px 3px rgba(0, 0, 0, 0.05), rgba(0, 0, 0, 0.05) 0px 10px 15px -5px, rgba(0, 0, 0, 0.04) 0px 7px 7px -5px',
    md: '0 1px 3px rgba(0, 0, 0, 0.05), rgba(0, 0, 0, 0.05) 0px 20px 25px -5px, rgba(0, 0, 0, 0.04) 0px 10px 10px -5px',
    lg: '0 1px 3px rgba(0, 0, 0, 0.05), rgba(0, 0, 0, 0.05) 0px 28px 23px -7px, rgba(0, 0, 0, 0.04) 0px 12px 12px -7px',
    xl: '0 1px 3px rgba(0, 0, 0, 0.05), rgba(0, 0, 0, 0.05) 0px 36px 28px -7px, rgba(0, 0, 0, 0.04) 0px 17px 17px -7px',
  },

  // Component-specific overrides
  components: {
    Button: {
      defaultProps: {
        radius: 'xs',
      },
    },
    TextInput: {
      defaultProps: {
        radius: 'md',
      },
    },
    Paper: {
      defaultProps: {
        radius: 'md',
        shadow: 'sm',
      },
    },
    Card: {
      defaultProps: {
        radius: 'md',
        shadow: 'sm',
      },
    },
  },
});

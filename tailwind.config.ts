/* Tailwind config — Global Talk Design System (Stitch) */
import type { Config } from 'tailwindcss'
import animatePlugin from 'tailwindcss-animate'
import typographyPlugin from '@tailwindcss/typography'
import aspectRatioPlugin from '@tailwindcss/aspect-ratio'

export default {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: '',
  theme: {
    container: {
      center: true,
      padding: '1.5rem',
      screens: {
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1400px',
      },
    },
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        /* Global Talk Design System Colors */
        gt: {
          primary: '#004ac6',
          'primary-container': '#2563eb',
          'on-primary': '#ffffff',
          'on-primary-container': '#eeefff',
          secondary: '#565e74',
          'secondary-container': '#dae2fd',
          surface: '#f8f9ff',
          'surface-dim': '#cbdbf5',
          'surface-container': '#e5eeff',
          'surface-container-low': '#eff4ff',
          'surface-container-high': '#dce9ff',
          'surface-container-highest': '#d3e4fe',
          'surface-lowest': '#ffffff',
          'on-surface': '#0b1c30',
          'on-surface-variant': '#434655',
          outline: '#737686',
          'outline-variant': '#c3c6d7',
          error: '#ba1a1a',
          'error-container': '#ffdad6',
          'on-error': '#ffffff',
          'on-error-container': '#93000a',
          tertiary: '#515659',
          'tertiary-container': '#696e71',
          background: '#f8f9ff',
          'on-background': '#0b1c30',
        },
        /* Semantic aliases */
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: '#2563eb',
          foreground: '#ffffff',
        },
        secondary: {
          DEFAULT: '#f1f5f9',
          foreground: '#0f172a',
        },
        destructive: {
          DEFAULT: '#ef4444',
          foreground: '#ffffff',
        },
        muted: {
          DEFAULT: '#f1f5f9',
          foreground: '#64748b',
        },
        accent: {
          DEFAULT: '#f1f5f9',
          foreground: '#0f172a',
        },
        card: {
          DEFAULT: '#ffffff',
          foreground: '#0b1c30',
        },
      },
      borderRadius: {
        lg: '8px',
        md: '6px',
        sm: '4px',
      },
      boxShadow: {
        card: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'card-hover': '0 4px 12px rgba(15, 23, 42, 0.05)',
        elevation: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
      },
      transitionProperty: {
        width: 'width',
        height: 'height',
      },
      transitionTimingFunction: {
        apple: 'cubic-bezier(0.42, 0, 0.58, 1)',
      },
    },
  },
  plugins: [animatePlugin, typographyPlugin, aspectRatioPlugin],
} satisfies Config

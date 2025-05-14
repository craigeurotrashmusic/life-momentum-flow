
import type { Config } from "tailwindcss";

export default {
  darkMode: ['attr', 'data-theme'], // Changed to attribute strategy
  content: [
    "./src/**/*.{ts,tsx}", // Simplified content path
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1400px'
      }
    },
    extend: {
      colors: {
        // Momentum OS Palette
        brand: {
          sky: 'hsl(var(--brand-sky))', // Using HSL for Tailwind's opacity modifiers
          mint: 'hsl(var(--brand-mint))',
          ivory: 'hsl(var(--brand-ivory))',
          'teal-900': 'hsl(var(--brand-teal-900))',
          'teal-700': 'hsl(var(--brand-teal-700))',
        },
        accentColor: { // Renamed to avoid conflict with Tailwind's accent
          primary: 'hsl(var(--accent-primary))', // New purple accent
          secondary: 'hsl(var(--accent-secondary))', // Gold highlight
          peach: 'hsl(var(--accent-peach))',
          gold: 'hsl(var(--accent-gold))',
        },
        grey: {
          100: 'hsl(var(--grey-100))',
          600: 'hsl(var(--grey-600))',
        },
        status: {
          success: 'hsl(var(--success))',
          warning: 'hsl(var(--warning))',
          error: 'hsl(var(--error))',
          info: 'hsl(var(--info))',
        },
        chart: {
          'palette-1': 'hsl(var(--brand-mint))',
          'palette-2': 'hsl(var(--brand-sky))',
          'palette-3': 'hsl(var(--accent-primary))', // Now uses accent-primary
          'palette-4': 'hsl(var(--accent-secondary))', // Now uses accent-secondary
        },
        progressRing: {
          complete: 'hsl(var(--accent-primary))', // Now uses accent-primary
          remaining: 'hsl(var(--grey-100))',
        },
        
        // Shadcn UI variables (mapping to new Momentum vars)
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))', // For focus rings
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))', // Maps to accent-primary
          foreground: 'hsl(var(--primary-foreground))'
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))'
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))'
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))'
        },
        accent: { // Shadcn accent, maps to accentColor.secondary (gold)
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))'
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))'
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))'
        },
      },
      fontFamily: {
        sans: ['Inter', 'var(--font-family-base)', 'sans-serif'],
      },
      fontSize: {
        h1: ['var(--font-size-h1)', { lineHeight: '2.5rem' }],
        h2: ['var(--font-size-h2)', { lineHeight: '2.25rem' }],
        h3: ['var(--font-size-h3)', { lineHeight: '2rem' }],
        body: ['var(--font-size-body)', { lineHeight: '1.625rem' }],
        caption: ['var(--font-size-caption)', { lineHeight: '1.25rem' }],
      },
      borderRadius: { // Keep existing, ensure `2xl` is 1rem if that's the target
        lg: 'var(--radius)', // current var(--radius) is 1rem
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        '2xl': '1rem', // Explicitly 1rem as per new styles for cards
      },
      boxShadow: {
        card: '0 4px 12px rgba(0,0,0,0.15)', // New card shadow
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' }
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' }
        },
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        'slide-in': { // Assuming this is the existing slide-in, might need review
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' }
        },
        'slide-up': {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        },
        'card-expand': {
          '0%': { height: 'var(--collapsed-height)', opacity: '0.9' },
          '100%': { height: 'var(--expanded-height)', opacity: '1' }
        }
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in': 'fade-in 0.3s ease-out',
        'slide-in': 'slide-in 0.3s ease-out',
        'slide-up': 'slide-up 0.4s ease-out',
        'card-expand': 'card-expand 0.3s ease-out forwards'
      }
    }
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;

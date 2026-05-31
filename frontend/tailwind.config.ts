import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './hooks/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-display)', 'serif'],
        sans: ['var(--font-sans)', 'sans-serif'],
      },
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        bronze: 'var(--bronze)',
        silver: 'var(--silver)',
        emerald: 'var(--emerald)',
        gold: 'var(--gold)',
        mystic: 'var(--mystic)',
      },
      boxShadow: {
        bronze: 'var(--glow-bronze)',
        silver: 'var(--glow-silver)',
        emerald: 'var(--glow-emerald)',
        gold: 'var(--glow-gold)',
        mystic: 'var(--glow-mystic)',
      },
    },
  },
  plugins: [],
};

export default config;

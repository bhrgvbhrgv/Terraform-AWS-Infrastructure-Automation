/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0b0f17',
        surface: '#121824',
        'surface-elevated': '#1a2332',
        border: '#1f293d',
        accent: '#3b82f6',
        'accent-hover': '#2563eb'
      }
    },
  },
  plugins: [],
}

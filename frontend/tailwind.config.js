/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#E8390E',
          dark:    '#C02E0B',
          light:   '#FF5A2E',
        },
        dark: {
          1: '#111318',
          2: '#1C1F27',
          3: '#252931',
          4: '#1E2129',
        },
      },
      fontFamily: {
        // Body font — fallback nếu Google Fonts chưa load
        sans: [
          'DM Sans',
          'Segoe UI',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
        // Display font (dùng cho tiêu đề lớn font-display)
        display: [
          'Bebas Neue',
          'Impact',
          'Arial Black',
          'sans-serif',
        ],
      },
    },
  },
  plugins: [],
}
/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                background: '#0a0a0a',
                surface: '#1a1a1a',
                primary: '#00e5ff', // Cyan/Neon Blue
                secondary: '#ff0055', // Neon Pink/Red
                accent: '#7000ff', // Purple
                success: '#00ff9d',
                warning: '#ffb700',
                error: '#ff3333',
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            }
        },
    },
    plugins: [],
}

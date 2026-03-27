/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{tsx,ts,jsx,js}"],
  // Important: use a custom prefix to avoid conflicts in Shadow DOM
  important: true,
  theme: {
    extend: {}
  },
  plugins: []
}

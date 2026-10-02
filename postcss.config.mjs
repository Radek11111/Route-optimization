const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
};

export default config;

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.svelte"],
  theme: {
    extend: {
      fontFamily: {
        pretendard: [
          "Pretendard Variable",
          "Inter",
          "Noto Sans KR",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
}

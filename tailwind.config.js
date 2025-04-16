export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          light: "#a5b4fc", // やわらかい紫
          DEFAULT: "#818cf8", // 主要なテーマカラー（やさしい紫）
          dark: "#6366f1",
        },
        secondary: {
          light: "#fde68a", // 柔らかな黄色
          DEFAULT: "#fcd34d", // アクセントカラー（やさしい黄色）
          dark: "#fbbf24",
        },
        background: {
          light: "#f9fafb", // 明るい背景色
          DEFAULT: "#f3f4f6", // デフォルト背景色
          dark: "#1f2937", // ダークモード背景色
        },
        surface: {
          light: "#ffffff", // 明るいサーフェス色
          DEFAULT: "#f8fafc", // デフォルトサーフェス色
          dark: "#374151", // ダークモードサーフェス色
        },
      },
      borderRadius: {
        "xl": "1rem",
        "2xl": "1.5rem",
        "3xl": "2rem",
      },
      boxShadow: {
        "soft": "0 4px 15px rgba(0, 0, 0, 0.05)",
        "soft-lg": "0 10px 25px rgba(0, 0, 0, 0.05)",
      }
    },
  },
  plugins: [],
  darkMode: "class",
}

import type { Config } from 'tailwindcss'

export default <Partial<Config>>{
  darkMode: 'class',
  content: [
    './components/**/*.{vue,ts}',
    './layouts/**/*.{vue,ts}',
    './pages/**/*.{vue,ts}',
    './app/**/*.{vue,ts}',
    './plugins/**/*.{ts}',
  ],
  theme: { extend: {} },
  plugins: [],
}

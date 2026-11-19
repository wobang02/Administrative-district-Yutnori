import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base: './' → GitHub Pages의 어떤 주소(예: /yut-tour/)에 올려도 파일 경로가 깨지지 않게 상대 경로로 빌드합니다.
export default defineConfig({
  plugins: [react()],
  base: './',
})

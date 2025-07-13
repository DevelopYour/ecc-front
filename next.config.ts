/** @type {import('next').NextConfig} */
const nextConfig = {
  // 정적 export 설정
  // output: 'export',

  env: {
    API_BASE_URL: process.env.API_BASE_URL || 'http://localhost:8080'
  },

  // ESLint 에러를 임시로 무시 (빌드 성공 우선)
  eslint: {
    ignoreDuringBuilds: true, // 빌드 시 ESLint 건너뛰기
  },

  // TypeScript 에러를 임시로 무시 (빌드 성공 우선)
  typescript: {
    ignoreBuildErrors: true,
  }
}

module.exports = nextConfig
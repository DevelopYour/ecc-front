/** @type {import('next').NextConfig} */
const nextConfig = {
  // 정적 export 설정
  // output: 'export',

  env: {
    API_BASE_URL: process.env.API_BASE_URL || 'http://localhost:8080'
  },

  // ESLint 에러 임시 무시 TODO
  eslint: {
    ignoreDuringBuilds: true, // 빌드 시 ESLint 건너뛰기
  },

  // TypeScript 에러 임시 무시 TODO
  typescript: {
    ignoreBuildErrors: true,
  }
}

module.exports = nextConfig
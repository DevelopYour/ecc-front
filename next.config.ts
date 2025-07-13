/** @type {import('next').NextConfig} */
const nextConfig = {
  // 정적 export 설정
  // output: 'export',

  // 환경변수 설정
  env: {
    API_BASE_URL: process.env.API_BASE_URL
  },
}

module.exports = nextConfig
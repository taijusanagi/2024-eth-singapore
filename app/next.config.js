/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  env: {
    NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID: process.env.NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID,
  },
}

module.exports = nextConfig

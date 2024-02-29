/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  images: {
    domains: ['res.cloudinary.com','as2.ftcdn.net'],
  },
generateBuildId: async () => {
  return '963080'; // Set a static build ID
},
compress: true,
}
module.exports = nextConfig

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'randomuser.me' },
      { protocol: 'https', hostname: 'www.postgresql.org' },
      { protocol: 'https', hostname: 'nextjs.org' },
      { protocol: 'https', hostname: 'example.com' },
      { protocol: 'https', hostname: 'picsum.photos' },
      { protocol: 'https', hostname: 'd2f3o3rd6akggk.cloudfront.net' }
    ],
  },
};

module.exports = nextConfig;

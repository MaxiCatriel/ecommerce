export default {
  // experimental: {
  //   ppr: true,
  //   inlineCss: true,
  //   useCache: true
  // },
  // Allow ignoring ESLint and TypeScript build-time checks so the project can
  // be deployed quickly to platforms like Vercel. These are temporary; we
  // recommend fixing lint/type errors for production.
  eslint: {
    ignoreDuringBuilds: true
  },
  typescript: {
    // WARNING: ignoring type errors during build may hide real runtime issues.
    ignoreBuildErrors: true
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    // Using unoptimized images to allow data URLs and any external host
    unoptimized: true
  }
};

module.exports = {

  reactStrictMode: true,
  webpack: config => {
    config.resolve.fallback = { fs: false, net: false, tls: false };
    return config;
  },

  // TODO fix build error
  // web:build: ../../node_modules/.pnpm/abitype@0.9.3_typescript@4.9.4/node_modules/abitype/dist/types/human-readable/formatAbi.d.ts:18:35
  // web:build: Type error: Type parameter declaration expected.
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
};

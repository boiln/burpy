/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        unoptimized: true,
    },
    eslint: {
        ignoreDuringBuilds: true,
    },
    transpilePackages: ["react-syntax-highlighter"],
};

export default nextConfig;

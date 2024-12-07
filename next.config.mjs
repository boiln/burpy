/** @type {import('next').NextConfig} */
const nextConfig = {
    output: "export",
    basePath: "/burpy",
    images: {
        unoptimized: true,
    },
    webpack: (config) => {
        config.experiments = {
            ...config.experiments,
            topLevelAwait: true,
        };
        return config;
    },
};

export default nextConfig;

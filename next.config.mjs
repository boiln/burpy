/** @type {import('next').NextConfig} */
const nextConfig = {
    output: "export",
    images: {
        unoptimized: true,
    },
    basePath: process.env.NEXT_PUBLIC_BASE_PATH || "",
    webpack: (config) => {
        config.experiments = {
            ...config.experiments,
            topLevelAwait: true,
        };
        config.module.rules.push({
            test: /\.worker\.js$/,
            loader: "worker-loader",
            options: {
                filename: "static/[hash].worker.js",
                publicPath: "/_next/",
            },
        });
        return config;
    },
};

export default nextConfig;

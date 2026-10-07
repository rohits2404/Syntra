import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    typescript: {
        ignoreBuildErrors: true,
    },

    serverExternalPackages: [
        "tree-sitter",
        "tree-sitter-javascript",
        "tree-sitter-typescript",
        "@xenova/transformers",
        "onnxruntime-node",
        "sharp",
    ],

    experimental: {
        serverActions: {
            bodySizeLimit: "110mb",
        },
    },

    webpack: (config) => {
        config.experiments = {
            ...config.experiments,
            asyncWebAssembly: true,
        };

        return config;
    },
};

export default nextConfig;

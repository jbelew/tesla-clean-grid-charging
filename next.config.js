/** @type {import('next').NextConfig} */
const nextConfig = {};

module.exports = {
    images: {
        remotePatterns: [
            {
                hostname: "https://static-assets.tesla.com/.com",
            },
        ],
    },
};

module.exports = nextConfig;

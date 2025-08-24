/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          // redundância do middleware para ambientes que ignoram middleware em estáticos
          {
            key: 'Content-Security-Policy',
            value:
              "default-src 'self' https: data: blob:; " +
              "frame-ancestors 'self' https://*.bitrix24.com https://*.bitrix24.com.br https://*.bitrix24.ru https://*.bitrix24.de https://*.bitrix24.es https://*.bitrix24.ua;",
          },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ]
  },
}

module.exports = nextConfig

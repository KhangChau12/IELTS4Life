import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://www.ielts4life.com'

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/admin/', '/(admin)/', '/invite/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}

import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/dashboard', '/tracker', '/resumes', '/career-profile', '/auth/', '/api/'] }],
    sitemap: 'https://ats-toolikit.vercel.app/sitemap.xml',
  };
}

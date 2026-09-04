import type { MetadataRoute } from 'next';

const baseUrl = 'https://ats-toolikit.vercel.app';

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = [
    '', '/demo', '/templates', '/career-copilot', '/workspace',
    '/resume-builder', '/optimizer', '/interview-prep', '/career-gaps',
    '/recruiter-view', '/cover-letter',
  ];
  return pages.map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: path === '' ? 'weekly' : 'monthly',
    priority: path === '' ? 1 : 0.7,
  }));
}

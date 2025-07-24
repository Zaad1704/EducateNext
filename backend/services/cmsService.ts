import SiteContent from '../models/SiteContent';

export const generateSubdomain = (institutionName: string): string => {
  // Convert institution name to URL-friendly subdomain
  return institutionName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 30);
};

export const getAvailableTemplates = () => {
  return [
    {
      id: 'modern',
      name: 'Modern',
      description: 'Clean, contemporary design with modern UI elements',
      preview: '/templates/modern-preview.jpg',
      features: ['Responsive Design', 'Dark Mode', 'Animation Effects', 'Mobile Optimized']
    },
    {
      id: 'classic',
      name: 'Classic',
      description: 'Traditional academic layout with formal styling',
      preview: '/templates/classic-preview.jpg',
      features: ['Traditional Layout', 'Formal Typography', 'Academic Colors', 'Print Friendly']
    },
    {
      id: 'minimal',
      name: 'Minimal',
      description: 'Simple, focused design with clean typography',
      preview: '/templates/minimal-preview.jpg',
      features: ['Clean Design', 'Fast Loading', 'Simple Navigation', 'Content Focused']
    }
  ];
};

export const generateSitemap = async (domain: string) => {
  const site = await SiteContent.findOne({ 
    $or: [{ domain }, { customDomain: domain }],
    isPublished: true 
  });

  if (!site) return null;

  const baseUrl = `https://${domain}`;
  const pages = [
    { url: baseUrl, priority: 1.0, changefreq: 'weekly' },
    { url: `${baseUrl}#about`, priority: 0.8, changefreq: 'monthly' },
    { url: `${baseUrl}#staff`, priority: 0.7, changefreq: 'monthly' },
    { url: `${baseUrl}#academics`, priority: 0.7, changefreq: 'monthly' },
    { url: `${baseUrl}#news`, priority: 0.6, changefreq: 'weekly' },
    { url: `${baseUrl}#contact`, priority: 0.5, changefreq: 'yearly' }
  ];

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map(page => `
  <url>
    <loc>${page.url}</loc>
    <priority>${page.priority}</priority>
    <changefreq>${page.changefreq}</changefreq>
    <lastmod>${new Date().toISOString()}</lastmod>
  </url>`).join('')}
</urlset>`;
};

export const generateRobotsTxt = (domain: string) => {
  return `User-agent: *
Allow: /

Sitemap: https://${domain}/sitemap.xml`;
};

export const validateCustomDomain = (domain: string): boolean => {
  const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+$/;
  return domainRegex.test(domain);
};

export const generateMetaTags = (site: any) => {
  return {
    title: site.seo.title,
    description: site.seo.description,
    keywords: site.seo.keywords.join(', '),
    ogTitle: site.seo.title,
    ogDescription: site.seo.description,
    ogImage: site.seo.ogImage || site.content.header.logo,
    ogUrl: `https://${site.domain}`,
    twitterCard: 'summary_large_image',
    twitterTitle: site.seo.title,
    twitterDescription: site.seo.description,
    twitterImage: site.seo.ogImage || site.content.header.logo
  };
};

export const optimizeImages = async (imageUrl: string) => {
  // Image optimization logic would go here
  // This could integrate with services like Cloudinary or implement sharp
  return {
    original: imageUrl,
    thumbnail: imageUrl.replace(/\.(jpg|jpeg|png)$/i, '_thumb.$1'),
    webp: imageUrl.replace(/\.(jpg|jpeg|png)$/i, '.webp'),
    sizes: {
      small: imageUrl.replace(/\.(jpg|jpeg|png)$/i, '_small.$1'),
      medium: imageUrl.replace(/\.(jpg|jpeg|png)$/i, '_medium.$1'),
      large: imageUrl.replace(/\.(jpg|jpeg|png)$/i, '_large.$1')
    }
  };
};
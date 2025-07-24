import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export async function getSiteContent(domain: string) {
  try {
    const response = await axios.get(`${API_BASE_URL}/cms/public/${domain}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching site content:', error);
    return null;
  }
}

export async function getTemplates() {
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
}

export function generateSEOTags(site: any) {
  return {
    title: site.seo.title,
    description: site.seo.description,
    keywords: site.seo.keywords.join(', '),
    canonical: `https://${site.domain}`,
    openGraph: {
      title: site.seo.title,
      description: site.seo.description,
      image: site.seo.ogImage,
      url: `https://${site.domain}`,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: site.seo.title,
      description: site.seo.description,
      image: site.seo.ogImage,
    },
  };
}
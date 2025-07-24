import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ModernTemplate from '../../components/templates/ModernTemplate';
import ClassicTemplate from '../../components/templates/ClassicTemplate';
import MinimalTemplate from '../../components/templates/MinimalTemplate';
import { getSiteContent } from '../../lib/cms';

interface PageProps {
  params: { domain: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const site = await getSiteContent(params.domain);
  
  if (!site) {
    return {
      title: 'Site Not Found',
      description: 'The requested website could not be found.'
    };
  }

  return {
    title: site.seo.title,
    description: site.seo.description,
    keywords: site.seo.keywords,
    openGraph: {
      title: site.seo.title,
      description: site.seo.description,
      images: [{ url: site.seo.ogImage }],
      url: `https://${site.domain}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: site.seo.title,
      description: site.seo.description,
      images: [site.seo.ogImage],
    },
  };
}

export default async function InstitutionWebsite({ params }: PageProps) {
  const site = await getSiteContent(params.domain);

  if (!site || !site.isPublished) {
    notFound();
  }

  const TemplateComponent = {
    modern: ModernTemplate,
    classic: ClassicTemplate,
    minimal: MinimalTemplate,
  }[site.template] || ModernTemplate;

  return <TemplateComponent site={site} />;
}

export async function generateStaticParams() {
  // This would fetch all published sites for static generation
  // For now, return empty array for dynamic generation
  return [];
}
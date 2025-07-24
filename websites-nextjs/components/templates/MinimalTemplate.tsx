'use client';

import Header from '../sections/Header';
import Hero from '../sections/Hero';
import About from '../sections/About';
import Staff from '../sections/Staff';
import Academics from '../sections/Academics';
import News from '../sections/News';
import Contact from '../sections/Contact';
import Footer from '../sections/Footer';

interface MinimalTemplateProps {
  site: any;
}

export default function MinimalTemplate({ site }: MinimalTemplateProps) {
  return (
    <div className="min-h-screen bg-white">
      <Header content={site.content.header} />
      
      <main className="space-y-16">
        <Hero content={site.content.hero} />
        <About content={site.content.about} />
        <Staff content={site.content.staff} />
        <Academics content={site.content.academics} />
        <News content={site.content.news} events={site.content.events} />
        <Contact content={site.content.contact} />
      </main>
      
      <Footer content={site.content.footer} />
      
      {/* Custom CSS */}
      {site.customCSS && (
        <style dangerouslySetInnerHTML={{ __html: site.customCSS }} />
      )}
    </div>
  );
}
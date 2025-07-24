'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import Header from '../sections/Header';
import Hero from '../sections/Hero';
import About from '../sections/About';
import Staff from '../sections/Staff';
import Academics from '../sections/Academics';
import News from '../sections/News';
import Contact from '../sections/Contact';
import Footer from '../sections/Footer';

interface ModernTemplateProps {
  site: any;
}

export default function ModernTemplate({ site }: ModernTemplateProps) {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header content={site.content.header} />
      
      <motion.main
        ref={ref}
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: 0.6 }}
      >
        <Hero content={site.content.hero} />
        
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={inView ? { y: 0, opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <About content={site.content.about} />
        </motion.div>
        
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={inView ? { y: 0, opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <Staff content={site.content.staff} />
        </motion.div>
        
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={inView ? { y: 0, opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <Academics content={site.content.academics} />
        </motion.div>
        
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={inView ? { y: 0, opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <News content={site.content.news} events={site.content.events} />
        </motion.div>
        
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={inView ? { y: 0, opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 1.0 }}
        >
          <Contact content={site.content.contact} />
        </motion.div>
      </motion.main>
      
      <Footer content={site.content.footer} />
      
      {/* Custom CSS */}
      {site.customCSS && (
        <style dangerouslySetInnerHTML={{ __html: site.customCSS }} />
      )}
    </div>
  );
}
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

interface HeaderProps {
  content: {
    logo: string;
    title: string;
    tagline: string;
    navigation: Array<{name: string; url: string; order: number}>;
  };
}

export default function Header({ content }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const sortedNavigation = content.navigation.sort((a, b) => a.order - b.order);

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="bg-white/90 backdrop-blur-md shadow-lg sticky top-0 z-50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo and Title */}
          <div className="flex items-center space-x-4">
            {content.logo && (
              <Image
                src={content.logo}
                alt={content.title}
                width={50}
                height={50}
                className="rounded-lg"
              />
            )}
            <div>
              <h1 className="text-xl font-bold text-gray-900">{content.title}</h1>
              {content.tagline && (
                <p className="text-sm text-gray-600">{content.tagline}</p>
              )}
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {sortedNavigation.map((item, index) => (
              <motion.a
                key={item.name}
                href={item.url}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200"
              >
                {item.name}
              </motion.a>
            ))}
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-md text-gray-700 hover:text-blue-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <motion.nav
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden py-4 border-t border-gray-200"
          >
            {sortedNavigation.map((item) => (
              <a
                key={item.name}
                href={item.url}
                className="block py-2 text-gray-700 hover:text-blue-600 font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                {item.name}
              </a>
            ))}
          </motion.nav>
        )}
      </div>
    </motion.header>
  );
}
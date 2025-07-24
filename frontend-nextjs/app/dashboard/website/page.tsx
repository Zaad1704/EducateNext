'use client';

import { useState } from 'react';

export default function WebsiteManagementPage() {
  const [website, setWebsite] = useState({
    domain: 'greenwood-academy.educatenext.com',
    template: 'modern',
    isPublished: false,
    lastUpdated: '2024-01-15',
    content: {
      header: {
        title: 'Greenwood Academy',
        tagline: 'Excellence in Education',
      },
      hero: {
        title: 'Welcome to Greenwood Academy',
        subtitle: 'Shaping Future Leaders',
      },
      about: {
        description: 'We are committed to providing quality education and nurturing young minds.',
      }
    }
  });

  const [activeTab, setActiveTab] = useState('overview');
  const [showTemplateModal, setShowTemplateModal] = useState(false);

  const templates = [
    {
      id: 'modern',
      name: 'Modern',
      description: 'Clean, contemporary design',
      preview: '/templates/modern-preview.jpg'
    },
    {
      id: 'classic',
      name: 'Classic',
      description: 'Traditional academic layout',
      preview: '/templates/classic-preview.jpg'
    },
    {
      id: 'minimal',
      name: 'Minimal',
      description: 'Simple, focused design',
      preview: '/templates/minimal-preview.jpg'
    }
  ];

  const handlePublish = () => {
    setWebsite({ ...website, isPublished: true });
    alert('Website published successfully!');
  };

  const handleTemplateChange = (templateId: string) => {
    setWebsite({ ...website, template: templateId });
    setShowTemplateModal(false);
  };

  const handleContentUpdate = (section: string, field: string, value: string) => {
    setWebsite({
      ...website,
      content: {
        ...website.content,
        [section]: {
          ...website.content[section as keyof typeof website.content],
          [field]: value
        }
      }
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Website Management</h1>
            <p className="mt-2 text-gray-600">Manage your institution's public website</p>
          </div>
          <div className="flex space-x-3">
            <a
              href={`https://${website.domain}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
            >
              Preview
            </a>
            <button
              onClick={handlePublish}
              className={`px-4 py-2 rounded-md ${
                website.isPublished
                  ? 'bg-green-600 text-white'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {website.isPublished ? 'Published' : 'Publish'}
            </button>
          </div>
        </div>

        {/* Website Status */}
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Website URL</h3>
              <p className="mt-1 text-lg font-semibold text-blue-600">{website.domain}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Status</h3>
              <span className={`mt-1 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                website.isPublished ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
              }`}>
                {website.isPublished ? 'Published' : 'Draft'}
              </span>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Template</h3>
              <p className="mt-1 text-lg font-semibold capitalize">{website.template}</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white shadow rounded-lg">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {['overview', 'content', 'design', 'seo'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Website Overview</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900">Quick Stats</h4>
                      <div className="mt-2 space-y-2">
                        <p className="text-sm text-gray-600">Pages: 6</p>
                        <p className="text-sm text-gray-600">Last Updated: {website.lastUpdated}</p>
                        <p className="text-sm text-gray-600">Template: {website.template}</p>
                      </div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900">Actions</h4>
                      <div className="mt-2 space-y-2">
                        <button
                          onClick={() => setShowTemplateModal(true)}
                          className="block text-sm text-blue-600 hover:text-blue-800"
                        >
                          Change Template
                        </button>
                        <button className="block text-sm text-blue-600 hover:text-blue-800">
                          Sync Staff Data
                        </button>
                        <button className="block text-sm text-blue-600 hover:text-blue-800">
                          Export Backup
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'content' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Content Management</h3>
                  
                  {/* Header Content */}
                  <div className="bg-gray-50 p-4 rounded-lg mb-6">
                    <h4 className="font-medium text-gray-900 mb-3">Header</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Title</label>
                        <input
                          type="text"
                          value={website.content.header.title}
                          onChange={(e) => handleContentUpdate('header', 'title', e.target.value)}
                          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Tagline</label>
                        <input
                          type="text"
                          value={website.content.header.tagline}
                          onChange={(e) => handleContentUpdate('header', 'tagline', e.target.value)}
                          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Hero Content */}
                  <div className="bg-gray-50 p-4 rounded-lg mb-6">
                    <h4 className="font-medium text-gray-900 mb-3">Hero Section</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Hero Title</label>
                        <input
                          type="text"
                          value={website.content.hero.title}
                          onChange={(e) => handleContentUpdate('hero', 'title', e.target.value)}
                          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Subtitle</label>
                        <input
                          type="text"
                          value={website.content.hero.subtitle}
                          onChange={(e) => handleContentUpdate('hero', 'subtitle', e.target.value)}
                          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                        />
                      </div>
                    </div>
                  </div>

                  {/* About Content */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-3">About Section</h4>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Description</label>
                      <textarea
                        rows={4}
                        value={website.content.about.description}
                        onChange={(e) => handleContentUpdate('about', 'description', e.target.value)}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'design' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Design Settings</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {templates.map((template) => (
                      <div
                        key={template.id}
                        className={`border-2 rounded-lg p-4 cursor-pointer ${
                          website.template === template.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => handleTemplateChange(template.id)}
                      >
                        <div className="aspect-video bg-gray-200 rounded mb-3"></div>
                        <h4 className="font-medium text-gray-900">{template.name}</h4>
                        <p className="text-sm text-gray-600">{template.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'seo' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">SEO Settings</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Page Title</label>
                      <input
                        type="text"
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                        placeholder="Enter page title for search engines"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Meta Description</label>
                      <textarea
                        rows={3}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                        placeholder="Enter meta description for search engines"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Keywords</label>
                      <input
                        type="text"
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                        placeholder="Enter keywords separated by commas"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Template Selection Modal */}
        {showTemplateModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Choose Template</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  {templates.map((template) => (
                    <div
                      key={template.id}
                      className="border rounded-lg p-4 cursor-pointer hover:border-blue-300"
                      onClick={() => handleTemplateChange(template.id)}
                    >
                      <div className="aspect-video bg-gray-200 rounded mb-3"></div>
                      <h4 className="font-medium text-gray-900">{template.name}</h4>
                      <p className="text-sm text-gray-600">{template.description}</p>
                    </div>
                  ))}
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={() => setShowTemplateModal(false)}
                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
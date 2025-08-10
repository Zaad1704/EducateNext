import { Request, Response } from 'express';
import SiteContent from '../models/SiteContent';
import Institution from '../models/Institution';
import Teacher from '../models/Teacher';
import { generateSubdomain } from '../services/cmsService';
import { Types } from 'mongoose';

export const createSite = async (req: Request, res: Response) => {
  const { template, content, seo } = req.body;
  const institutionId = req.user?.institutionId;

  try {
    // Check if site already exists
    const existingSite = await SiteContent.findOne({
      institutionId: new Types.ObjectId(institutionId)
    });

    if (existingSite) {
      return res.status(400).json({ message: 'Website already exists for this institution' });
    }

    // Get institution details
    const institution = await Institution.findById(institutionId);
    if (!institution) {
      return res.status(404).json({ message: 'Institution not found' });
    }

    // Generate subdomain
    const subdomain = generateSubdomain(institution.name);
    const domain = `${subdomain}.educatenext.com`;

    // Create default content structure
    const defaultContent = {
      header: {
        logo: institution.branding.companyLogoUrl || '',
        title: institution.branding.companyName,
        tagline: content?.header?.tagline || 'Excellence in Education',
        navigation: [
          { name: 'Home', url: '#home', order: 1 },
          { name: 'About', url: '#about', order: 2 },
          { name: 'Staff', url: '#staff', order: 3 },
          { name: 'Academics', url: '#academics', order: 4 },
          { name: 'News', url: '#news', order: 5 },
          { name: 'Contact', url: '#contact', order: 6 },
          { name: 'Portal', url: '/login', order: 7 }
        ]
      },
      hero: {
        title: content?.hero?.title || `Welcome to ${institution.branding.companyName}`,
        subtitle: content?.hero?.subtitle || 'Shaping Future Leaders',
        backgroundImage: content?.hero?.backgroundImage || '/default-hero.jpg',
        ctaButton: {
          text: 'Learn More',
          url: '#about'
        }
      },
      about: {
        title: 'About Our Institution',
        description: content?.about?.description || 'We are committed to providing quality education.',
        mission: content?.about?.mission || 'To provide excellent education and shape future leaders.',
        vision: content?.about?.vision || 'To be a leading educational institution.',
        history: content?.about?.history || 'Founded with a vision of excellence in education.'
      },
      staff: {
        principal: {
          name: '',
          photo: '',
          bio: '',
          qualifications: []
        },
        teachers: [],
        administration: []
      },
      boardOfDirectors: [],
      academics: {
        programs: [],
        facilities: []
      },
      news: [],
      events: [],
      contact: {
        address: institution.contact?.address || '',
        phone: institution.contact?.phone || '',
        email: institution.contact?.email || '',
        hours: 'Mon-Fri: 8:00 AM - 4:00 PM',
        mapUrl: ''
      },
      footer: {
        text: `© ${new Date().getFullYear()} ${institution.branding.companyName}. All rights reserved.`,
        links: [
          { name: 'Privacy Policy', url: '/privacy' },
          { name: 'Terms of Service', url: '/terms' }
        ],
        socialMedia: []
      },
      ...content
    };

    const siteContent = new SiteContent({
      institutionId: new Types.ObjectId(institutionId),
      domain,
      subdomain,
      template: template || 'modern',
      content: defaultContent,
      seo: {
        title: seo?.title || institution.branding.companyName,
        description: seo?.description || `Official website of ${institution.branding.companyName}`,
        keywords: seo?.keywords || ['education', 'school', institution.branding.companyName.toLowerCase()],
        ogImage: seo?.ogImage || institution.branding.companyLogoUrl || ''
      },
      isPublished: false
    });

    await siteContent.save();

    res.status(201).json({
      message: 'Website created successfully',
      site: siteContent
    });

  } catch (error: any) {
    console.error('Error creating site:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getSite = async (req: Request, res: Response) => {
  const institutionId = req.user?.institutionId;

  try {
    const site = await SiteContent.findOne({
      institutionId: new Types.ObjectId(institutionId)
    }).populate('institutionId', 'name branding contact');

    if (!site) {
      return res.status(404).json({ message: 'Website not found' });
    }

    res.status(200).json(site);

  } catch (error: any) {
    console.error('Error fetching site:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const updateSite = async (req: Request, res: Response) => {
  const { content, seo, template, customCSS } = req.body;
  const institutionId = req.user?.institutionId;

  try {
    const site = await SiteContent.findOneAndUpdate(
      { institutionId: new Types.ObjectId(institutionId) },
      {
        ...(content && { content }),
        ...(seo && { seo }),
        ...(template && { template }),
        ...(customCSS !== undefined && { customCSS })
      },
      { new: true }
    );

    if (!site) {
      return res.status(404).json({ message: 'Website not found' });
    }

    res.status(200).json({
      message: 'Website updated successfully',
      site
    });

  } catch (error: any) {
    console.error('Error updating site:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const publishSite = async (req: Request, res: Response) => {
  const institutionId = req.user?.institutionId;

  try {
    const site = await SiteContent.findOneAndUpdate(
      { institutionId: new Types.ObjectId(institutionId) },
      { isPublished: true },
      { new: true }
    );

    if (!site) {
      return res.status(404).json({ message: 'Website not found' });
    }

    res.status(200).json({
      message: 'Website published successfully',
      site,
      url: `https://${site.domain}`
    });

  } catch (error: any) {
    console.error('Error publishing site:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const syncStaffData = async (req: Request, res: Response) => {
  const institutionId = req.user?.institutionId;

  try {
    // Get all teachers from the institution
    const teachers = await Teacher.find({ institutionId })
      .populate('userId', 'name email')
      .populate('assignedClassroomIds', 'name');

    const site = await SiteContent.findOne({
      institutionId: new Types.ObjectId(institutionId)
    });

    if (!site) {
      return res.status(404).json({ message: 'Website not found' });
    }

    // Update staff data
    const updatedTeachers = teachers.map(teacher => ({
      id: teacher._id,
      name: (teacher.userId as any)?.name || 'Unknown',
      photo: teacher.photoUrl || '/default-avatar.png',
      subject: (teacher.assignedClassroomIds as any[]).map(c => (c as any)?.name || '').join(', '),
      qualifications: teacher.qualifications || [],
      bio: teacher.bio || ''
    }));

    site.content.staff.teachers = updatedTeachers;
    await site.save();

    res.status(200).json({
      message: 'Staff data synchronized successfully',
      teachersCount: updatedTeachers.length
    });

  } catch (error: any) {
    console.error('Error syncing staff data:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getPublicSite = async (req: Request, res: Response) => {
  const { domain } = req.params;

  try {
    let site;
    
    // Check if it's a subdomain or custom domain
    if (domain.includes('.educatenext.com')) {
      const subdomain = domain.replace('.educatenext.com', '');
      site = await SiteContent.findOne({ subdomain, isPublished: true });
    } else {
      site = await SiteContent.findOne({ customDomain: domain, isPublished: true });
    }

    if (!site) {
      return res.status(404).json({ message: 'Website not found' });
    }

    res.status(200).json(site);

  } catch (error: any) {
    console.error('Error fetching public site:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
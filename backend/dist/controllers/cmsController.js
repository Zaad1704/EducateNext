"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPublicSite = exports.syncStaffData = exports.publishSite = exports.updateSite = exports.getSite = exports.createSite = void 0;
const SiteContent_1 = __importDefault(require("../models/SiteContent"));
const Institution_1 = __importDefault(require("../models/Institution"));
const Teacher_1 = __importDefault(require("../models/Teacher"));
const cmsService_1 = require("../services/cmsService");
const mongoose_1 = require("mongoose");
const createSite = async (req, res) => {
    const { template, content, seo } = req.body;
    const institutionId = req.user?.institutionId;
    try {
        // Check if site already exists
        const existingSite = await SiteContent_1.default.findOne({
            institutionId: new mongoose_1.Types.ObjectId(institutionId)
        });
        if (existingSite) {
            return res.status(400).json({ message: 'Website already exists for this institution' });
        }
        // Get institution details
        const institution = await Institution_1.default.findById(institutionId);
        if (!institution) {
            return res.status(404).json({ message: 'Institution not found' });
        }
        // Generate subdomain
        const subdomain = (0, cmsService_1.generateSubdomain)(institution.name);
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
        const siteContent = new SiteContent_1.default({
            institutionId: new mongoose_1.Types.ObjectId(institutionId),
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
    }
    catch (error) {
        console.error('Error creating site:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
exports.createSite = createSite;
const getSite = async (req, res) => {
    const institutionId = req.user?.institutionId;
    try {
        const site = await SiteContent_1.default.findOne({
            institutionId: new mongoose_1.Types.ObjectId(institutionId)
        }).populate('institutionId', 'name branding contact');
        if (!site) {
            return res.status(404).json({ message: 'Website not found' });
        }
        res.status(200).json(site);
    }
    catch (error) {
        console.error('Error fetching site:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
exports.getSite = getSite;
const updateSite = async (req, res) => {
    const { content, seo, template, customCSS } = req.body;
    const institutionId = req.user?.institutionId;
    try {
        const site = await SiteContent_1.default.findOneAndUpdate({ institutionId: new mongoose_1.Types.ObjectId(institutionId) }, {
            ...(content && { content }),
            ...(seo && { seo }),
            ...(template && { template }),
            ...(customCSS !== undefined && { customCSS })
        }, { new: true });
        if (!site) {
            return res.status(404).json({ message: 'Website not found' });
        }
        res.status(200).json({
            message: 'Website updated successfully',
            site
        });
    }
    catch (error) {
        console.error('Error updating site:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
exports.updateSite = updateSite;
const publishSite = async (req, res) => {
    const institutionId = req.user?.institutionId;
    try {
        const site = await SiteContent_1.default.findOneAndUpdate({ institutionId: new mongoose_1.Types.ObjectId(institutionId) }, { isPublished: true }, { new: true });
        if (!site) {
            return res.status(404).json({ message: 'Website not found' });
        }
        res.status(200).json({
            message: 'Website published successfully',
            site,
            url: `https://${site.domain}`
        });
    }
    catch (error) {
        console.error('Error publishing site:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
exports.publishSite = publishSite;
const syncStaffData = async (req, res) => {
    const institutionId = req.user?.institutionId;
    try {
        // Get all teachers from the institution
        const teachers = await Teacher_1.default.find({ institutionId })
            .populate('userId', 'name email')
            .populate('assignedClassroomIds', 'name');
        const site = await SiteContent_1.default.findOne({
            institutionId: new mongoose_1.Types.ObjectId(institutionId)
        });
        if (!site) {
            return res.status(404).json({ message: 'Website not found' });
        }
        // Update staff data
        const updatedTeachers = teachers.map(teacher => ({
            id: teacher._id,
            name: teacher.userId?.name || 'Unknown',
            photo: teacher.photoUrl || '/default-avatar.png',
            subject: teacher.assignedClassroomIds.map(c => c?.name || '').join(', '),
            qualifications: teacher.qualifications || [],
            bio: teacher.bio || ''
        }));
        site.content.staff.teachers = updatedTeachers;
        await site.save();
        res.status(200).json({
            message: 'Staff data synchronized successfully',
            teachersCount: updatedTeachers.length
        });
    }
    catch (error) {
        console.error('Error syncing staff data:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
exports.syncStaffData = syncStaffData;
const getPublicSite = async (req, res) => {
    const { domain } = req.params;
    try {
        let site;
        // Check if it's a subdomain or custom domain
        if (domain.includes('.educatenext.com')) {
            const subdomain = domain.replace('.educatenext.com', '');
            site = await SiteContent_1.default.findOne({ subdomain, isPublished: true });
        }
        else {
            site = await SiteContent_1.default.findOne({ customDomain: domain, isPublished: true });
        }
        if (!site) {
            return res.status(404).json({ message: 'Website not found' });
        }
        res.status(200).json(site);
    }
    catch (error) {
        console.error('Error fetching public site:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
exports.getPublicSite = getPublicSite;

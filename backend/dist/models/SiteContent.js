"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const SiteContentSchema = new mongoose_1.Schema({
    institutionId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Institution', required: true, unique: true },
    domain: { type: String, required: true },
    subdomain: { type: String, required: true, unique: true },
    template: { type: String, enum: ['modern', 'classic', 'minimal'], default: 'modern' },
    content: {
        header: {
            logo: { type: String, default: '' },
            title: { type: String, required: true },
            tagline: { type: String, default: '' },
            navigation: [{
                    name: { type: String, required: true },
                    url: { type: String, required: true },
                    order: { type: Number, default: 0 }
                }]
        },
        hero: {
            title: { type: String, required: true },
            subtitle: { type: String, default: '' },
            backgroundImage: { type: String, default: '' },
            ctaButton: {
                text: { type: String, default: 'Learn More' },
                url: { type: String, default: '#about' }
            }
        },
        about: {
            title: { type: String, default: 'About Us' },
            description: { type: String, default: '' },
            mission: { type: String, default: '' },
            vision: { type: String, default: '' },
            history: { type: String, default: '' }
        },
        staff: {
            principal: {
                name: { type: String, default: '' },
                photo: { type: String, default: '' },
                bio: { type: String, default: '' },
                qualifications: [{ type: String }]
            },
            teachers: [{
                    id: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Teacher' },
                    name: { type: String, required: true },
                    photo: { type: String, default: '' },
                    subject: { type: String, default: '' },
                    qualifications: [{ type: String }],
                    bio: { type: String, default: '' }
                }],
            administration: [{
                    name: { type: String, required: true },
                    position: { type: String, required: true },
                    photo: { type: String, default: '' },
                    bio: { type: String, default: '' }
                }]
        },
        boardOfDirectors: [{
                name: { type: String, required: true },
                position: { type: String, required: true },
                photo: { type: String, default: '' },
                bio: { type: String, default: '' },
                order: { type: Number, default: 0 }
            }],
        academics: {
            programs: [{
                    name: { type: String, required: true },
                    description: { type: String, default: '' },
                    duration: { type: String, default: '' },
                    requirements: [{ type: String }]
                }],
            facilities: [{
                    name: { type: String, required: true },
                    description: { type: String, default: '' },
                    image: { type: String, default: '' }
                }]
        },
        news: [{
                title: { type: String, required: true },
                content: { type: String, required: true },
                image: { type: String, default: '' },
                publishedAt: { type: Date, default: Date.now },
                author: { type: String, required: true }
            }],
        events: [{
                title: { type: String, required: true },
                description: { type: String, default: '' },
                date: { type: Date, required: true },
                location: { type: String, default: '' },
                image: { type: String, default: '' }
            }],
        contact: {
            address: { type: String, default: '' },
            phone: { type: String, default: '' },
            email: { type: String, default: '' },
            hours: { type: String, default: '' },
            mapUrl: { type: String, default: '' }
        },
        footer: {
            text: { type: String, default: '' },
            links: [{
                    name: { type: String, required: true },
                    url: { type: String, required: true }
                }],
            socialMedia: [{
                    platform: { type: String, required: true },
                    url: { type: String, required: true }
                }]
        }
    },
    seo: {
        title: { type: String, required: true },
        description: { type: String, required: true },
        keywords: [{ type: String }],
        ogImage: { type: String, default: '' }
    },
    isPublished: { type: Boolean, default: false },
    customCSS: { type: String },
    customDomain: { type: String }
}, { timestamps: true });
SiteContentSchema.index({ subdomain: 1 }, { unique: true });
SiteContentSchema.index({ customDomain: 1 }, { sparse: true, unique: true });
exports.default = (0, mongoose_1.model)('SiteContent', SiteContentSchema);

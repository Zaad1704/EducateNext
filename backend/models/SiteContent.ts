import { Schema, model, Document, Types } from 'mongoose';

export interface ISiteContent extends Document {
  institutionId: Types.ObjectId;
  domain: string;
  subdomain: string;
  template: 'modern' | 'classic' | 'minimal';
  content: {
    header: {
      logo: string;
      title: string;
      tagline: string;
      navigation: Array<{name: string; url: string; order: number}>;
    };
    hero: {
      title: string;
      subtitle: string;
      backgroundImage: string;
      ctaButton: {text: string; url: string};
    };
    about: {
      title: string;
      description: string;
      mission: string;
      vision: string;
      history: string;
    };
    staff: {
      principal: {
        name: string;
        photo: string;
        bio: string;
        qualifications: string[];
      };
      teachers: Array<{
        id: Types.ObjectId;
        name: string;
        photo: string;
        subject: string;
        qualifications: string[];
        bio: string;
      }>;
      administration: Array<{
        name: string;
        position: string;
        photo: string;
        bio: string;
      }>;
    };
    boardOfDirectors: Array<{
      name: string;
      position: string;
      photo: string;
      bio: string;
      order: number;
    }>;
    academics: {
      programs: Array<{
        name: string;
        description: string;
        duration: string;
        requirements: string[];
      }>;
      facilities: Array<{
        name: string;
        description: string;
        image: string;
      }>;
    };
    news: Array<{
      title: string;
      content: string;
      image: string;
      publishedAt: Date;
      author: string;
    }>;
    events: Array<{
      title: string;
      description: string;
      date: Date;
      location: string;
      image: string;
    }>;
    contact: {
      address: string;
      phone: string;
      email: string;
      hours: string;
      mapUrl: string;
    };
    footer: {
      text: string;
      links: Array<{name: string; url: string}>;
      socialMedia: Array<{platform: string; url: string}>;
    };
  };
  seo: {
    title: string;
    description: string;
    keywords: string[];
    ogImage: string;
  };
  isPublished: boolean;
  customCSS?: string;
  customDomain?: string;
}

const SiteContentSchema = new Schema<ISiteContent>(
  {
    institutionId: { type: Schema.Types.ObjectId, ref: 'Institution', required: true, unique: true },
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
          id: { type: Schema.Types.ObjectId, ref: 'Teacher' },
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
  },
  { timestamps: true }
);

SiteContentSchema.index({ subdomain: 1 }, { unique: true });
SiteContentSchema.index({ customDomain: 1 }, { sparse: true, unique: true });

export default model<ISiteContent>('SiteContent', SiteContentSchema);
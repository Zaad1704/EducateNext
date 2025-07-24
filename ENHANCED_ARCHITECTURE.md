# EducateNext Enhanced Architecture with QR Attendance & Institutional Websites

## 1. Enhanced System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           CLOUD INFRASTRUCTURE                                  │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐                │
│  │   Main Portal   │  │ Institution     │  │   QR Service    │                │
│  │   (SaaS Core)   │  │   Websites      │  │   & ID Cards    │                │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘                │
└─────────────────────────────────────────────────────────────────────────────────┘
                                    │
┌─────────────────────────────────────────────────────────────────────────────────┐
│                        PRESENTATION LAYER                                       │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐                │
│  │  Main Portal    │  │ Institution     │  │  Mobile Apps    │                │
│  │  (Next.js App)  │  │ Public Sites    │  │ (QR Scanner)    │                │
│  │                 │  │ (Next.js SSG)   │  │ (React Native)  │                │
│  │ • Admin Portal  │  │                 │  │                 │                │
│  │ • Teacher Portal│  │ • About Pages   │  │ • Teacher App   │                │
│  │ • Student Portal│  │ • Staff Lists   │  │ • Student App   │                │
│  │ • Accountant    │  │ • Board Members │  │ • Principal App │                │
│  │ • QR Management │  │ • News/Events   │  │ • Digital Wallet│                │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘                │
└─────────────────────────────────────────────────────────────────────────────────┘
                                    │
┌─────────────────────────────────────────────────────────────────────────────────┐
│                        APPLICATION LAYER                                        │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐                │
│  │   Core API      │  │  QR Services    │  │  CMS Services   │                │
│  │                 │  │                 │  │                 │                │
│  │ • Auth/RBAC     │  │ • QR Generation │  │ • Site Builder  │                │
│  │ • Student Mgmt  │  │ • QR Validation │  │ • Content Mgmt  │                │
│  │ • Teacher Mgmt  │  │ • ID Card Gen   │  │ • Template Mgmt │                │
│  │ • Attendance    │  │ • Digital Wallet│  │ • SEO Mgmt      │                │
│  │ • Fee Mgmt      │  │ • Dual Scanning │  │ • Analytics     │                │
│  │ • Institution   │  │ • Device Auth   │  │ • Domain Mgmt   │                │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘                │
└─────────────────────────────────────────────────────────────────────────────────┘
                                    │
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           DATA LAYER                                            │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐                │
│  │   Core DB       │  │   QR & Cards    │  │   CMS DB        │                │
│  │   (MongoDB)     │  │   (MongoDB)     │  │   (MongoDB)     │                │
│  │                 │  │                 │  │                 │                │
│  │ • Users         │  │ • QRCodes       │  │ • SiteContent   │                │
│  │ • Students      │  │ • IDCards       │  │ • Templates     │                │
│  │ • Teachers      │  │ • Devices       │  │ • Pages         │                │
│  │ • Attendance    │  │ • ScanLogs      │  │ • Media         │                │
│  │ • Institutions  │  │ • AttendanceSessions│ • Domains      │                │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘                │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## 2. Enhanced Data Models

### QR & Attendance Models

#### QRCode Model
```typescript
interface IQRCode {
  _id: ObjectId;
  userId: ObjectId; // Student or Teacher
  userType: 'student' | 'teacher';
  institutionId: ObjectId;
  qrData: string; // Encrypted data
  isActive: boolean;
  generatedAt: Date;
  expiresAt?: Date; // For temporary QR codes
  regenerationCount: number;
}
```

#### IDCard Model
```typescript
interface IIDCard {
  _id: ObjectId;
  userId: ObjectId;
  userType: 'student' | 'teacher';
  institutionId: ObjectId;
  cardNumber: string;
  qrCodeId: ObjectId;
  template: 'student' | 'teacher' | 'staff';
  cardData: {
    name: string;
    photo: string;
    id: string;
    institution: string;
    validFrom: Date;
    validUntil: Date;
    emergencyContact?: string;
  };
  printStatus: 'pending' | 'printed' | 'delivered';
  digitalWalletAdded: boolean;
  createdAt: Date;
}
```

#### AttendanceSession Model
```typescript
interface IAttendanceSession {
  _id: ObjectId;
  classroomId: ObjectId;
  teacherId: ObjectId;
  institutionId: ObjectId;
  sessionType: 'class_start' | 'class_end';
  date: Date;
  startTime: Date;
  endTime?: Date;
  isActive: boolean;
  attendanceRecords: ObjectId[];
}
```

#### Enhanced AttendanceRecord Model
```typescript
interface IAttendanceRecord {
  _id: ObjectId;
  studentId: ObjectId;
  teacherId: ObjectId;
  classroomId: ObjectId;
  institutionId: ObjectId;
  sessionId: ObjectId;
  date: Date;
  scanTime: Date;
  status: 'present' | 'absent' | 'late' | 'excused';
  scanType: 'class_start' | 'class_end';
  scanMethod: 'qr_scan' | 'manual' | 'bulk_import';
  deviceId?: string;
  location?: { lat: number; lng: number };
  isVerified: boolean;
}
```

#### Device Model
```typescript
interface IDevice {
  _id: ObjectId;
  institutionId: ObjectId;
  deviceId: string;
  deviceName: string;
  deviceType: 'teacher_phone' | 'principal_device' | 'dedicated_scanner';
  assignedTo?: ObjectId; // Teacher or Principal
  permissions: string[];
  isActive: boolean;
  lastUsed: Date;
  location?: string;
}
```

### CMS & Website Models

#### SiteContent Model
```typescript
interface ISiteContent {
  _id: ObjectId;
  institutionId: ObjectId;
  domain: string;
  template: 'modern' | 'classic' | 'minimal';
  content: {
    header: {
      logo: string;
      title: string;
      tagline: string;
      navigation: Array<{name: string; url: string}>;
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
      principal: StaffMember;
      teachers: StaffMember[];
      administration: StaffMember[];
    };
    boardOfDirectors: BoardMember[];
    academics: {
      programs: Program[];
      facilities: Facility[];
    };
    news: NewsItem[];
    events: Event[];
    contact: ContactInfo;
    footer: FooterContent;
  };
  seo: {
    title: string;
    description: string;
    keywords: string[];
    ogImage: string;
  };
  isPublished: boolean;
  customCSS?: string;
}
```

#### Enhanced Institution Model
```typescript
interface IInstitution {
  _id: ObjectId;
  name: string;
  owner: ObjectId;
  status: 'active' | 'inactive' | 'pending_deletion';
  type: 'school' | 'college' | 'university';
  
  // Enhanced branding
  branding: {
    companyName: string;
    companyLogoUrl: string;
    primaryColor: string;
    secondaryColor: string;
    favicon: string;
  };
  
  // Website configuration
  website: {
    domain?: string; // Custom domain
    subdomain: string; // institution-name.educatenext.com
    isPublished: boolean;
    template: string;
    customDomain?: string;
  };
  
  // QR & Attendance settings
  qrSettings: {
    enableQRAttendance: boolean;
    dualScanRequired: boolean; // Start & End of class
    qrExpiryHours: number;
    allowedDevices: ObjectId[];
    principalDevices: ObjectId[];
  };
  
  // University-specific settings
  universitySettings?: {
    enableOptionalAttendance: boolean;
    attendanceThreshold: number;
    semesterSystem: boolean;
  };
  
  // Contact & Address
  contact: {
    address: string;
    city: string;
    state: string;
    country: string;
    phone: string;
    email: string;
    website?: string;
  };
  
  subscription: {
    plan: 'basic' | 'premium' | 'enterprise';
    features: string[];
    expiresAt: Date;
  };
}
```

## 3. Enhanced API Endpoints

### QR & Attendance APIs

```typescript
// QR Management
POST   /api/qr/generate/:userId          // Generate QR for student/teacher
GET    /api/qr/validate/:qrData          // Validate QR code
POST   /api/qr/regenerate/:userId        // Regenerate QR code
DELETE /api/qr/deactivate/:userId        // Deactivate QR code

// ID Card Management
POST   /api/id-cards/generate/:userId    // Generate ID card
GET    /api/id-cards/:userId             // Get ID card details
POST   /api/id-cards/print/:cardId       // Mark as printed
POST   /api/id-cards/add-to-wallet/:cardId // Add to digital wallet

// Enhanced Attendance
POST   /api/attendance/start-session     // Start attendance session
POST   /api/attendance/end-session       // End attendance session
POST   /api/attendance/scan-qr           // Scan QR for attendance
GET    /api/attendance/sessions          // Get attendance sessions
POST   /api/attendance/bulk-mark         // Bulk mark attendance

// Device Management
POST   /api/devices/register             // Register new device
GET    /api/devices                      // List institution devices
PUT    /api/devices/:deviceId/assign     // Assign device to user
DELETE /api/devices/:deviceId            // Remove device
```

### CMS & Website APIs

```typescript
// Website Management
POST   /api/cms/sites                    // Create institution website
GET    /api/cms/sites/:institutionId     // Get website content
PUT    /api/cms/sites/:institutionId     // Update website content
POST   /api/cms/sites/:institutionId/publish // Publish website
GET    /api/cms/templates                // Get available templates

// Content Management
POST   /api/cms/content/upload           // Upload media files
GET    /api/cms/content/media            // List media files
POST   /api/cms/content/staff            // Add staff member
PUT    /api/cms/content/staff/:staffId   // Update staff member
DELETE /api/cms/content/staff/:staffId   // Remove staff member

// Public Website APIs (No auth required)
GET    /api/public/:domain               // Get public website content
GET    /api/public/:domain/staff         // Get staff directory
GET    /api/public/:domain/news          // Get news & events
GET    /api/public/:domain/contact       // Get contact info
```

## 4. QR Attendance System Flow

### Student QR Attendance Flow
1. **QR Generation**: Auto-generated during student creation
2. **ID Card Creation**: Automatic ID card with embedded QR
3. **Attendance Scanning**: 
   - Teacher scans student QR with authenticated device
   - Dual scan: Class start + Class end
   - Real-time validation and recording

### Teacher Attendance Flow
1. **Device Authentication**: Principal/designated device only
2. **QR Scanning**: Teacher QR scanned by principal device
3. **Session Tracking**: Automatic session creation and management

### University Optional Attendance
- Configurable attendance requirements
- Optional attendance tracking for certain courses
- Flexible attendance policies per department

## 5. Digital ID Card System

### Features
- **Auto-generation**: Created with student/teacher registration
- **QR Integration**: Embedded QR code for attendance
- **Print Ready**: PDF generation for physical printing
- **Digital Wallet**: Apple Wallet / Google Pay integration
- **Security**: Encrypted QR data with expiration

### ID Card Templates
- Student cards with photo, ID, emergency contact
- Teacher cards with credentials and department
- Staff cards with role and access levels

## 6. Institutional Website System

### Multi-tenant Website Architecture
- **Subdomain**: `institution-name.educatenext.com`
- **Custom Domain**: Optional custom domain mapping
- **Template System**: Multiple responsive templates
- **CMS Integration**: Easy content management

### Website Features
- **About Pages**: Institution history, mission, vision
- **Staff Directory**: Automated from teacher database
- **Board of Directors**: Dedicated management section
- **News & Events**: Dynamic content management
- **Student Portal Link**: Direct integration to EducateNext portal
- **SEO Optimization**: Built-in SEO tools

## 7. Enhanced Security & Permissions

### QR Security
- Encrypted QR data with institution-specific keys
- Time-based expiration for enhanced security
- Device-specific authentication
- Geolocation validation (optional)

### RBAC Enhancements
- **Super Admin**: Platform-wide management
- **Institution Admin**: Full institution control
- **Principal**: Teacher attendance, device management
- **Teacher**: Student attendance, classroom management
- **Student**: View-only access, digital wallet
- **Accountant**: Financial data, fee management
- **Website Manager**: CMS access, content management

## 8. Mobile Applications

### Teacher Mobile App
- QR scanner for student attendance
- Classroom management
- Real-time attendance tracking
- Offline capability with sync

### Student Mobile App
- Digital ID card display
- Attendance history
- Academic records
- Digital wallet integration

### Principal Mobile App
- Teacher attendance scanning
- Institution overview
- Device management
- Analytics dashboard

## 9. Implementation Phases

### Phase 1: QR Attendance Core
- QR code generation and validation
- Basic attendance scanning
- Device registration and authentication

### Phase 2: Enhanced Attendance
- Dual scanning (start/end class)
- Session management
- Mobile applications

### Phase 3: Digital ID Cards
- ID card generation
- Print functionality
- Digital wallet integration

### Phase 4: Institutional Websites
- CMS development
- Template system
- Public website generation

### Phase 5: Advanced Features
- Analytics and reporting
- University-specific features
- Advanced security features

## 10. Technology Stack with Next.js

### Backend (Node.js/Express)
- **QR Library**: `qrcode` for generation, `qrcode-reader` for validation
- **PDF Generation**: `puppeteer` for ID cards and reports
- **Image Processing**: `sharp` for photo optimization
- **Encryption**: `crypto` for QR data security
- **File Upload**: `multer` with cloud storage integration

### Frontend (Next.js App Router)
- **Framework**: Next.js 14+ with App Router
- **Styling**: TailwindCSS with custom design system
- **State Management**: Zustand for client state
- **Data Fetching**: SWR or TanStack Query
- **QR Scanner**: `@zxing/library` with camera integration
- **PDF Generation**: `@react-pdf/renderer` for client-side PDFs
- **Charts**: Recharts for analytics dashboards
- **Forms**: React Hook Form with Zod validation
- **UI Components**: Radix UI or Headless UI

### Institutional Websites (Next.js SSG)
- **Framework**: Next.js with Static Site Generation
- **CMS Integration**: Headless CMS approach with database
- **SEO**: Built-in Next.js SEO optimization
- **Performance**: Image optimization, lazy loading
- **Deployment**: Vercel or custom CDN

### Mobile Development
- **React Native**: Cross-platform mobile apps
- **Navigation**: React Navigation v6
- **Camera**: `react-native-vision-camera`
- **QR Scanning**: `react-native-qrcode-scanner`
- **Offline Storage**: `@react-native-async-storage/async-storage`
- **Push Notifications**: Firebase Cloud Messaging

## 11. Next.js Project Structure

### Main Portal (Next.js App)
```
frontend-nextjs/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── register/
│   ├── (dashboard)/
│   │   ├── admin/
│   │   ├── teacher/
│   │   ├── student/
│   │   └── accountant/
│   ├── api/
│   │   ├── auth/
│   │   ├── qr/
│   │   └── attendance/
│   ├── components/
│   ├── lib/
│   └── globals.css
├── components/
│   ├── ui/
│   ├── forms/
│   ├── charts/
│   └── qr/
├── lib/
│   ├── auth.ts
│   ├── db.ts
│   └── utils.ts
└── public/
```

### Institutional Websites (Next.js SSG)
```
websites-nextjs/
├── app/
│   ├── [domain]/
│   │   ├── page.tsx
│   │   ├── about/
│   │   ├── staff/
│   │   ├── news/
│   │   └── contact/
│   └── api/
│       └── content/
├── components/
│   ├── templates/
│   │   ├── modern/
│   │   ├── classic/
│   │   └── minimal/
│   └── sections/
├── lib/
│   └── cms.ts
└── styles/
```

This enhanced architecture transforms EducateNext into a comprehensive educational ecosystem with modern QR-based attendance, digital ID cards, and institutional web presence management using Next.js for optimal performance and SEO.
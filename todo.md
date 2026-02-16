# Erskine J Currie Ministry Consulting Platform - Development Plan

## Design Guidelines

### Design References (Primary Inspiration)
- **Luxury/Premium Websites**: Elegant, sophisticated, high-end aesthetic
- **Ministry/Church Websites**: Trustworthy, professional, welcoming
- **Style**: Elegant Luxury + Professional + Mobile-First + Pastor-Friendly

### Color Palette
- Primary: #000000 (Black - headers, text, emphasis)
- Secondary: #F4E2A3 (Gold - accents, highlights, CTAs)
- Background: #FFFFFF (White - main background, cards)
- Text Primary: #000000 (Black - headings, important text)
- Text Secondary: #4A4A4A (Dark Gray - body text)
- Border: #E5E5E5 (Light Gray - subtle borders)
- Hover Gold: #E6D08C (Darker Gold - hover states)

### Typography
- Heading1: Inter font-weight 700 (36px) - Page titles
- Heading2: Inter font-weight 600 (28px) - Section headers
- Heading3: Inter font-weight 600 (20px) - Card titles
- Body/Normal: Inter font-weight 400 (16px) - Main content
- Body/Small: Inter font-weight 400 (14px) - Helper text
- Navigation: Inter font-weight 500 (16px) - Menu items

### Key Component Styles
- **Buttons**: Gold background (#F4E2A3), black text, 8px rounded, hover: darker gold (#E6D08C)
- **Cards**: White background, subtle shadow, 12px rounded, 1px border (#E5E5E5)
- **Forms**: Clean inputs with border, focus: gold ring, labels above inputs
- **Tables**: Clean rows, hover highlight with gold tint, black headers
- **Status Badges**: Rounded pills with gold/black color scheme

### Layout & Spacing
- Hero section: Clean, centered, elegant with gold accents
- Dashboard grid: Responsive cards, 24px gaps
- Section padding: 48px vertical on desktop, 32px on mobile
- Card padding: 24px internal spacing
- Consistent 16px base spacing unit

### Images Generated
1. ✅ **hero-ministry-consulting.jpg** - Professional consultation scene
2. ✅ **dashboard-preview.jpg** - Dashboard interface mockup
3. ✅ **church-community.jpg** - Church community gathering
4. ✅ **assessment-tools.jpg** - Assessment materials workspace

---

## Development Tasks

### Phase 1: Foundation & Setup ✅
- [x] Backend activated (Atoms Cloud enabled)
- [x] Dependencies installed
- [x] Generated all 4 marketing images
- [x] Created database schema (10 tables)
- [x] Inserted mock data (events, resources)
- [x] Setup authentication routing and AuthCallback page
- [x] Created core types and API client
- [x] Built Header and Footer components
- [x] Built Home page with hero section

### Phase 2: Marketing Website & Booking
**Files to create:**
- [ ] `src/pages/Services.tsx` - Detailed services page
- [ ] `src/pages/Resources.tsx` - Resource library with downloads
- [ ] `src/pages/Events.tsx` - Events listing page
- [ ] `src/pages/EventDetail.tsx` - Individual event details
- [ ] `src/pages/Booking.tsx` - Calendar booking interface
- [ ] `src/components/NewsletterSignup.tsx` - Newsletter form

### Phase 3: Client Portal
**Files to create:**
- [ ] `src/pages/client/Dashboard.tsx` - Client dashboard
- [ ] `src/pages/client/Projects.tsx` - Project list and details
- [ ] `src/pages/client/Documents.tsx` - Document sharing
- [ ] `src/pages/client/Assessments.tsx` - Assessment results viewer
- [ ] `src/pages/client/Messages.tsx` - Messaging interface

### Phase 4: Admin Dashboard & CRM
**Files to create:**
- [ ] `src/pages/admin/Dashboard.tsx` - Admin main dashboard
- [ ] `src/pages/admin/CRM.tsx` - CRM with lead pipeline
- [ ] `src/pages/admin/Analytics.tsx` - KPI dashboard
- [ ] `src/pages/admin/Proposals.tsx` - Proposal builder

### Phase 5: Payment Integration
**Files to create:**
- [ ] `backend/routers/payments.py` - Stripe payment routes
- [ ] `src/pages/PaymentSuccess.tsx` - Payment confirmation page

### Phase 6: Testing & Polish
- [ ] Update all pages with new color scheme
- [ ] Test all user flows
- [ ] Mobile responsiveness check
- [ ] Final lint and build check

---

## Database Schema (Completed)

### Tables Created:
1. ✅ **churches** - Client organizations (create_only: true)
2. ✅ **leads** - Prospect management (create_only: true)
3. ✅ **projects** - Client engagements (create_only: true)
4. ✅ **assessments** - Church assessments (create_only: true)
5. ✅ **events** - Workshops & cohorts (create_only: false - public)
6. ✅ **registrations** - Event registrations (create_only: true)
7. ✅ **resources** - Downloadable content (create_only: false - public)
8. ✅ **messages** - Client communications (create_only: true)
9. ✅ **tasks** - CRM tasks (create_only: true)
10. ✅ **proposals** - Proposal management (create_only: true)

### Mock Data Inserted:
- ✅ 4 events (workshops, cohorts, webinars, conferences)
- ✅ 5 resources (guides, templates, checklists, ebooks, videos)

---

## Pastor-Friendly Language Guidelines
- Use "Church" not "Organization" or "Client"
- Use "Pastor" not "User" or "Contact"
- Use "Ministry" not "Business" or "Service"
- Use "Consultation" not "Meeting" or "Call"
- Use "Workshop" not "Training" or "Course"

---

## Success Criteria

✅ Backend activated with Atoms Cloud
✅ Database tables created
✅ Mock data inserted
✅ Homepage built with elegant design
✅ Authentication setup complete
⏳ Marketing pages (Services, Events, Resources, Booking)
⏳ Client portal with secure access
⏳ Admin dashboard with CRM
⏳ Payment integration
⏳ Mobile-responsive with white/black/gold theme
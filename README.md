# NEXUS Studio — Architectural Intelligence & Pioneer Access Platform

> **"We don't build products. We build futures."**  
> NEXUS is a high-performance architectural intelligence platform empowering architects, BIM managers, and computational designers with production-grade CAD blocks, parametric Revit families, and calibrated AI prompt engines.

---

## 🏛️ Executive Summary

NEXUS combines editorial luxury aesthetics with production-grade engineering to distribute the **First 1,000 Early Pioneer Passes** ($0 lifetime subscription). The platform doubles as a research telemetry engine: capturing verified geographic coordinates from incoming architects to determine the strategic location for NEXUS Studio's next international architectural research lab.

---

## ⚡ Key Accomplishments & Features Built

### 1. 🌐 Cloud Database & Cross-Device Sync (Supabase)
* **PostgreSQL Architecture**: Migrated from local browser storage to a centralized Supabase database (`nexus_users`, `nexus_referral_codes`, and `nexus_quota` tables).
* **Real-time Live Refresh**: WebSocket channels (`postgres_changes`) automatically stream new registrations and code redemptions to the Admin Dashboard without manual page refreshes.
* **Row-Level Security (RLS)**: Policies enabled on all tables for secure access.

### 2. 📍 High-Precision Geolocation & Navigation System
* **GPS Warm-up & Stall Detector** (`src/services/geoService.js`):
  * Utilizes `navigator.geolocation.watchPosition` with `enableHighAccuracy: true` and `maximumAge: 0`.
  * Aims for high accuracy (<= 15 meters) and resolves with the best fix once GPS accuracy stabilizes.
* **Sub-Neighbourhood Reverse Geocoding**:
  * Reverse geocodes coordinates via OpenStreetMap Nominatim at `zoom=18` for street and suburb resolution.
  * Caches lookups in-memory to respect third-party rate limits.
* **Haversine Distance Fallback**:
  * Fallback algorithm calculates real spherical distance against 28 international hubs with a 100 km boundary.
* **Google Maps Navigation Integration**:
  * Exact latitude and longitude (e.g. `12.898724, 79.138802`) are recorded.
  * Every user entry features a direct **"Google Maps ↗"** button that opens `https://www.google.com/maps?q=${lat},${lng}` for instant navigation.

### 3. ✉️ Automated Google SMTP Confirmation Emails
* **Vercel Serverless Function** (`api/send-confirmation.js`):
  * Node.js serverless endpoint powered by `nodemailer` connected to Google SMTP (`contactigtyt@gmail.com`).
* **Architectural Dark-Mode Email Design**:
  * Delivers a confirmation email featuring the unique Member ID (`#USR-XXXX`), credentials breakdown, unlocked CAD/Revit library specs, and a direct Google Maps pin link.
* **Non-blocking Dispatch**:
  * Background execution prevents UI stalls, displaying celebratory confetti immediately on submission.

### 4. 🛡️ Comprehensive Admin Dashboard (`/admin`)
* **Secure Access**:
  * Dedicated route available only via `/admin` URL (no keyboard shortcuts).
* **Pioneer Registry & GPS Dispatch**:
  * Live searchable and filterable table by name, email, role, suburb, and city.
  * Dedicated **Exact Coordinates** column with one-click clipboard copy.
  * Accuracy meters (`±12m Precision`, `±45m High`, etc.).
  * Direct Google Maps navigation link per user.
* **Referral Code Management**:
  * Dynamic generation of custom-prefixed codes (e.g. `NEXUS-XXXX-123`).
  * Instant status tracking (`available` vs `redeemed` with redeemer identity).
* **Quota Management & Data Exports**:
  * Live remaining slot tracker with manual override capability.
  * Instant one-click **CSV with GPS** and **JSON** data downloads.

### 5. 📱 Responsive Layout & Mobile Optimization
* **Our Capabilities (`ServicesGrid.jsx`)**:
  * Dynamically maps grid spans so cards maintain a single-column layout on mobile (`col-span-1`), 2 columns on tablet (`sm:grid-cols-2`), and 4 columns on desktop (`lg:grid-cols-4`).
  * Responsive font scaling (`text-3xl sm:text-5xl lg:text-7xl`) preventing text clipping.
* **Selected Work (`CaseStudies.jsx`)**:
  * Replaced rigid aspect ratios with `min-h-[340px] sm:min-h-0 sm:aspect-[4/3]`.
  * Integrated mobile touch tap-to-reveal states (`Tap for info` / `Tap to close`) alongside desktop 3D mouse tilt.
* **Standard Native Cursor**:
  * Default system cursor restored across all screen sizes for clean browser interaction.

---

## 💻 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend Framework** | React 19 + Vite 8 |
| **Styling & Design** | Tailwind CSS v3 (Custom Dark Luxury Theme) |
| **Motion & Animation** | Framer Motion 12, Canvas Confetti |
| **Icons** | Lucide React |
| **Database** | Supabase (PostgreSQL + Realtime WebSockets) |
| **Serverless API** | Vercel Serverless Functions (Node.js) |
| **Email Service** | Google SMTP via Nodemailer |
| **Geocoding** | W3C Geolocation API + OpenStreetMap Nominatim |

---

## 📁 Repository Structure

```
nexus-studio/
├── api/
│   └── send-confirmation.js      # Vercel serverless function (Google SMTP)
├── public/                       # Static public assets
├── src/
│   ├── components/
│   │   ├── admin/
│   │   │   ├── AdminDashboard.jsx    # Real-time admin panel with GPS & maps links
│   │   │   └── AdminLoginModal.jsx   # Admin authentication gate
│   │   ├── layout/
│   │   │   ├── Navbar.jsx            # Dynamic slot counter navigation
│   │   │   └── Footer.jsx            # Studio footer & links
│   │   ├── modals/
│   │   │   └── AccessModal.jsx       # Registration modal with GPS lock & confetti
│   │   ├── sections/
│   │   │   ├── Hero.jsx              # Hero introduction
│   │   │   ├── LogoCloud.jsx         # Partner studios
│   │   │   ├── StorySection.jsx      # Brand narrative
│   │   │   ├── ServicesGrid.jsx      # Our Capabilities (responsive grid)
│   │   │   ├── ProcessTimeline.jsx   # Architectural workflow
│   │   │   ├── CaseStudies.jsx       # Selected Work (interactive 3D cards)
│   │   │   ├── StatsSection.jsx      # Numerical metrics
│   │   │   ├── TeamSection.jsx       # Leadership & principles
│   │   │   ├── PricingSection.jsx    # Pass comparison
│   │   │   ├── FAQSection.jsx        # Frequently asked questions
│   │   │   └── CTASection.jsx        # Final conversion section
│   │   └── ui/
│   │       ├── ScrollProgressBar.jsx # Reading progress indicator
│   │       └── ScrollReveal.jsx      # Viewport scroll triggers
│   ├── data/
│   │   └── content.js                # Core architectural library data
│   ├── services/
│   │   ├── geoService.js             # High-precision GPS & Nominatim geocoding
│   │   ├── storeService.js           # Supabase async data layer & quota logic
│   │   └── supabaseClient.js         # Supabase client initializer
│   ├── App.jsx                       # Main application state & admin routing
│   ├── index.css                     # Global design tokens & Tailwind directives
│   └── main.jsx                      # React 19 entry point
├── supabase/
│   └── schema.sql                    # Initial SQL schema, tables & RLS policies
├── vercel.json                       # SPA rewrite & API routing rules
├── package.json                      # Dependencies & scripts
└── README.md                         # Project documentation
```

---

## ⚙️ Environment Variables

Add the following environment variables to your local `.env` and in your **Vercel Project Settings**:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://xhfrkjxsplxzhedypelm.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_j6SZ2A39iXe_MPLrAxaKJQ_XFpRoHr5

# Admin Credentials
VITE_ADMIN_EMAIL=metheadminlover@gmail.com
VITE_ADMIN_PASSWORD=bharanihema@2007

# Google SMTP Credentials (Serverless Backend)
SMTP_USER=contactigtyt@gmail.com
SMTP_PASS=utle mccy jajv elmg
```

> **Security Note**: Never expose Google App Passwords or Supabase secret keys in frontend Vite code (`import.meta.env`). SMTP credentials are strictly accessed server-side via `process.env` in `/api/send-confirmation.js`.

---

## 🚀 Getting Started Locally

### 1. Clone the repository
```bash
git clone https://github.com/Vixcy300/nexus.git
cd nexus/nexus-studio
```

### 2. Install dependencies
```bash
npm install
```

### 3. Run the development server
```bash
npm run dev
```

### 4. Build for production
```bash
npm run build
```

---

## 🗄️ Database Setup (Supabase)

If setting up a new Supabase instance:
1. Open your Supabase project dashboard.
2. Navigate to **SQL Editor** → **New query**.
3. Paste the contents of [`supabase/schema.sql`](./supabase/schema.sql) and click **Run**.
4. The script will create:
   * `nexus_users`: Stores registration data, GPS coordinates, geocoded addresses, and accuracy.
   * `nexus_referral_codes`: Stores VIP invitation codes and redemption status.
   * `nexus_quota`: Manages the 1,000 slots campaign quota.
   * Enables Row Level Security (RLS) with permissive anon access policies.

---

## 🌐 Production Deployment

The project is configured for deployment on **Vercel**:
* **Live URL**: `https://nexus-ashy-nu-13.vercel.app`
* **Admin Access**: Navigate to `https://nexus-ashy-nu-13.vercel.app/admin`
* **Rewrites**: `vercel.json` routes all non-API paths to `/` (SPA) while routing `/api/*` directly to serverless functions.

---

## 📄 License & Rights

Commercial and academic rights are granted to all verified 1,000 Early Pioneer Pass holders under perpetual royalty-free terms.  
Designed and engineered for **NEXUS Studio** © 2026.

# Citizen Connect AI

You are an expert Full Stack Software Engineer, Product Designer, AI Architect, and Government Technology Consultant. 

Build a complete, production-ready, responsive web application called "Citizen Connect AI" (Tagline: "Your AI-Powered Public Service Assistant"). 

Do NOT use dummy forms or placeholders. Generate fully functional code, wire up the Supabase backend, and integrate the OpenAI API exactly as specified. 

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. TECH STACK & ARCHITECTURE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Frontend: React, TypeScript, Tailwind CSS, shadcn/ui, Framer Motion, Lucide Icons.
- Backend: Supabase (Auth, Database, Storage, Row Level Security).
- AI Engine: OpenAI API (gpt-4o-mini).
- Architecture Flow: Frontend Client → OpenAI Edge Function/API → Supabase Database.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
2. BACKEND & API CREDENTIALS CONFIGURATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Set up the Supabase Client (`@supabase/supabase-js`) and OpenAI integration using these specific environment variables. Wire the app to use these for real data fetching and insertion:

- VITE_SUPABASE_URL: https://supabase.com/dashboard/project/tjlmeljjgpqkjnefvpnf
- VITE_SUPABASE_ANON_KEY: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRqbG1lbGpqZ3Bxa2puZWZ2cG5mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUzOTI4ODgsImV4cCI6MjEwMDk2ODg4OH0.m32huChSzBiwacT9VCtvtRJhrVo6BMc2ILGPv5R458A
- VITE_OPENAI_API_KEY: <@secret:OPENAI_API_KEY >

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
3. DATABASE SCHEMA (SUPABASE)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Create and interact with the following Supabase tables with Row Level Security (RLS) enabled so users only see their own data, while Officers see everything:

Table: `profiles`
- `id` (uuid, references auth.users)
- `name` (text), `email` (text), `phone` (text), `role` (text - 'citizen' or 'officer')
- `created_at` (timestamp)

Table: `complaints`
- `id` (uuid, primary key)
- `user_id` (uuid, references profiles.id)
- `raw_description` (text)
- `title` (text), `category` (text), `department` (text), `priority` (text), `status` (text, default: 'Pending')
- `resolution_estimate` (text), `generated_complaint` (text)
- `latitude` (float), `longitude` (float), `address` (text)
- `image_url` (text), `document_url` (text)
- `created_at` (timestamp)

Table: `alerts` & `schemes`
- Build basic tables for `alerts` (title, description, location, type) and `schemes` (title, description, eligibility, official_link).

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
4. DESIGN SYSTEM & THEME
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Theme: Professional Government Tech, Minimal, Apple-inspired SaaS.
- Colors: Primary Blue & Crisp White, dark mode support.
- Elements: Beautiful glassmorphic rounded cards, soft shadows, excellent spacing.
- Typography: Inter (professional, highly readable).
- States: Add loading skeletons, smooth Framer Motion page transitions, and toast notifications for all database actions.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
5. CORE PAGES & UI COMPONENTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. NAVBAR: Logo "Citizen Connect AI". Links: Home, Report Issue, Track Complaint, Gov Alerts, Gov Schemes, Profile, Theme Toggle.
2. HOME PAGE: Hero section ("AI-Powered Public Service Assistant") and beautiful feature cards (Cyber Crime, Alerts, Schemes, etc.).
3. CITIZEN DASHBOARD (Track): Fetch and display the user's `complaints` from Supabase. Show Status Timeline, Progress, Priority badges, and Search/Filter options.
4. OFFICER DASHBOARD: Protected route for 'officer' roles. Show data tables of all pending/assigned complaints, a Map View of issues, and status update buttons.
5. ALERTS & SCHEMES: Display cards fetched from the database for active government alerts and beneficial schemes.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
6. THE AI "REPORT ISSUE" FEATURE (CRITICAL PATH)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
This is an intelligent step-by-step data collection flow, NOT a generic chatbot. 

UI Flow:
1. Show a large textarea: "Describe your issue..." with "Upload Image" and "Use Current Location" (HTML5 Geolocation / OpenStreetMap draggable marker) buttons.
2. When the user submits, do NOT just save it immediately. Use an interactive AI loading state.
3. Call a reusable API function `generateComplaint(description, location, imageUrl)`. 

AI System Prompt for OpenAI:
"You are the Citizen Connect AI Assistant, acting as 6 specialized agents. Analyze the user's public service issue and generate a formal, government-ready report. Categorize the issue strictly into: Road, Water, Electricity, Street Lights, Garbage, Drainage, Illegal Construction, Traffic, Cyber Crime, Police, Corruption, Gov Schemes, or Other. Assign a priority (Low, Medium, High, Critical). Determine the exact government department responsible.

Respond ONLY with valid JSON in this exact structure:
{
  "title": "string",
  "category": "string",
  "department": "string",
  "priority": "string",
  "required_documents": ["string", "string"],
  "resolution_estimate": "string",
  "complaint_letter": "string (Formal, multi-paragraph letter)"
}"

Submission Execution:
- Take the AI's structured JSON output and immediately insert it into the Supabase `complaints` table alongside the user's original location and image data.
- Transition the UI to display the generated data inside a beautiful "Official Report Preview Card" (showing the formal letter, priority badge, and assigned department).
- Show a "Success" toast notification.

Generate all necessary React components, Supabase client configurations, AI service functions, and routing logic now. Ensure the app is fully deployable and visually stunning.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://citizenai-gov-in.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/2011a069-9dd3-45fe-985e-7f57da8f1cbd).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

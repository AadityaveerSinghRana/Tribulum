# Tribulum — Supabase & Gemini 4 Hydrogen Setup Guide

## 1. Run the Supabase SQL Schema
1. Sign in to [Supabase](https://supabase.com) and open **SQL Editor**.
2. Copy and execute `supabase/schema.sql`. This provisions `user_profiles`, `enrolments`, `fpo_applications`, `village_applications`, `fertiliser_requests`, `contact_messages`, `callback_requests`, and `advisor_queries` with Row Level Security (RLS) enabled.

## 2. Enable Google & Phone Sign-In in Supabase
1. In your Supabase Dashboard, open **Authentication → URL Configuration** and add your app URL (`http://localhost:3000` and your deployed URL) to **Redirect URLs**.
2. **Google Sign-In**: Go to **Authentication → Providers → Google**, enable it, and paste your Google Cloud OAuth Client ID & Client Secret (using Supabase's callback URL shown in that panel).
3. **Phone Number Sign-In (OTP)**: Go to **Authentication → Providers → Phone**, enable it, and connect your SMS provider (e.g. Twilio, MessageBird, or Vonage) for `+91` SMS OTP delivery.

## 3. Configure Environment Variables
Add the following variables in `.env` (and in **Settings > Secrets** when deploying):

```env
SUPABASE_URL="https://your-project-ref.supabase.co"
SUPABASE_ANON_KEY="your-supabase-anon-key"
GEMINI_API_KEY="your-gemini-api-key"
```

## 4. Run Locally
```bash
npm install
npm run dev
```

`server.ts` serves the Express API (`/api/crop-advisor` powered by `gemini-4-hydrogen`) alongside the Vite frontend on port `3000`.

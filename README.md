# AI MindMap Architect

A powerful, AI-enhanced mind mapping tool built with React, Tailwind CSS, and Google Gemini.

## Features
- **AI Expansion**: Automatically generate sub-topics using Google Gemini.
- **Cloud Sync**: Save and load maps across devices using Supabase.
- **Visual Editor**: Interactive mind map visualization with D3.js.

## 🚀 Deployment Guide

### 1. Push to GitHub
Use the "Sync to GitHub" button in your editor to create a repository.

### 2. Setup Supabase (Database)
1. Create a project at [Supabase.com](https://supabase.com).
2. Go to **SQL Editor** and run the following script:
   ```sql
   create table mindmaps (
     id uuid default gen_random_uuid() primary key,
     user_id uuid references auth.users not null,
     content jsonb,
     updated_at timestamp with time zone default timezone('utc'::text, now())
   );
   alter table mindmaps enable row level security;
   create policy "Users can manage their own mindmaps" on mindmaps
     for all using (auth.uid() = user_id);
   ```
3. Go to **Authentication -> URL Configuration** and add your Vercel domain to "Site URL".

### 3. Deploy to Vercel
1. Import your GitHub repository to Vercel.
2. Add the following **Environment Variables**:

| Variable | Description |
| (Name) | (Value) |
| `API_KEY` | Your Google Gemini API Key |
| `SUPABASE_URL` | Found in Supabase Settings -> API |
| `SUPABASE_ANON_KEY` | Found in Supabase Settings -> API |

3. Click **Deploy**.

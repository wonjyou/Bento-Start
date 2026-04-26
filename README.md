# Bento Start — Your Daily Dashboard

A personalized browser start page built as a bento-box grid of cards and widgets. Customize your layout, organize your links, and get quick access to search, weather, news, and directions — all from one page.

## Features

### Widgets
| Widget | Description |
|--------|-------------|
| **Greeting** | Date, time, and personalized greeting based on time of day |
| **Links** | Curated link collections with editable titles and URLs |
| **Search** | Google and Wikipedia search with recent search history |
| **Weather** | Current conditions and temperature via Open-Meteo |
| **News Feed** | Live trending headlines from Reddit r/news |
| **Directions** | Address input that opens Google Maps directions |

### Layout & Customization
- **Bento grid** — responsive 4–5 column CSS grid
- **Drag and drop** — reorder cards by dragging
- **Resize cards** — small, medium, or large grid spans
- **8 color themes** per card — default, blue, gray, dark, emerald, rose, amber, indigo
- **Add / remove cards** — build the layout you want

### Storage
- **Local mode** — data saved to `localStorage`, no account required. Active by default when not signed in.
- **Cloud sync** — sign in with Google to sync your dashboard via Supabase. Data follows you across devices.
- **Manual override** — signed-in users can switch to local mode from Settings at any time.
- **Export** — download your current dashboard as a `bento-data-YYYY-MM-DD.json` file.

## Tech Stack

- **React 19** + **TypeScript** — UI and type safety
- **Vite** — dev server and build tool (port 3000)
- **Supabase** — cloud storage and Google OAuth
- **Open-Meteo** — free weather API (no key required)
- **lucide-react** — icons
- **date-fns** — date formatting

## Getting Started

**Prerequisites:** Node.js

1. Install dependencies:
   ```bash
   npm install
   ```

2. Copy `.env.local` and fill in your keys (Supabase is optional):
   ```
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
   - Create a free Supabase project at [supabase.com](https://supabase.com) and run `supabase-schema.sql` to set up the database

   > **Note:** Supabase is optional. The app works fully in local mode without any cloud credentials.

3. Run the dev server:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000)

## Database Setup (optional)

To enable cloud sync, create a Supabase project and run the SQL in `supabase-schema.sql`. This creates three tables (`user_settings`, `cards`, `links`) with Row-Level Security so users can only access their own data.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server with hot reload |
| `npm run build` | Build for production |
| `npm run preview` | Preview the production build locally |
| `npm run typecheck` | Run TypeScript type checking |

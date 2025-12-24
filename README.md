# 🎌 Anime Tier List Maker

![Project Status](https://img.shields.io/badge/status-active-success)
![React](https://img.shields.io/badge/React-v19-blue)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8)
![Supabase](https://img.shields.io/badge/Supabase-Auth_&_DB-3ecf8e)
![License](https://img.shields.io/badge/license-MIT-green)

A modern, highly interactive web application designed for anime enthusiasts to rank and organize their favorite series. Built with the latest frontend technologies, it features a fluid drag-and-drop experience, real-time API integration, and cloud persistence.

**[Live Demo](#) · [Report Bug](#) · [Request Feature](#)**

---

## ✨ Key Features

This isn't just a static grid; it's a fully reactive application focused on UX/UI details.

* **⚡ Modern Tech Stack:** Built on **React 19** and **Vite**, utilizing the bleeding-edge **Tailwind CSS v4** for styling.
* **☁️ Cloud Save & Auth:** Integrated with **Supabase** for user authentication and cloud storage. Log in to save your templates and share them with the community.
* **🖐️ Advanced Drag & Drop:** Powered by **@dnd-kit**, supporting a hybrid sorting strategy. You can drag animes between tiers, reorder them within rows, and even **reorder the Tier Rows themselves**.
* **🔍 Live Search with Debounce:** Integrated with the **Jikan API (MyAnimeList)**. Includes a custom debounce hook to optimize API calls.
* **🎬 Cinematic Preview:** A dedicated "Glassmorphism" UI component that reveals high-res artwork and metadata (Score, Year, Synopsis) when hovering over an anime, powered by Framer Motion.
* **📸 Clean Export:** One-click export to PNG using **html-to-image**. The export engine intelligently filters out UI controls to generate a clean, shareable image.

---

## 🛠️ Technical Stack

I chose this stack to maximize performance and developer experience, leveraging the newest versions of key libraries.

| Category | Technology | Usage |
| :--- | :--- | :--- |
| **Core** | React 19 + Vite | Fast HMR and latest React concurrent features. |
| **Styling** | Tailwind CSS v4 | Zero-runtime styling with the new `@tailwindcss/vite` plugin. |
| **Backend** | Supabase | Auth, Database (PostgreSQL), and Row Level Security. |
| **DnD** | @dnd-kit | Accessible, modular drag-and-drop primitives. |
| **Motion** | Framer Motion | Complex layout animations and micro-interactions. |
| **Data** | Jikan API v4 | Asynchronous data fetching for anime metadata. |
| **Utils** | html-to-image | DOM-to-Canvas generation for exporting results. |

---

## 🚀 Getting Started

To run this project locally, follow these steps:

### Prerequisites
* Node.js (v18 or higher recommended)
* npm or yarn

### Installation & Setup

1.  **Clone the repository**
    ```bash
    git clone [https://github.com/germanlaste/anime-tier-list.git](https://github.com/germanlaste/anime-tier-list.git)
    cd anime-tier-list
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Environment Variables**
    Create a `.env` file in the root directory based on the example:
    ```bash
    cp .env.example .env
    ```
    
    Fill in your Supabase credentials in the `.env` file:
    ```env
    VITE_SUPABASE_URL=your_supabase_project_url
    VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
    ```
    *(You will need to create a Supabase project and set up the `tier_templates` and `template_items` tables)*.

4.  **Start the development server**
    ```bash
    npm run dev
    ```

5.  Open `http://localhost:5173` in your browser.

---

## 🎨 Project Structure

A quick look at the component architecture:

```text
src/
├── components/
│   ├── AnimeCard.jsx        # Individual card component
│   ├── AnimeSearch.jsx      # Live search with Debounce & Draggable results
│   ├── CinematicPreview.jsx # Hover overlay with Framer Motion
│   ├── TierRow.jsx          # Sortable Row container
│   ├── TemplateGallery.jsx  # Supabase integration for community templates
│   └── ...
├── hooks/
│   ├── useTierList.js       # Main logic (Drag & Drop, State)
│   ├── useTemplates.js      # Supabase CRUD operations
│   └── useDebounce.js       # Helper for API calls
├── lib/
│   └── supabaseClient.js    # Database connection client
└── App.jsx                  # Main Layout & Context
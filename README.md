# 🎌 Anime Tier List Maker

![Project Status](https://img.shields.io/badge/status-active-success)
![React](https://img.shields.io/badge/React-v19-blue)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8)
![License](https://img.shields.io/badge/license-MIT-green)

A modern, highly interactive web application designed for anime enthusiasts to rank and organize their favorite series. Built with the latest frontend technologies, it features a fluid drag-and-drop experience, real-time API integration, and a "cinematic" aesthetic.

**[Live Demo](#) · [Report Bug](#) · [Request Feature](#)**

---

## ✨ Key Features

This isn't just a static grid; it's a fully reactive application focused on UX/UI details.

* **⚡ Modern Tech Stack:** Built on **React 19** and **Vite**, utilizing the bleeding-edge **Tailwind CSS v4** for styling.
* **🖐️ Advanced Drag & Drop:** Powered by **@dnd-kit**, supporting a hybrid sorting strategy. You can drag animes between tiers, reorder them within rows, and even **reorder the Tier Rows themselves**.
* **🔍 Live Search with Debounce:** Integrated with the **Jikan API (MyAnimeList)**. Includes a custom 500ms debounce hook to optimize API calls and prevent rate limiting while typing.
* **🎬 Cinematic Preview:** A dedicated "Glassmorphism" UI component that reveals high-res artwork and metadata (Score, Year, Synopsis) when hovering over an anime, powered by **Framer Motion** for smooth entrance/exit animations.
* **💾 Smart Persistence:** Your progress (rows, colors, and ranked items) is automatically saved to `localStorage`, so you never lose your list on refresh.
* **📸 Clean Export:** One-click export to PNG using `html-to-image`. The export engine intelligently filters out UI controls (buttons, trash cans) using custom data attributes (`data-hide-on-export`) to generate a clean, shareable image.

---

## 🛠️ Technical Stack

I chose this stack to maximize performance and developer experience, leveraging the newest versions of key libraries.

| Category | Technology | Usage |
| :--- | :--- | :--- |
| **Core** | React 19 + Vite | Fast HMR and latest React concurrent features. |
| **Styling** | Tailwind CSS v4 | Zero-runtime styling with the new `@tailwindcss/vite` plugin. |
| **DnD** | @dnd-kit (Core/Sortable) | Accessible, modular drag-and-drop primitives. |
| **Motion** | Framer Motion | Complex layout animations and micro-interactions. |
| **Data** | Jikan API v4 | Asynchronous data fetching for anime metadata. |
| **Utils** | html-to-image | DOM-to-Canvas generation for exporting results. |

---

## 🚀 Getting Started

To run this project locally, follow these steps:

### Prerequisites
* Node.js (v18 or higher recommended)
* npm or yarn

### Installation

1.  **Clone the repository**
    ```bash
    git clone [https://github.com/yourusername/anime-tier-list.git](https://github.com/yourusername/anime-tier-list.git)
    cd anime-tier-list
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Start the development server**
    ```bash
    npm run dev
    ```

4.  Open `http://localhost:5173` in your browser.

---

## 🎨 Project Structure

A quick look at the component architecture:

```text
src/
├── components/
│   ├── AnimeCard.jsx        # Individual card component
│   ├── AnimeSearch.jsx      # Live search with Debounce & Draggable results
│   ├── CinematicPreview.jsx # Hover overlay with Framer Motion
│   ├── DraggableAnime.jsx   # Wrapper for Sortable DnD items
│   ├── TierRow.jsx          # Sortable Row container
│   └── ...
├── App.jsx                  # Main logic (State, Context, Handlers)
└── index.css                # Global styles & Tailwind directives
🤝 Contributing
Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are greatly appreciated.

Fork the Project

Create your Feature Branch (git checkout -b feature/AmazingFeature)

Commit your Changes (git commit -m 'Add some AmazingFeature')

Push to the Branch (git push origin feature/AmazingFeature)

Open a Pull Request

📄 License
Distributed under the MIT License. See LICENSE for more information.

<p align="center"> Built with ❤️ and ☕ by <a href="https://www.google.com/search?q=https://github.com/germanlaste">GermanLaste</a> </p>


### 📝 Instrucciones rápidas:

1.  Crea un archivo llamado `README.md` en la raíz de tu proyecto (al lado de `package.json`).
2.  Pega el código de arriba.
3.  Guardalo.
4.  Cuando lo subas a GitHub, ¡se verá con los títulos grandes, las tablas y los badges de colores\!
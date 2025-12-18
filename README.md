<div align="center">
  <img src="public/banner-placeholder.png" alt="Anime Tier List Maker Banner" width="100%" />

  <br />

  # ⛩️ Anime Tier List Maker
  
  **Create, Rank, and Share your ultimate Anime Tier Lists with style.**
  
  <p align="center">
    <a href="https://reactjs.org/">
      <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
    </a>
    <a href="https://vitejs.dev/">
      <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
    </a>
    <a href="https://tailwindcss.com/">
      <img src="https://img.shields.io/badge/Tailwind_CSS_v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
    </a>
    <a href="https://dndkit.com/">
      <img src="https://img.shields.io/badge/dnd--kit-DnD-orange?style=for-the-badge" alt="Dnd Kit" />
    </a>
  </p>

  <p align="center">
    🚀 <a href="LINK_DE_TU_DEPLOY_SI_TIENES">View Live Demo</a> • 🐛 <a href="issues">Report Bug</a>
  </p>
</div>

---

## ⚡ Overview

**Anime Tier List Maker** is a modern, high-performance web application designed for anime enthusiasts. Unlike standard tier makers, this project focuses on **User Experience (UX)** and **Aesthetic**, featuring a "Glassmorphism" design, smooth animations, and a sophisticated Drag & Drop system.

Powered by the **Jikan API** (MyAnimeList), users can search for any anime instantly, drag it into custom tiers, and export a high-quality image to share on social media.

## ✨ Key Features

### 🎮 Advanced Drag & Drop System
Implemented a **Hybrid Collision Detection** strategy using `@dnd-kit`:
- **For Animes:** Uses `pointerWithin` algorithm for precise placement into small drop zones.
- **For Rows:** Uses `closestCenter` algorithm for smooth vertical reordering of the tiers themselves.
- **Result:** A conflict-free experience where you can sort animes *and* reorder tiers simultaneously.

### 🎨 "Premium" UI/UX
- **Aurora Borealis Background:** Custom CSS-only animated background.
- **Glassmorphism:** Translucent panels with backdrop blur.
- **Cinematic Preview:** Hovering over an anime reveals a high-res cover art in a cinematic overlay.
- **Interactive Tiers:** Rename tiers and change their colors using a custom popover palette with live preview.

### 🛠️ Utilities
- **Live Search:** Real-time debounced search connected to Jikan API v4.
- **Smart Persistence:** Never lose progress. State is automatically saved to `localStorage`.
- **Clean Export:** Generates a marketing-ready PNG using `html-to-image`.
  - *Magic Feature:* Automatically hides UI elements (delete buttons, settings) and injects a watermark footer only during the capture process.

## 📸 Screenshots

| Dashboard & Stats | Custom Color Picker |
|:---:|:---:|
| <img src="URL_DE_TU_IMAGEN_1.png" width="400" /> | <img src="URL_DE_TU_IMAGEN_2.png" width="400" /> |

| Drag & Drop Action | Exported Image |
|:---:|:---:|
| <img src="URL_DE_TU_IMAGEN_3.png" width="400" /> | <img src="URL_DE_TU_IMAGEN_4.png" width="400" /> |

## 🔧 Tech Stack

- **Core:** React 18 + Vite
- **Styling:** Tailwind CSS **v4** (Native CSS configuration) + Fonts (Outfit)
- **State & Logic:** Custom Hooks + LocalStorage
- **Drag & Drop:** `@dnd-kit/core`, `@dnd-kit/sortable`
- **Animation:** Framer Motion (Spring animations)
- **Imaging:** `html-to-image` (OKLCH color support)

## 🚀 Installation

Clone the project and install dependencies:

```bash
# Clone the repo
git clone [https://github.com/TU_USUARIO/anime-tier-list.git](https://github.com/TU_USUARIO/anime-tier-list.git)

# Enter the directory
cd anime-tier-list

# Install dependencies
npm install

# Run development server
npm run dev

🤝 Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

📄 License
This project is open source and available under the MIT License.

<div align="center"> Created with ❤️ by <b>[GermanLaste]</b> </div>
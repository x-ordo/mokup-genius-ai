# MockupGenius AI

MockupGenius is a React-based web application that leverages Google's Gemini AI models to generate and edit product mockups. It provides a seamless workflow for creating high-quality visual assets, placing logos on products, and refining images using natural language prompts.

## 🚀 Project Overview

The application is built with **React 19** and **Vite**, utilizing **TypeScript** for type safety. It integrates directly with the Google Gemini API to perform advanced image generation and manipulation tasks.

### Key Features

1.  **Product Mockups:**
    *   Upload logos and preview them on predefined product templates (mugs, t-shirts, tote bags).
    *   Uses CSS positioning for real-time, lightweight previews.
2.  **Generate Assets:**
    *   Create new images from text prompts using **Gemini 3 Pro** (`gemini-3-pro-image-preview`).
    *   Supports multiple quality resolutions (1K, 2K, 4K).
3.  **AI Editor:**
    *   Edit existing images (uploaded or generated) using natural language instructions.
    *   Powered by **Gemini 2.5 Flash** (`gemini-2.5-flash-image`) for fast transformations.

## 🛠 Tech Stack

*   **Frontend:** React 19, TypeScript, Vite
*   **Styling:** Tailwind CSS
*   **Icons:** Lucide React
*   **AI Integration:** `@google/genai` (Google Gemini SDK)
*   **State Management:** React Hooks (`useState`)

## 📂 Project Structure

*   `App.tsx`: The main application controller. Handles view switching (Mockup, Generate, Edit), manages application state, and renders the primary UI sections.
*   `services/geminiService.ts`: A dedicated service layer interacting with the Gemini API. It handles client initialization, API key management, and executes image generation/editing requests.
*   `components/`: Contains reusable UI components like `Sidebar` and `Button`.
*   `types.ts`: Defines shared TypeScript interfaces (`AppView`, `MockupProduct`, `ImageSize`) used throughout the app.

## 💻 Building and Running

### Prerequisites
*   Node.js installed.
*   A Google Gemini API Key.

### Setup Instructions

1.  **Install Dependencies:**
    ```bash
    npm install
    ```

2.  **Environment Configuration:**
    Create a `.env.local` file in the root directory and add your API key:
    ```env
    GEMINI_API_KEY=your_api_key_here
    ```

3.  **Run Development Server:**
    ```bash
    npm run dev
    ```
    The app will typically start at `http://localhost:3000`.

4.  **Build for Production:**
    ```bash
    npm run build
    ```

## 📐 Development Conventions

*   **Component Structure:** Components are functional and typed with `React.FC`.
*   **Styling:** Utility-first CSS using Tailwind classes is the standard.
*   **Service Layer:** All external API logic (Gemini interactions) is encapsulated within `services/geminiService.ts` to keep UI components clean.
*   **Types:** Shared types are centralized in `types.ts` to ensure consistency across the application.

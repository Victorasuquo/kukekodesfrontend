# KukeKodes Frontend

A modern Learning Management System (LMS) frontend built with React, Vite, and Tailwind CSS. This application provides a platform for students to view courses and for administrators to manage content.

## Features

- **Student Dashboard**: View enrolled courses and track progress.
- **Course Player**: Video playback, lesson tracking, and quizzes.
- **Admin Dashboard**: Create, edit, and delete courses and lessons.
- **Responsive Design**: Built with Tailwind CSS and Shadcn UI.

## Tech Stack

- **Framework**: React 18 + Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Shadcn UI
- **Routing**: React Router DOM
- **Authentication**: Custom Auth Context + Django Backend Integration

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd kukekodesfrontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Running the Application

Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:8080`.

### Building for Production

To build the application for deployment:

```bash
npm run build
```

The build artifacts will be stored in the `dist/` directory.

## Backend Integration

This frontend is designed to work with a Django backend. Ensure your backend is running and the `API_BASE_URL` in `src/services/api.ts` is correctly configured (default: `https://linkup-neon-ten.vercel.app`).

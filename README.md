![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)![Vite](https://img.shields.io/badge/Vite-6-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![React Router](https://img.shields.io/badge/React_Router-7-CA4245?style=for-the-badge&logo=react-router&logoColor=white)
![Jest](https://img.shields.io/badge/Jest-30-C21325?style=for-the-badge&logo=jest&logoColor=white)
![Testing Library](https://img.shields.io/badge/Testing_Library-16-E33332?style=for-the-badge&logo=testing-library&logoColor=white)
![ESLint](https://img.shields.io/badge/ESLint-9-4B32C3?style=for-the-badge&logo=eslint&logoColor=white)

# Tramora Library

A modern React library application built with Vite, TypeScript, and Tailwind CSS.

## Features

- **Authentication** - Login/Register with form validation
- **Book Catalog** - Browse and search books
- **Modern UI** - Built with Tailwind CSS and Radix UI primitives
- **Testing** - Unit and integration tests with Jest + React Testing Library

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Running Tests

```bash
# Run tests once
npm test

# Run tests in watch mode
npm run test:watch
```

Test setup includes:

- **Jest** with TypeScript support via ts-jest
- **React Testing Library** for component testing
- **@testing-library/jest-dom** for DOM matchers
- Mocks for react-router, lucide-react, and environment config

## Scripts

| Command              | Description              |
| -------------------- | ------------------------ |
| `npm run dev`        | Start development server |
| `npm run build`      | Build for production     |
| `npm run preview`    | Preview production build |
| `npm run lint`       | Run ESLint               |
| `npm test`           | Run tests                |
| `npm run test:watch` | Run tests in watch mode  |

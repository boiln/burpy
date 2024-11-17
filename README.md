# Burpy - Burp Suite HTTP session viewer

A modern, fast, and user-friendly web application for viewing Burp Suite Community Edition saved session files.

Burpy (11.16.24)
![burpy_v1](https://github.com/user-attachments/assets/325ff36e-1125-4186-8f94-7bb9e244c4c2)

## Features

-   🚀 Fast and responsive UI
-   📝 Syntax highlighting for HTTP requests/responses
-   🎨 Light/Dark theme support
-   💻 Cross-platform compatibility
-   📋 Context menu with copy and decode options
-   🎯 JSON formatting and minification

## Tech Stack

-   Next.js 14
-   TypeScript
-   Tailwind CSS
-   Shadcn UI
-   Radix UI

## Getting Started

### Prerequisites

-   Node.js 20 or higher
-   pnpm (recommended) or npm

### Installation

1. Clone the repository:

```bash
git clone https://github.com/Boiln/burpy.git
```

```bash
cd burpy
```

2. Install dependencies:

```bash
pnpm install
```

3. Start the development server:

```bash
pnpm dev
```

The application will be available at `http://localhost:3069`

### Docker Installation

Build and run using Docker Compose:

```bash
docker compose up -d
```

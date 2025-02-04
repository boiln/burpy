# Burpy

A high-performance HTTP session viewer and analyzer built with modern web technologies.

![Burpy Interface](https://github.com/user-attachments/assets/87f4760f-2d62-4219-aa2b-640d97a02467)

## Overview

Burpy is a web-based tool designed for developers and security professionals to analyze HTTP session files. It provides a clean, intuitive interface for inspecting request/response data with features like syntax highlighting, JSON formatting, and dark mode support.

## Key Features

-   Real-time syntax highlighting for HTTP, JSON, and other common formats
-   Advanced request/response parsing and formatting
-   Responsive interface
-   Cross-platform compatibility
-   Dark theme
-   JSON structure analysis and validation

## Tech Stack

-   Next.js 15
-   TypeScript
-   Tailwind CSS
-   Shadcn UI Components

## Getting Started

### Prerequisites

-   Node.js >= 20
-   pnpm (recommended) or npm

### Local Development

1. Clone the repository

```bash
git clone https://github.com/Boiln/burpy.git
cd burpy
```

2. Install dependencies

```bash
pnpm install
```

3. Start the development server

```bash
pnpm dev
```

The application will be available at `http://localhost:3002`

### Docker Deployment

For production environments, we recommend using Docker:

```bash
docker compose up -d
```

## Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

-   Built with [Next.js](https://nextjs.org/)
-   UI components from [Shadcn UI](https://ui.shadcn.com/)
-   Syntax highlighting powered by [Prism.js](https://prismjs.com/)

# Solana Blog dApp - Frontend

A Next.js frontend for the Solana Blog decentralized application.

## Quick Start

```bash
# Navigate to the project
cd blog

# Install dependencies
yarn install

# Run development server
yarn dev

# Build for production
yarn build

# Start production server
yarn start
```

## Features

- Connect Solana wallet (Phantom, Solflare, etc.)
- Create blog posts with title and content
- View all your blog posts
- Edit existing posts
- Delete posts
- View posts on Solana Explorer
- Real-time updates via React Query
- Responsive design with TailwindCSS/DaisyUI

## Technology Stack

- **Next.js 15** - React framework with App Router
- **Anchor/Solana Web3.js** - Solana blockchain interaction
- **Wallet Adapter** - Multi-wallet support
- **React Query** - State management and caching
- **TailwindCSS** - Styling
- **DaisyUI** - UI components
- **TypeScript** - Type safety

## Environment Setup

The frontend is pre-configured to connect to:
- **Program ID**: `M4h1dMsA4b25oM7GAR6ycYAhwc3fS9HVQoKh8hS1Une`
- **Cluster**: Devnet

## Deployment

To deploy to Vercel:

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd blog
vercel
```

Or connect your GitHub repository to Vercel for automatic deployments.
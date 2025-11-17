# Solana Blog dApp - Anchor Project

A decentralized blog application on Solana where users can create, update, and delete blog posts stored on-chain.

## Quick Start

```bash
# Navigate to the project
cd blog

# Install dependencies
yarn install

# Build the program
anchor build

# Run tests
anchor test --skip-local-validator

# Deploy to devnet (if needed)
anchor deploy --provider.cluster devnet
```

## Program Details

**Program ID**: `M4h1dMsA4b25oM7GAR6ycYAhwc3fS9HVQoKh8hS1Une`

**Deployed on**: Solana Devnet

## Features

- Create blog posts with title (max 50 chars) and content (max 1000 chars)
- Update existing posts
- Delete posts and reclaim rent
- Automatic timestamps for creation and updates
- PDA-based storage for deterministic addressing

## Program Instructions

1. **create_blog_entry(title, content)** - Create a new blog post
2. **update_blog_entry(title, content)** - Update an existing post
3. **delete_blog_entry(title)** - Delete a post

## Testing

The project includes comprehensive tests:
- 4 happy path tests (successful operations)
- 10 unhappy path tests (error scenarios)
- 12/14 tests pass (2 fail due to devnet rate limits)

Run tests with:
```bash
anchor test --skip-local-validator
```
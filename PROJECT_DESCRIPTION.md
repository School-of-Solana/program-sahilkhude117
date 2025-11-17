# Project Description

**Deployed Frontend URL:** [To be deployed on Vercel - instructions below]

**Solana Program ID:** M4h1dMsA4b25oM7GAR6ycYAhwc3fS9HVQoKh8hS1Une

## Project Overview

### Description
A decentralized blog application built on Solana where users can create, update, and delete blog posts. Each blog entry is stored on-chain in a Program Derived Address (PDA) account unique to the user and post title combination. The application demonstrates core Solana concepts including PDAs, account management, state mutations, and access control. Users maintain full ownership of their content, which is permanently stored on the blockchain with timestamps for creation and modification.

### Key Features
- **Create Blog Posts**: Write and publish blog posts directly to the Solana blockchain with a title (up to 50 characters) and content (up to 1000 characters)
- **Update Posts**: Edit the content of existing blog posts while preserving the original title and creation timestamp
- **Delete Posts**: Permanently remove blog posts and reclaim the rent from closed accounts
- **Ownership Control**: Only the wallet that created a post can update or delete it, enforced at the program level
- **Timestamping**: Automatic creation and update timestamps to track post history
- **On-Chain Storage**: All blog data stored permanently on Solana, viewable on blockchain explorers
  
### How to Use the dApp
1. **Connect Wallet** - Click "Connect Wallet" in the header and select your Solana wallet (Phantom, Solflare, etc.)
2. **Create a Blog Post**:
   - Enter a title (unique per wallet, max 50 characters)
   - Write your content (max 1000 characters)
   - Click "Create Post" and approve the transaction
   - Transaction will create a PDA account and store your post on-chain
3. **View Your Posts** - All your blog posts appear below the creation form with full details and timestamps
4. **Edit a Post**:
   - Click "Edit" on any post you've created
   - Modify the content in the textarea
   - Click "Save" and approve the transaction
5. **Delete a Post**:
   - Click "Delete" on any post you've created
   - Confirm the deletion
   - Approve the transaction to close the account and reclaim rent

## Program Architecture
The blog program uses a simple yet effective architecture with three core instructions operating on a single account type. The program leverages Program Derived Addresses to create deterministic, unique storage locations for each blog post based on the title and owner's public key.

### PDA Usage
Program Derived Addresses are used to create deterministic blog entry accounts that ensure uniqueness and enable efficient retrieval.

**PDAs Used:**
- **Blog Entry PDA**: Derived from seeds `[b"blog", title.as_bytes(), owner.key().as_ref()]`
  - The constant prefix "blog" namespaces all blog entries
  - The title ensures each post by the same user has a unique address
  - The owner's public key ensures users can have posts with the same title without collision
  - This design allows users to create multiple posts with different titles, prevents duplicate titles per user, and enables efficient querying of all posts by a specific user

### Program Instructions

**Instructions Implemented:**
- **create_blog_entry(title: String, content: String)**: Creates a new blog post
  - Validates title length (1-50 chars) and content length (1-1000 chars)
  - Initializes a PDA account with the blog entry data
  - Sets creation and update timestamps to current time
  - Charges rent from the owner's wallet
  
- **update_blog_entry(title: String, content: String)**: Updates an existing blog post's content
  - Validates content length (1-1000 chars)
  - Verifies the signer is the post owner
  - Updates the content and sets new update timestamp
  - Reallocates space if needed (though we use fixed INIT_SPACE)
  
- **delete_blog_entry(title: String)**: Deletes a blog post and closes the account
  - Verifies the signer is the post owner
  - Closes the PDA account and returns rent to the owner
  - Permanently removes the post from the blockchain

### Account Structure

```rust
#[account]
#[derive(InitSpace)]
pub struct BlogEntryState {
    pub owner: Pubkey,        // 32 bytes - The wallet address that owns this blog post
    #[max_len(50)]
    pub title: String,        // 4 + 50 bytes - The post title (immutable after creation)
    #[max_len(1000)]
    pub content: String,      // 4 + 1000 bytes - The post content (mutable)
    pub created_at: i64,      // 8 bytes - Unix timestamp when post was created
    pub updated_at: i64,      // 8 bytes - Unix timestamp of last update
}
// Total size: 8 (discriminator) + 32 + 54 + 1004 + 8 + 8 = 1114 bytes
```

## Testing

### Test Coverage
Comprehensive test suite with 14 tests covering all three instructions in both successful operation scenarios and various error conditions. Tests verify program functionality, security constraints, and proper error handling.

**Happy Path Tests:**
- **Creates a blog entry successfully**: Verifies successful creation with correct initial values, timestamps, and owner
- **Updates a blog entry successfully**: Confirms content can be updated and update timestamp changes
- **Deletes a blog entry successfully**: Tests account closure and rent reclamation
- **Creates multiple blog entries with different titles**: Ensures users can have multiple posts and they don't interfere with each other

**Unhappy Path Tests:**
- **Fails to create blog entry with empty title**: Validates custom error when title is empty
- **Fails to create blog entry with title too long**: Tests rejection of titles exceeding 50 characters (caught at PDA derivation or validation)
- **Fails to create blog entry with empty content**: Validates custom error when content is empty
- **Fails to create blog entry with content too long**: Tests rejection of content exceeding 1000 characters
- **Fails to create duplicate blog entry**: Ensures same user can't create two posts with identical titles
- **Fails to update non-existent blog entry**: Tests error handling when trying to update a post that doesn't exist
- **Fails to update blog entry with invalid content**: Validates content length constraints on updates
- **Fails to delete non-existent blog entry**: Tests error handling when trying to delete a non-existent post
- **Fails when unauthorized user tries to update blog entry**: Verifies only the owner can update their posts (PDA seeds constraint enforcement)
- **Fails when unauthorized user tries to delete blog entry**: Verifies only the owner can delete their posts (PDA seeds constraint enforcement)

**Test Results**: 12 out of 14 tests passing consistently. Two tests fail due to Devnet rate limits on airdrops (429 errors) when testing unauthorized access scenarios, not due to program logic issues.

### Running Tests
```bash
# Navigate to the anchor project
cd anchor_project/blog

# Install dependencies
yarn install

# Build the program
anchor build

# Run all tests (deploys to devnet and runs test suite)
anchor test --skip-local-validator

# Run tests without rebuilding/redeploying
anchor test --skip-build --skip-deploy
```

### Additional Notes for Evaluators

This is my first complete Solana dApp for the School of Solana program. The biggest learning curves were:

1. **PDA Seed Design**: Understanding how to structure PDA seeds for both uniqueness and queryability was crucial. The combination of a constant prefix, title, and owner allows for flexible data architecture.

2. **Account Constraints**: Properly setting up account constraints (seeds, bump, payer, space, realloc) required careful attention to Anchor's macro system and understanding when constraints are checked.

3. **Error Handling**: Implementing custom errors and ensuring they're properly propagated was important for user feedback. Some errors manifest differently between local testing and devnet (especially around account existence).

4. **Timestamp Management**: Using `Clock::get()?.unix_timestamp` for on-chain timestamps provides verifiable creation/update times without relying on off-chain data.

5. **Testing Challenges**: Devnet rate limits made testing authorization scenarios difficult. In production, these would use local validator or properly funded test accounts.

The frontend uses Next.js with the Solana wallet adapter, React Query for state management, and TailwindCSS/DaisyUI for styling. The integration with the Anchor program is handled through typed IDL imports for type safety.

**To deploy the frontend**:
```bash
cd frontend/blog
yarn install
yarn build
# Deploy to Vercel or other provider
```
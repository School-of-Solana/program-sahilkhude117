import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Blog } from "../target/types/blog";
import { assert } from "chai";

describe("blog", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Blog as Program<Blog>;
  const owner = provider.wallet as anchor.Wallet;

  const testTitle = "My First Blog Post";
  const testContent = "This is the content of my first blog post on Solana!";
  const updatedContent = "This is the updated content of my blog post.";

  // Helper function to derive blog entry PDA
  const getBlogEntryPDA = async (title: string, ownerPubkey: anchor.web3.PublicKey) => {
    const [pda] = await anchor.web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from("blog"),
        Buffer.from(title),
        ownerPubkey.toBuffer()
      ],
      program.programId
    );
    return pda;
  };

  describe("Happy Path Tests", () => {
    it("Creates a blog entry successfully", async () => {
      const blogEntryPDA = await getBlogEntryPDA(testTitle, owner.publicKey);

      await program.methods
        .createBlogEntry(testTitle, testContent)
        .accounts({
          blogEntry: blogEntryPDA,
          owner: owner.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();

      // Fetch and verify the created blog entry
      const blogEntry = await program.account.blogEntryState.fetch(blogEntryPDA);
      
      assert.equal(blogEntry.owner.toString(), owner.publicKey.toString());
      assert.equal(blogEntry.title, testTitle);
      assert.equal(blogEntry.content, testContent);
      assert.isTrue(blogEntry.createdAt.toNumber() > 0);
      assert.equal(blogEntry.createdAt.toNumber(), blogEntry.updatedAt.toNumber());
    });

    it("Updates a blog entry successfully", async () => {
      const blogEntryPDA = await getBlogEntryPDA(testTitle, owner.publicKey);

      // Wait a moment to ensure different timestamp
      await new Promise(resolve => setTimeout(resolve, 1000));

      await program.methods
        .updateBlogEntry(testTitle, updatedContent)
        .accounts({
          blogEntry: blogEntryPDA,
          owner: owner.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();

      // Fetch and verify the updated blog entry
      const blogEntry = await program.account.blogEntryState.fetch(blogEntryPDA);
      
      assert.equal(blogEntry.content, updatedContent);
      assert.isTrue(blogEntry.updatedAt.toNumber() > blogEntry.createdAt.toNumber());
    });

    it("Deletes a blog entry successfully", async () => {
      const blogEntryPDA = await getBlogEntryPDA(testTitle, owner.publicKey);

      await program.methods
        .deleteBlogEntry(testTitle)
        .accounts({
          blogEntry: blogEntryPDA,
          owner: owner.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();

      // Verify the account is closed
      try {
        await program.account.blogEntryState.fetch(blogEntryPDA);
        assert.fail("Account should have been closed");
      } catch (error) {
        assert.include(error.message, "Account does not exist");
      }
    });

    it("Creates multiple blog entries with different titles", async () => {
      const title1 = "First Post";
      const title2 = "Second Post";
      const content1 = "Content for first post";
      const content2 = "Content for second post";

      const blogEntry1PDA = await getBlogEntryPDA(title1, owner.publicKey);
      const blogEntry2PDA = await getBlogEntryPDA(title2, owner.publicKey);

      // Create first entry
      await program.methods
        .createBlogEntry(title1, content1)
        .accounts({
          blogEntry: blogEntry1PDA,
          owner: owner.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();

      // Create second entry
      await program.methods
        .createBlogEntry(title2, content2)
        .accounts({
          blogEntry: blogEntry2PDA,
          owner: owner.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();

      // Verify both entries exist
      const entry1 = await program.account.blogEntryState.fetch(blogEntry1PDA);
      const entry2 = await program.account.blogEntryState.fetch(blogEntry2PDA);

      assert.equal(entry1.title, title1);
      assert.equal(entry1.content, content1);
      assert.equal(entry2.title, title2);
      assert.equal(entry2.content, content2);

      // Clean up
      await program.methods
        .deleteBlogEntry(title1)
        .accounts({
          blogEntry: blogEntry1PDA,
          owner: owner.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();

      await program.methods
        .deleteBlogEntry(title2)
        .accounts({
          blogEntry: blogEntry2PDA,
          owner: owner.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();
    });
  });

  describe("Unhappy Path Tests", () => {
    it("Fails to create blog entry with empty title", async () => {
      const emptyTitle = "";
      const blogEntryPDA = await getBlogEntryPDA(emptyTitle, owner.publicKey);

      try {
        await program.methods
          .createBlogEntry(emptyTitle, testContent)
          .accounts({
            blogEntry: blogEntryPDA,
            owner: owner.publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
          })
          .rpc();
        assert.fail("Should have failed with empty title");
      } catch (error) {
        assert.include(error.message, "InvalidTitle");
      }
    });

    it("Fails to create blog entry with title too long", async () => {
      const longTitle = "A".repeat(51); // 51 characters, exceeds 50 limit

      try {
        const blogEntryPDA = await getBlogEntryPDA(longTitle, owner.publicKey);
        await program.methods
          .createBlogEntry(longTitle, testContent)
          .accounts({
            blogEntry: blogEntryPDA,
            owner: owner.publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
          })
          .rpc();
        assert.fail("Should have failed with title too long");
      } catch (error) {
        // Either fails at PDA derivation (seed too long) or validation
        assert.isTrue(
          error.message.includes("Max seed length exceeded") ||
          error.message.includes("InvalidTitle")
        );
      }
    });

    it("Fails to create blog entry with empty content", async () => {
      const title = "Test Empty Content";
      const emptyContent = "";
      const blogEntryPDA = await getBlogEntryPDA(title, owner.publicKey);

      try {
        await program.methods
          .createBlogEntry(title, emptyContent)
          .accounts({
            blogEntry: blogEntryPDA,
            owner: owner.publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
          })
          .rpc();
        assert.fail("Should have failed with empty content");
      } catch (error) {
        assert.include(error.message, "InvalidContent");
      }
    });

    it("Fails to create blog entry with content too long", async () => {
      const title = "Test Long Content";
      const longContent = "A".repeat(1001); // 1001 characters, exceeds 1000 limit
      const blogEntryPDA = await getBlogEntryPDA(title, owner.publicKey);

      try {
        await program.methods
          .createBlogEntry(title, longContent)
          .accounts({
            blogEntry: blogEntryPDA,
            owner: owner.publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
          })
          .rpc();
        assert.fail("Should have failed with content too long");
      } catch (error) {
        // Either fails at serialization or validation
        assert.isTrue(
          error.message.includes("InvalidContent") ||
          error.message.includes("overruns Buffer")
        );
      }
    });

    it("Fails to create duplicate blog entry", async () => {
      const duplicateTitle = "Duplicate Test";
      const blogEntryPDA = await getBlogEntryPDA(duplicateTitle, owner.publicKey);

      // Create first entry
      await program.methods
        .createBlogEntry(duplicateTitle, testContent)
        .accounts({
          blogEntry: blogEntryPDA,
          owner: owner.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();

      // Try to create duplicate
      try {
        await program.methods
          .createBlogEntry(duplicateTitle, "Different content")
          .accounts({
            blogEntry: blogEntryPDA,
            owner: owner.publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
          })
          .rpc();
        assert.fail("Should have failed creating duplicate entry");
      } catch (error) {
        assert.include(error.message, "already in use");
      }

      // Clean up
      await program.methods
        .deleteBlogEntry(duplicateTitle)
        .accounts({
          blogEntry: blogEntryPDA,
          owner: owner.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();
    });

    it("Fails to update non-existent blog entry", async () => {
      const nonExistentTitle = "Non Existent Post";
      const blogEntryPDA = await getBlogEntryPDA(nonExistentTitle, owner.publicKey);

      try {
        await program.methods
          .updateBlogEntry(nonExistentTitle, "Some content")
          .accounts({
            blogEntry: blogEntryPDA,
            owner: owner.publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
          })
          .rpc();
        assert.fail("Should have failed updating non-existent entry");
      } catch (error) {
        // Account doesn't exist - various error messages possible
        assert.isTrue(
          error.message.includes("Account does not exist") ||
          error.message.includes("AccountNotInitialized") ||
          error.message.includes("blog_entry")
        );
      }
    });

    it("Fails to update blog entry with invalid content", async () => {
      const title = "Test Update Invalid";
      const blogEntryPDA = await getBlogEntryPDA(title, owner.publicKey);

      // Create entry first
      await program.methods
        .createBlogEntry(title, testContent)
        .accounts({
          blogEntry: blogEntryPDA,
          owner: owner.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();

      // Try to update with empty content
      try {
        await program.methods
          .updateBlogEntry(title, "")
          .accounts({
            blogEntry: blogEntryPDA,
            owner: owner.publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
          })
          .rpc();
        assert.fail("Should have failed with empty content");
      } catch (error) {
        assert.include(error.message, "InvalidContent");
      }

      // Clean up
      await program.methods
        .deleteBlogEntry(title)
        .accounts({
          blogEntry: blogEntryPDA,
          owner: owner.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();
    });

    it("Fails to delete non-existent blog entry", async () => {
      const nonExistentTitle = "Non Existent Delete";
      const blogEntryPDA = await getBlogEntryPDA(nonExistentTitle, owner.publicKey);

      try {
        await program.methods
          .deleteBlogEntry(nonExistentTitle)
          .accounts({
            blogEntry: blogEntryPDA,
            owner: owner.publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
          })
          .rpc();
        assert.fail("Should have failed deleting non-existent entry");
      } catch (error) {
        // Account doesn't exist - various error messages possible
        assert.isTrue(
          error.message.includes("Account does not exist") ||
          error.message.includes("AccountNotInitialized") ||
          error.message.includes("blog_entry")
        );
      }
    });

    it("Fails when unauthorized user tries to update blog entry", async () => {
      const title = "Unauthorized Update Test";
      const blogEntryPDA = await getBlogEntryPDA(title, owner.publicKey);

      // Create entry with owner
      await program.methods
        .createBlogEntry(title, testContent)
        .accounts({
          blogEntry: blogEntryPDA,
          owner: owner.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();

      // Create a different user
      const unauthorizedUser = anchor.web3.Keypair.generate();

      try {
        // Airdrop to unauthorized user
        const signature = await provider.connection.requestAirdrop(
          unauthorizedUser.publicKey,
          2 * anchor.web3.LAMPORTS_PER_SOL
        );
        await provider.connection.confirmTransaction(signature);

        // Try to update with unauthorized user - will fail with seeds constraint
        await program.methods
          .updateBlogEntry(title, "Unauthorized content")
          .accounts({
            blogEntry: blogEntryPDA,
            owner: unauthorizedUser.publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
          })
          .signers([unauthorizedUser])
          .rpc();
        assert.fail("Should have failed with unauthorized user");
      } catch (error) {
        // Will fail with constraint violation (seeds don't match) or airdrop failure
        assert.isTrue(
          error.message.includes("Unauthorized") || 
          error.message.includes("constraint") ||
          error.message.includes("seeds") ||
          error.message.includes("airdrop")
        );
      }

      // Clean up
      await program.methods
        .deleteBlogEntry(title)
        .accounts({
          blogEntry: blogEntryPDA,
          owner: owner.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();
    });

    it("Fails when unauthorized user tries to delete blog entry", async () => {
      const title = "Unauthorized Delete Test";
      const blogEntryPDA = await getBlogEntryPDA(title, owner.publicKey);

      // Create entry with owner
      await program.methods
        .createBlogEntry(title, testContent)
        .accounts({
          blogEntry: blogEntryPDA,
          owner: owner.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();

      // Create a different user
      const unauthorizedUser = anchor.web3.Keypair.generate();

      // Airdrop to unauthorized user
      const signature = await provider.connection.requestAirdrop(
        unauthorizedUser.publicKey,
        2 * anchor.web3.LAMPORTS_PER_SOL
      );
      await provider.connection.confirmTransaction(signature);

      // Try to delete with unauthorized user
      try {
        await program.methods
          .deleteBlogEntry(title)
          .accounts({
            blogEntry: blogEntryPDA,
            owner: unauthorizedUser.publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
          })
          .signers([unauthorizedUser])
          .rpc();
        assert.fail("Should have failed with unauthorized user");
      } catch (error) {
        // Will fail either with "Unauthorized" or constraint violation
        assert.isTrue(
          error.message.includes("Unauthorized") || 
          error.message.includes("constraint") ||
          error.message.includes("seeds")
        );
      }

      // Clean up
      await program.methods
        .deleteBlogEntry(title)
        .accounts({
          blogEntry: blogEntryPDA,
          owner: owner.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();
    });
  });
});

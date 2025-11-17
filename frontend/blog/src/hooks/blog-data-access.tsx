'use client';

import { Program, AnchorProvider, BN } from '@coral-xyz/anchor';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, SystemProgram } from '@solana/web3.js';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Blog } from '@/types/blog';
import IDL from '@/idl/blog.json';

const PROGRAM_ID = new PublicKey('M4h1dMsA4b25oM7GAR6ycYAhwc3fS9HVQoKh8hS1Une');

interface BlogEntry {
  publicKey: PublicKey;
  account: {
    owner: PublicKey;
    title: string;
    content: string;
    createdAt: number;
    updatedAt: number;
  };
}

interface CreateBlogEntryArgs {
  title: string;
  content: string;
}

interface UpdateBlogEntryArgs {
  title: string;
  content: string;
}

interface DeleteBlogEntryArgs {
  title: string;
}

export function useBlogProgram() {
  const { connection } = useConnection();
  const wallet = useWallet();
  const queryClient = useQueryClient();

  const getProvider = () => {
    if (!wallet.publicKey || !wallet.signTransaction || !wallet.signAllTransactions) {
      throw new Error('Wallet not connected');
    }

    return new AnchorProvider(
      connection,
      {
        publicKey: wallet.publicKey,
        signTransaction: wallet.signTransaction.bind(wallet),
        signAllTransactions: wallet.signAllTransactions.bind(wallet),
      },
      { commitment: 'confirmed', preflightCommitment: 'confirmed' }
    );
  };

  // Derive PDA for a blog entry
  const getBlogEntryPDA = (title: string, owner: PublicKey) => {
    return PublicKey.findProgramAddressSync(
      [Buffer.from('blog'), Buffer.from(title), owner.toBuffer()],
      PROGRAM_ID
    )[0];
  };

  // Get all blog entries for the current wallet
  const accounts = useQuery({
    queryKey: ['blog', 'all', { endpoint: connection.rpcEndpoint, wallet: wallet.publicKey?.toString() }],
    queryFn: async () => {
      if (!wallet.publicKey) return [];

      try {
        const provider = getProvider();
        const program = new Program(IDL as Blog, provider);

        const entries = await program.account.blogEntryState.all([
          {
            memcmp: {
              offset: 8, // Discriminator offset
              bytes: wallet.publicKey.toBase58(),
            },
          },
        ]);

        // Convert BN values to numbers for proper serialization
        return entries.map(entry => ({
          publicKey: entry.publicKey,
          account: {
            owner: entry.account.owner,
            title: entry.account.title,
            content: entry.account.content,
            createdAt: typeof entry.account.createdAt === 'number' 
              ? entry.account.createdAt 
              : (entry.account.createdAt as BN).toNumber(),
            updatedAt: typeof entry.account.updatedAt === 'number'
              ? entry.account.updatedAt
              : (entry.account.updatedAt as BN).toNumber(),
          },
        })) as BlogEntry[];
      } catch (error) {
        console.error('Error fetching blog entries:', error);
        return [];
      }
    },
    enabled: !!wallet.publicKey && !!wallet.signTransaction,
  });

  // Create a blog entry
  const createEntry = useMutation<string, Error, CreateBlogEntryArgs>({
    mutationKey: ['blog', 'create', { endpoint: connection.rpcEndpoint }],
    mutationFn: async ({ title, content }) => {
      if (!wallet.publicKey) {
        throw new Error('Wallet not connected');
      }

      const provider = getProvider();
      const program = new Program(IDL as Blog, provider);
      const blogEntryPDA = getBlogEntryPDA(title, wallet.publicKey);

      const signature = await program.methods
        .createBlogEntry(title, content)
        .accounts({
          blogEntry: blogEntryPDA,
          owner: wallet.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      // Wait for confirmation
      await connection.confirmTransaction(signature, 'confirmed');
      return signature;
    },
    onSuccess: (signature) => {
      toast.success(
        <div>
          <div>Blog post created successfully!</div>
          <a
            href={`https://explorer.solana.com/tx/${signature}?cluster=devnet`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 underline text-xs"
          >
            View Transaction
          </a>
        </div>
      );
      queryClient.invalidateQueries({ queryKey: ['blog', 'all'] });
    },
    onError: (error) => {
      console.error('Create error:', error);
      toast.error(`Failed to create blog entry: ${error.message}`);
    },
  });

  // Update a blog entry
  const updateEntry = useMutation<string, Error, UpdateBlogEntryArgs>({
    mutationKey: ['blog', 'update', { endpoint: connection.rpcEndpoint }],
    mutationFn: async ({ title, content }) => {
      if (!wallet.publicKey) {
        throw new Error('Wallet not connected');
      }

      const provider = getProvider();
      const program = new Program(IDL as Blog, provider);
      const blogEntryPDA = getBlogEntryPDA(title, wallet.publicKey);

      const signature = await program.methods
        .updateBlogEntry(title, content)
        .accounts({
          blogEntry: blogEntryPDA,
          owner: wallet.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      await connection.confirmTransaction(signature, 'confirmed');
      return signature;
    },
    onSuccess: (signature) => {
      toast.success(
        <div>
          <div>Blog post updated successfully!</div>
          <a
            href={`https://explorer.solana.com/tx/${signature}?cluster=devnet`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 underline text-xs"
          >
            View Transaction
          </a>
        </div>
      );
      queryClient.invalidateQueries({ queryKey: ['blog', 'all'] });
    },
    onError: (error) => {
      console.error('Update error:', error);
      toast.error(`Failed to update blog entry: ${error.message}`);
    },
  });

  // Delete a blog entry
  const deleteEntry = useMutation<string, Error, DeleteBlogEntryArgs>({
    mutationKey: ['blog', 'delete', { endpoint: connection.rpcEndpoint }],
    mutationFn: async ({ title }) => {
      if (!wallet.publicKey) {
        throw new Error('Wallet not connected');
      }

      const provider = getProvider();
      const program = new Program(IDL as Blog, provider);
      const blogEntryPDA = getBlogEntryPDA(title, wallet.publicKey);

      const signature = await program.methods
        .deleteBlogEntry(title)
        .accounts({
          blogEntry: blogEntryPDA,
          owner: wallet.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      await connection.confirmTransaction(signature, 'confirmed');
      return signature;
    },
    onSuccess: (signature) => {
      toast.success(
        <div>
          <div>Blog post deleted successfully!</div>
          <a
            href={`https://explorer.solana.com/tx/${signature}?cluster=devnet`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 underline text-xs"
          >
            View Transaction
          </a>
        </div>
      );
      queryClient.invalidateQueries({ queryKey: ['blog', 'all'] });
    },
    onError: (error) => {
      console.error('Delete error:', error);
      toast.error(`Failed to delete blog entry: ${error.message}`);
    },
  });

  return {
    programId: PROGRAM_ID,
    accounts,
    createEntry,
    updateEntry,
    deleteEntry,
    getBlogEntryPDA,
  };
}
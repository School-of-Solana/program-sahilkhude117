'use client';

import { ThemeProvider } from '@/components/theme-provider';
import { ReactQueryProvider } from './react-query-provider';
import { SolanaProvider } from '@/components/solana/solana-provider';
import { Toaster } from 'react-hot-toast';
import React from 'react';

export function AppProviders({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <ReactQueryProvider>
      <ThemeProvider attribute="class" defaultTheme="dark" forcedTheme="dark" disableTransitionOnChange>
        <SolanaProvider>
          <Toaster position="bottom-right" />
          {children}
        </SolanaProvider>
      </ThemeProvider>
    </ReactQueryProvider>
  );
}

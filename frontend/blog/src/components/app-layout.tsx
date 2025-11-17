'use client';

import { AppHeader } from '@/components/app-header';
import React from 'react';
import { AppFooter } from '@/components/app-footer';

export function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen bg-black">
      <AppHeader />
      <main className="flex-grow container mx-auto px-4 py-8">{children}</main>
      <AppFooter />
    </div>
  );
}

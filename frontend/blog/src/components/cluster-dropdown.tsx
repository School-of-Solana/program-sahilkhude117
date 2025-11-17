'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';

// Cluster is hardcoded to devnet in solana-provider.tsx
export function ClusterDropdown() {
  return (
    <Button variant="outline" disabled>
      Devnet
    </Button>
  );
}

import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { Connection, PublicKey } from '@solana/web3.js';

/**
 * Custom hook to abstract wallet and connection functionality.
 *
 * This provides a simple interface to access Solana connection and wallet state.
 */
export function useSolana() {
  const { connection } = useConnection();
  const wallet = useWallet();

  return {
    connection,
    publicKey: wallet.publicKey,
    connected: wallet.connected,
    wallet,
  };
}

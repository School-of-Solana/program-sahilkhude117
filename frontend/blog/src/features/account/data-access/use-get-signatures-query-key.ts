import type { PublicKey } from '@solana/web3.js';
import { useSolana } from '@/components/solana/use-solana'

export function useGetSignaturesQueryKey({ address }: { address: PublicKey }) {
  const { cluster } = useSolana()

  return ['get-signatures', { cluster, address }]
}

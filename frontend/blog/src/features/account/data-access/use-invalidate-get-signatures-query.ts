import type { PublicKey } from '@solana/web3.js';
import { useQueryClient } from '@tanstack/react-query'
import { useGetSignaturesQueryKey } from './use-get-signatures-query-key'

export function useInvalidateGetSignaturesQuery({ address }: { address: PublicKey }) {
  const queryClient = useQueryClient()
  const queryKey = useGetSignaturesQueryKey({ address })
  return async () => {
    await queryClient.invalidateQueries({ queryKey })
  }
}

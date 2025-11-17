import type { PublicKey } from '@solana/web3.js';
import { useQueryClient } from '@tanstack/react-query'
import { useGetBalanceQueryKey } from './use-get-balance-query-key'

export function useInvalidateGetBalanceQuery({ address }: { address: PublicKey }) {
  const queryClient = useQueryClient()
  const queryKey = useGetBalanceQueryKey({ address })
  return async () => {
    await queryClient.invalidateQueries({ queryKey })
  }
}

import type { PublicKey } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, TOKEN_2022_PROGRAM_ID } from '@solana/spl-token';
import { useQuery } from '@tanstack/react-query';
import { useSolana } from '@/components/solana/use-solana';
import { getTokenAccountsByOwner } from './get-token-accounts-by-owner';

export function useGetTokenAccountsQuery({ address }: { address: PublicKey }) {
  const { connection } = useSolana();

  return useQuery({
    queryKey: ['get-token-accounts', { endpoint: connection.rpcEndpoint, address: address.toString() }],
    queryFn: async () =>
      Promise.all([
        getTokenAccountsByOwner(connection, { address, programId: TOKEN_PROGRAM_ID }),
        getTokenAccountsByOwner(connection, { address, programId: TOKEN_2022_PROGRAM_ID }),
      ]).then(([tokenAccounts, token2022Accounts]) => [...tokenAccounts, ...token2022Accounts]),
  });
}

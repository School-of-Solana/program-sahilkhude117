import { useMutation } from '@tanstack/react-query';
import { PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { useSolana } from '@/components/solana/use-solana';
import toast from 'react-hot-toast';
import { useInvalidateGetBalanceQuery } from './use-invalidate-get-balance-query';
import { useInvalidateGetSignaturesQuery } from './use-invalidate-get-signatures-query';

export function useRequestAirdropMutation({ address }: { address: PublicKey }) {
  const { connection } = useSolana();
  const invalidateBalanceQuery = useInvalidateGetBalanceQuery({ address });
  const invalidateSignaturesQuery = useInvalidateGetSignaturesQuery({ address });

  return useMutation({
    mutationFn: async (amount: number = 1) => {
      const signature = await connection.requestAirdrop(
        address,
        amount * LAMPORTS_PER_SOL
      );
      await connection.confirmTransaction(signature, 'confirmed');
      return signature;
    },
    onSuccess: async (signature) => {
      toast.success(
        <div>
          <div>Airdrop successful!</div>
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
      await Promise.all([invalidateBalanceQuery(), invalidateSignaturesQuery()]);
    },
  });
}

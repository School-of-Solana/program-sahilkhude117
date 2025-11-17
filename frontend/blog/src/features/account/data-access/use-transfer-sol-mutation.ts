import { PublicKey, SystemProgram, Transaction, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import toast from 'react-hot-toast';
import { useMutation } from '@tanstack/react-query';
import { useInvalidateGetBalanceQuery } from './use-invalidate-get-balance-query';
import { useInvalidateGetSignaturesQuery } from './use-invalidate-get-signatures-query';

export function useTransferSolMutation({ account, address }: { account: { address: string }; address: PublicKey }) {
  const { connection } = useConnection();
  const wallet = useWallet();
  const invalidateBalanceQuery = useInvalidateGetBalanceQuery({ address });
  const invalidateSignaturesQuery = useInvalidateGetSignaturesQuery({ address });

  return useMutation({
    mutationFn: async (input: { destination: PublicKey; amount: number }) => {
      try {
        if (!wallet.publicKey || !wallet.signTransaction) {
          throw new Error('Wallet not connected');
        }

        const transaction = new Transaction().add(
          SystemProgram.transfer({
            fromPubkey: wallet.publicKey,
            toPubkey: input.destination,
            lamports: input.amount * LAMPORTS_PER_SOL,
          })
        );

        const { blockhash } = await connection.getLatestBlockhash('confirmed');
        transaction.recentBlockhash = blockhash;
        transaction.feePayer = wallet.publicKey;

        const signed = await wallet.signTransaction(transaction);
        const signature = await connection.sendRawTransaction(signed.serialize());
        await connection.confirmTransaction(signature, 'confirmed');

        console.log(signature);
        return signature;
      } catch (error: unknown) {
        console.log('error', `Transaction failed! ${error}`);
        throw error;
      }
    },
    onSuccess: async (signature) => {
      toast.success(
        <div>
          <div>Transfer successful!</div>
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
    onError: (error) => {
      toast.error(`Transaction failed! ${error}`);
    },
  });
}

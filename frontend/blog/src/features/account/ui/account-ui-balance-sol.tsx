import { LAMPORTS_PER_SOL } from '@solana/web3.js';

export function AccountUiBalanceSol({ balance }: { balance: number }) {
  return <span>{(balance / LAMPORTS_PER_SOL).toFixed(2)}</span>;
}

import { PublicKey } from '@solana/web3.js';
import { useGetBalanceQuery } from '../data-access/use-get-balance-query'
import { AccountUiBalanceSol } from './account-ui-balance-sol'

export function AccountUiBalance({ address }: { address: PublicKey }) {
  const query = useGetBalanceQuery({ address })

  return (
    <h1 className="text-5xl font-bold cursor-pointer" onClick={() => query.refetch()}>
      {query.data?.value ? <AccountUiBalanceSol balance={query.data?.value} /> : '...'} SOL
    </h1>
  )
}

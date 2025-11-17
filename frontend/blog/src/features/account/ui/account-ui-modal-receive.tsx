import { PublicKey } from '@solana/web3.js';
import { AppExplorerLink } from '@/components/app-explorer-link';
import { AppModal } from '@/components/app-modal';
import toast from 'react-hot-toast';
import { CopyCheck } from 'lucide-react';

export function AccountUiModalReceive({ address }: { address: PublicKey | string }) {
  function handleCopy() {
    navigator.clipboard.writeText(address.toString());
    toast.success('Address copied to clipboard');
  }
  return (
    <AppModal title="Receive" submitLabel="Copy Address" submit={handleCopy}>
      <p>Receive assets by sending them to your public key:</p>
      <div className="flex items-center gap-2">
        <AppExplorerLink address={address.toString()} label={address.toString()} />
      </div>
    </AppModal>
  )
}

import { ArrowUpRightFromSquare } from 'lucide-react';
import { ReactNode } from 'react';

interface AppExplorerLinkProps {
  address?: string;
  transaction?: string;
  label: string | ReactNode;
  className?: string;
}

export function AppExplorerLink({
  address,
  transaction,
  label,
  className,
}: AppExplorerLinkProps) {
  const getExplorerUrl = () => {
    const cluster = 'devnet';
    const baseUrl = `https://explorer.solana.com`;
    
    if (address) {
      return `${baseUrl}/address/${address}?cluster=${cluster}`;
    }
    if (transaction) {
      return `${baseUrl}/tx/${transaction}?cluster=${cluster}`;
    }
    return baseUrl;
  };

  return (
    <a
      href={getExplorerUrl()}
      target="_blank"
      rel="noopener noreferrer"
      className={className ? className : `link font-mono inline-flex gap-1 text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300`}
    >
      {label}
      <ArrowUpRightFromSquare size={12} />
    </a>
  );
}

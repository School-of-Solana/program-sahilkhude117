import type { Connection, PublicKey } from '@solana/web3.js';

export async function getTokenAccountsByOwner(
  connection: Connection,
  { address, programId }: { address: PublicKey; programId: PublicKey },
) {
  const response = await connection.getTokenAccountsByOwner(
    address,
    { programId },
    { commitment: 'confirmed', encoding: 'jsonParsed' }
  );
  return response.value ?? [];
}



"use client";

import type { GetBlockReturnType } from "@wagmi/core";

type BlockWithTxs = GetBlockReturnType<true>;

export function useRequestMetadata(
  resultArray: bigint[] | undefined,
  block: BlockWithTxs | null,
  consumerAddress: string
) {
  const requestFee = resultArray?.[1];

  const requestTime = block
    ? new Date(Number(block.timestamp) * 1000).toLocaleString()
    : undefined;

  const requestTxHash = block?.transactions.find(
    (tx) => tx.to?.toLowerCase() === consumerAddress.toLowerCase()
  )?.hash;

  return {
    requestFee,
    requestTime,
    requestTxHash,
  };
}
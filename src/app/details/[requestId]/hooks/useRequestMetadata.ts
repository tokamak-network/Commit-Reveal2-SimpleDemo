"use client";

import type { GetBlockReturnType } from "@wagmi/core";

type BlockWithTxs = GetBlockReturnType<true>;

export function useRequestMetadata(
  resultArray: bigint[] | undefined,
  block: BlockWithTxs | null,
  consumerAddress: string
) {
  const requester = resultArray?.[1] as `0x${string}` | undefined;
  const requestFee = resultArray?.[2];

  const requestTime = block
    ? new Date(Number(block.timestamp) * 1000).toLocaleString()
    : undefined;

  const requestTxHash = block?.transactions.find(
    (tx) =>
      tx.to?.toLowerCase() === consumerAddress.toLowerCase() &&
      (requester ? tx.from.toLowerCase() === requester.toLowerCase() : true)
  )?.hash;

  return {
    requestFee,
    requestTime,
    requestTxHash,
  };
}

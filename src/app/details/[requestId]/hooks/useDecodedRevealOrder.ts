"use client";

import { useDecodedInput } from "./useDecodedInput";

export function useDecodedRevealOrder(decoded: ReturnType<typeof useDecodedInput> | undefined) {
  if (!decoded) return [];

  const { secretList, packedRevealOrder } = decoded;
  const packedBytes = new Uint8Array(secretList.length);

  let temp = packedRevealOrder;
    for (let i = 0; i < secretList.length; i++) {
    packedBytes[i] = Number(temp & BigInt(0xff));
    temp >>= BigInt(8);
  }

  const revealOrder = Array.from(packedBytes).slice(0, secretList.length);
  const revealRows = revealOrder.map((nodeIndex, i) => ({
    revealOrder: i + 1,
    nodeIndex,
    secret: secretList?.[nodeIndex],
  }));

  return revealRows;
}

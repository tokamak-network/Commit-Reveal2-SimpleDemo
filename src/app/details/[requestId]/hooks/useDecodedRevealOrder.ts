"use client";

import { useMemo } from "react";
import { useDecodedInput } from "./useDecodedInput";

export function useDecodedRevealOrder(
  decoded: ReturnType<typeof useDecodedInput>
) {
  return useMemo(() => {
    if (!decoded) return [];

    try {
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
    } catch (error) {
      console.error("Error decoding reveal order:", error);
      return [];
    }
  }, [decoded]);
}

"use client";

import { getBlock, type GetBlockReturnType } from "@wagmi/core";
import { useEffect, useState } from "react";
import { useConfig } from "wagmi";

type BlockWithTxs = GetBlockReturnType<true>;

export function useBlockData(blockNumber: bigint | undefined) {
  const config = useConfig();
  const [block, setBlock] = useState<BlockWithTxs | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!blockNumber || blockNumber === BigInt(0)) {
      setBlock(null);
      return;
    }

    // 이미 같은 블록을 가지고 있다면 다시 가져오지 않음
    if (block?.number === blockNumber) return;

    let isMounted = true;
    setIsLoading(true);

    getBlock(config, {
      blockNumber,
      includeTransactions: true,
    })
      .then((blockData) => {
        if (isMounted) {
          setBlock(blockData);
        }
      })
      .catch((error) => {
        console.error("Error fetching block data:", error);
        if (isMounted) {
          setBlock(null);
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [blockNumber, config, block?.number]);

  return { block, isLoading };
}

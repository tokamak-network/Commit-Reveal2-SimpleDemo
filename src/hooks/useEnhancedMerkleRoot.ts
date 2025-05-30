"use client";

import { chainsToContracts, commitReveal2Abi } from "@/constants";
import {
  createLeavesFromRevealRows,
  createMerkleRoot,
} from "@/utils/merkleRoot";
import { readContract } from "@wagmi/core";
import { useEffect, useState } from "react";
import { useChainId, useConfig } from "wagmi";

export function useEnhancedMerkleRoot(
  startTime: bigint | undefined,
  curStartTime: bigint | undefined,
  revealRows: Array<{ nodeIndex: number; secret: `0x${string}` | undefined }>,
  refreshTrigger?: number
) {
  const config = useConfig();
  const chainId = useChainId();
  const contracts = chainsToContracts[chainId];
  const [merkleRoot, setMerkleRoot] = useState<string | null>(null);

  useEffect(() => {
    if (!startTime || startTime === BigInt(0)) return;

    let isMounted = true;
    let isLoading = false;

    const fetchOrCalculateMerkleRoot = async () => {
      if (!isMounted || isLoading) return;

      isLoading = true;
      try {
        // Compare startTime with curStartTime
        if (curStartTime !== undefined && startTime === curStartTime) {
          // Times match: use the existing contract-based approach
          const res = await readContract(config, {
            abi: commitReveal2Abi,
            address: contracts.commitReveal2 as `0x${string}`,
            functionName: "getMerkleRoot",
            args: [startTime],
            blockTag: "latest",
          });

          if (isMounted) {
            const [root, submitted] = res as [`0x${string}`, boolean];
            setMerkleRoot(submitted ? root : null);
          }
        } else {
          // Times differ: calculate merkle root from revealRows
          if (revealRows && revealRows.length > 0) {
            try {
              const leaves = createLeavesFromRevealRows(revealRows);
              if (leaves.length > 0) {
                const calculatedRoot = createMerkleRoot(leaves);
                if (isMounted) {
                  setMerkleRoot(calculatedRoot);
                }
              } else {
                if (isMounted) {
                  setMerkleRoot(null);
                }
              }
            } catch (error) {
              console.error(
                "Error calculating merkle root from reveal rows:",
                error
              );
              if (isMounted) {
                setMerkleRoot(null);
              }
            }
          } else {
            if (isMounted) {
              setMerkleRoot(null);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching merkle root:", error);
        if (isMounted) {
          setMerkleRoot(null);
        }
      } finally {
        isLoading = false;
      }
    };

    fetchOrCalculateMerkleRoot();

    return () => {
      isMounted = false;
    };
  }, [startTime, curStartTime, revealRows, config, contracts, refreshTrigger]);

  return merkleRoot;
}

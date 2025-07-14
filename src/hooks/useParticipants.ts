"use client";

import { chainsToContracts, commitReveal2Abi } from "@/constants";
import { readContract } from "@wagmi/core";
import { useEffect, useState } from "react";
import { recoverTypedDataAddress } from "viem";
import { useChainId, useConfig } from "wagmi";
import { useDecodedInput } from "./useDecodedInput";

export function useParticipants(
  requestId: string,
  currentRound: bigint | undefined,
  input?: ReturnType<typeof useDecodedInput>,
  round?: bigint,
  trialNum?: bigint
) {
  const config = useConfig();
  const chainId = useChainId();
  const contracts = chainsToContracts[chainId];
  const [participants, setParticipants] = useState<`0x${string}`[]>([]);

  useEffect(() => {
    if (currentRound === undefined || !contracts?.commitReveal2) return;

    let isMounted = true;
    let isLoading = false;

    const resolve = async () => {
      if (isLoading || !isMounted) return;

      isLoading = true;

      try {
        if (BigInt(requestId) === currentRound) {
          const res = await readContract(config, {
            abi: commitReveal2Abi,
            address: contracts.commitReveal2 as `0x${string}`,
            functionName: "getActivatedOperators",
            blockTag: "latest",
          });
          if (isMounted) {
            setParticipants(res as `0x${string}`[]);
          }
        } else {
          if (!input || round === undefined || trialNum === undefined) {
            isLoading = false;
            return;
          }

          const { vList, rsList, cvList } = input;

          // If this is a dispute case (empty vList/rsList), return empty participants
          if (vList.length === 0 || rsList.length === 0) {
            if (isMounted) {
              setParticipants([]);
            }
            isLoading = false;
            return;
          }

          const domain = {
            name: "Commit Reveal2",
            version: "1",
            chainId,
            verifyingContract: contracts.commitReveal2 as `0x${string}`,
          } as const;

          const types = {
            Message: [
              { name: "round", type: "uint256" },
              { name: "trialNum", type: "uint256" },
              { name: "cv", type: "bytes32" },
            ],
          };

          const recoverList = await Promise.all(
            cvList.map((cv, i) =>
              recoverTypedDataAddress({
                domain,
                types,
                primaryType: "Message",
                message: {
                  round,
                  trialNum,
                  cv,
                },
                signature: {
                  r: rsList[i].r,
                  s: rsList[i].s,
                  yParity: vList[i],
                },
              })
            )
          );
          if (isMounted) {
            setParticipants(recoverList as `0x${string}`[]);
          }
        }
      } catch (error) {
        console.error("Error in useParticipants:", error);
      } finally {
        isLoading = false;
      }
    };

    resolve();

    return () => {
      isMounted = false;
    };
  }, [
    currentRound,
    requestId,
    input,
    round,
    trialNum,
    config,
    chainId,
    contracts,
  ]);

  return participants;
}

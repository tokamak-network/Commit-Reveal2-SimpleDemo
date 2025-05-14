"use client";

import { chainsToContracts, commitReveal2Abi } from "@/constants";
import { readContract } from "@wagmi/core";
import { useEffect, useState } from "react";
import { useChainId, useConfig } from "wagmi";

export function useParticipants(
  requestId: string,
  currentRound: bigint | undefined
) {
  const config = useConfig();
  const chainId = useChainId();
  const contracts = chainsToContracts[chainId];
  const [participants, setParticipants] = useState<`0x${string}`[]>([]);

  useEffect(() => {
    if (currentRound === undefined || BigInt(requestId) !== currentRound) {
      console.log("Not current round");
      return;
    }

    readContract(config, {
      abi: commitReveal2Abi,
      address: contracts.commitReveal2 as `0x${string}`,
      functionName: "getActivatedOperators",
    }).then((res) => {
      setParticipants(res as `0x${string}`[]);
    });
  }, [currentRound, requestId, config, contracts]);

  return participants;
}

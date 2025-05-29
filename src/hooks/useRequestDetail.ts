"use client";

import {
  chainsToContracts,
  commitReveal2Abi,
  consumerExampleAbi,
} from "@/constants";
import { DetailInfo } from "@/types/request";
import { useMemo } from "react";
import { useChainId, useReadContracts } from "wagmi";

export function useRequestDetail(requestId: string) {
  const chainId = useChainId();
  const contracts = useMemo(() => chainsToContracts[chainId], [chainId]);
  const commitReveal2Address = useMemo(
    () => contracts.commitReveal2 as `0x${string}`,
    [contracts.commitReveal2]
  );
  const consumerExampleAddress = useMemo(
    () => contracts.consumerExample as `0x${string}`,
    [contracts.consumerExample]
  );

  const result = useReadContracts({
    contracts: [
      {
        address: consumerExampleAddress,
        abi: consumerExampleAbi,
        functionName: "getDetailInfo",
        args: [requestId],
      },
      {
        address: commitReveal2Address,
        abi: commitReveal2Abi,
        functionName: "s_currentRound",
      },
      {
        address: commitReveal2Address,
        abi: commitReveal2Abi,
        functionName: "s_requestInfo",
        args: [requestId],
      },
      {
        address: commitReveal2Address,
        abi: commitReveal2Abi,
        functionName: "s_isInProcess",
      },
    ],
    query: {
      enabled: true,
      refetchInterval: 0,
      staleTime: 30000,
      retry: 0,
    },
  });

  const detailInfo = useMemo((): DetailInfo | null => {
    if (!result.data?.[0]?.result) return null;

    const [
      requester,
      requestFee,
      requestBlockNumber,
      fulfillBlockNumber,
      randomNumber,
      isRefunded,
    ] = result.data[0].result as [
      `0x${string}`,
      bigint,
      bigint,
      bigint,
      bigint,
      boolean
    ];

    return {
      requester,
      requestFee,
      requestBlockNumber,
      fulfillBlockNumber,
      randomNumber,
      isGenerated: fulfillBlockNumber > BigInt(0),
      isRefunded,
    };
  }, [result.data]);

  const currentRound = useMemo(
    () => result.data?.[1]?.result as bigint | undefined,
    [result.data]
  );

  const startTime = useMemo(
    () => (result.data?.[2]?.result as [bigint, bigint])?.[1],
    [result.data]
  );

  const processStatus = useMemo(
    () => result.data?.[3]?.result as bigint | undefined,
    [result.data]
  );

  const isHalted = useMemo(() => {
    return processStatus === BigInt(3); // HALTED = 3
  }, [processStatus]);

  return {
    detailInfo,
    currentRound,
    startTime,
    isHalted,
    isLoading: result.isLoading,
    error: result.error,
    refetch: result.refetch,
    contracts: {
      commitReveal2Address,
      consumerExampleAddress,
    },
  };
}

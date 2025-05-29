"use client";

import {
  chainsToContracts,
  commitReveal2Abi,
  consumerExampleAbi,
} from "@/constants";
import { ActivatedNode, HomeData, Request } from "@/types/home";
import { useMemo } from "react";
import {
  useAccount,
  useChainId,
  useReadContract,
  useReadContracts,
} from "wagmi";

export function useHomeData() {
  const { address } = useAccount();
  const chainId = useChainId();
  const contracts = useMemo(() => chainsToContracts[chainId], [chainId]);

  const commitReveal2Contract = {
    address: contracts.commitReveal2 as `0x${string}`,
    abi: commitReveal2Abi,
    account: address,
  } as const;

  const consumerExampleContract = {
    address: contracts.consumerExample as `0x${string}`,
    abi: consumerExampleAbi,
    account: address,
  } as const;

  // 운영자 및 리더 정보 가져오기
  const operatorsResult = useReadContracts({
    contracts: [
      {
        ...commitReveal2Contract,
        functionName: "getActivatedOperators",
      },
      {
        ...commitReveal2Contract,
        functionName: "owner",
      },
      {
        ...commitReveal2Contract,
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

  // 요청 정보 가져오기
  const requestsResult = useReadContract({
    ...consumerExampleContract,
    functionName: "getMainInfos",
    query: {
      enabled: true,
      refetchInterval: 0,
      staleTime: 30000,
      retry: 0,
    },
  });

  // 데이터 파싱
  const activatedOperators = useMemo(() => {
    return operatorsResult.status === "success"
      ? (operatorsResult.data?.[0]?.result as `0x${string}`[] | undefined)
      : undefined;
  }, [operatorsResult.status, operatorsResult.data]);

  const leaderAddress = useMemo(() => {
    return operatorsResult.status === "success"
      ? (operatorsResult.data?.[1]?.result as `0x${string}` | undefined)
      : undefined;
  }, [operatorsResult.status, operatorsResult.data]);

  const processStatus = useMemo(() => {
    return operatorsResult.status === "success"
      ? (operatorsResult.data?.[2]?.result as bigint | undefined)
      : undefined;
  }, [operatorsResult.status, operatorsResult.data]);

  const isHalted = useMemo(() => {
    return processStatus === BigInt(3); // HALTED = 3
  }, [processStatus]);

  const requests = useMemo<Request[]>(() => {
    if (requestsResult.status !== "success" || !requestsResult.data) return [];

    const rawRequests = requestsResult.data as any[];
    const [requestCount, mainInfos] = rawRequests;
    const count = Number(requestCount) > 100 ? 100 : Number(requestCount);

    const result: Request[] = [];
    for (let i = 0; i < count; i++) {
      const info = mainInfos[i];
      if (!info) continue;

      const {
        requestId,
        requester,
        fulfillBlockNumber,
        randomNumber,
        isRefunded,
      } = info;

      result.push({
        id: requestId.toString(),
        requester: requester as string,
        status: fulfillBlockNumber > BigInt(0) ? "Fulfilled" : "Pending",
        randomNumber: randomNumber.toString(),
        isRefunded,
      });
    }

    return result.reverse();
  }, [requestsResult.status, requestsResult.data]);

  const activatedNodeList = useMemo<ActivatedNode[]>(() => {
    if (!activatedOperators) return [];
    return activatedOperators.map((address, index) => ({
      index,
      address,
    }));
  }, [activatedOperators]);

  const requestDisabled = activatedNodeList.length < 2 || isHalted;

  const homeData: HomeData = {
    activatedOperators,
    leaderAddress,
    requests,
    activatedNodeList,
    requestDisabled,
    isHalted,
  };

  const refetch = async () => {
    await Promise.all([operatorsResult.refetch(), requestsResult.refetch()]);
  };

  return {
    homeData,
    contracts,
    isLoading: operatorsResult.isLoading || requestsResult.isLoading,
    error: operatorsResult.error || requestsResult.error,
    refetch,
  };
}

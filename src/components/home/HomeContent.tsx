"use client";

import {
  chainsToContracts,
  commitReveal2Abi,
  consumerExampleAbi,
} from "@/constants";
import { useEffect, useMemo, useState } from "react";
import { FiRefreshCw } from "react-icons/fi";
import {
  useAccount,
  useChainId,
  useReadContract,
  useReadContracts,
} from "wagmi";
import ActivatedNodeList from "./ActivatedNodeList";
import HomeEmptyState from "./HomeEmptyState";
import RequestHeader from "./RequestHeader";
import RequestTable from "./RequestTable";
import type { Request } from "./types";

export default function HomeContent() {
  const { isConnected, address } = useAccount();
  const chainId = useChainId();
  const isSupportedNetwork = !!chainsToContracts[chainId];
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [isSpinning, setIsSpinning] = useState(false);

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
  const result = useReadContracts({
    contracts: [
      {
        ...commitReveal2Contract,
        functionName: "getActivatedOperators",
      },
      {
        ...commitReveal2Contract,
        functionName: "owner",
      },
    ],
    query: {
      enabled: true,
      refetchInterval: 0, // Disable automatic polling
      staleTime: 30000, // 30 seconds to maintain state
      retry: 0, // No retries
    },
  });
  const requestsInfo = useReadContract({
    ...consumerExampleContract,
    functionName: "getMainInfos",
    query: {
      enabled: true,
      refetchInterval: 0, // Disable automatic polling
      staleTime: 30000, // 30 seconds to maintain state
      retry: 0, // No retries
    },
  });

  useEffect(() => {
    let isMounted = true;
    let intervalId: NodeJS.Timeout | null = null;

    const fetchData = () => {
      if (isMounted) {
        result.refetch().catch((error) => {
          console.error("Error refetching data:", error);
        });
        requestsInfo.refetch().catch((error) => {
          console.error("Error refetching request info:", error);
        });
      }
    };

    // Delay first execution by 15 seconds
    const timeoutId = setTimeout(() => {
      if (isMounted) {
        fetchData();
        // Then every 30 seconds
        intervalId = setInterval(fetchData, 30000);
      }
    }, 15000);

    // Cleanup function
    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
      if (intervalId) clearInterval(intervalId);
    };
  }, []);

  const activatedOperators =
    result.status === "success"
      ? (result.data?.[0]?.result as `0x${string}`[] | undefined)
      : undefined;
  const leaderAddress =
    result.status === "success"
      ? (result.data?.[1]?.result as `0x${string}` | undefined)
      : undefined;
  const rawRequests =
    requestsInfo.status === "success"
      ? (requestsInfo.data as any[] | undefined)
      : undefined;

  const requests = useMemo<Request[]>(() => {
    if (!rawRequests) return [];

    const [requestCount, mainInfos] = rawRequests;
    const count = Number(requestCount) > 100 ? 100 : Number(requestCount);

    const result: Request[] = [];
    for (let i = 0; i < count; i++) {
      const info = mainInfos[i];
      if (!info) continue;

      const { requestId, requester, fulfillBlockNumber, randomNumber } = info;

      result.push({
        id: requestId.toString(),
        requester: requester as string,
        status: fulfillBlockNumber > BigInt(0) ? "Fulfilled" : "Pending",
        randomNumber: randomNumber.toString(),
      });
    }

    // Sort by most recent first
    return result.reverse();
  }, [rawRequests]); // Only depend on rawRequests, nothing else

  const activatedNodeList = useMemo(() => {
    if (!activatedOperators) return [];
    return activatedOperators.map((address, index) => ({
      index,
      address,
    }));
  }, [activatedOperators]);

  const requestDisabled = activatedNodeList.length < 2;

  return (
    <main>
      {!isConnected ? (
        <HomeEmptyState message="Please connect a wallet..." />
      ) : !isSupportedNetwork ? (
        <HomeEmptyState message="Please connect to an Anvil network (or a supported testnet)." />
      ) : (
        <div className="mt-12">
          <div className="flex justify-end mb-4">
            <button
              onClick={() => {
                setIsSpinning(true);
                result.refetch().finally(() => {
                  setTimeout(() => setIsSpinning(false), 500);
                });
                requestsInfo.refetch();
              }}
              className="text-blue-600 hover:text-blue-800 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
            >
              <FiRefreshCw
                size={18}
                className={isSpinning ? "animate-spin" : ""}
              />
              Refresh
            </button>
          </div>
          <RequestHeader
            requestsCount={requests.length}
            commitReveal2Address={contracts.commitReveal2 as `0x${string}`}
            consumerExampleAddress={contracts.consumerExample as `0x${string}`}
            requestDisabled={requestDisabled}
            chainId={chainId}
            onRefresh={() => {
              setIsSpinning(true);
              result.refetch().finally(() => {
                setTimeout(() => setIsSpinning(false), 500);
              });
              requestsInfo.refetch();
            }}
          />
          <RequestTable
            requests={requests}
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
          />
          <ActivatedNodeList
            nodes={activatedNodeList}
            leaderAddress={leaderAddress}
            commitReveal2Address={contracts.commitReveal2 as `0x${string}`}
            chainId={chainId}
          />
        </div>
      )}
    </main>
  );
}

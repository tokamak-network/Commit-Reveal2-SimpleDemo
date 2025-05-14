"use client";

import {
  chainsToContracts,
  commitReveal2Abi,
  consumerExampleAbi,
} from "@/constants";
import { useMemo, useState } from "react";
import { FiRefreshCw } from "react-icons/fi";
import { useAccount, useChainId, useReadContracts } from "wagmi";
import ActivatedNodeList from "./ActivatedNodeList";
import EmptyState from "./EmptyState";
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
      {
        ...consumerExampleContract,
        functionName: "getYourRequests",
      },
    ],
  });

  const activatedOperators =
    result.status === "success"
      ? (result.data?.[0]?.result as `0x${string}`[] | undefined)
      : undefined;
  const leaderAddress =
    result.status === "success"
      ? (result.data?.[1]?.result as `0x${string}` | undefined)
      : undefined;
  const rawRequests =
    result.status === "success"
      ? (result.data?.[2]?.result as any[] | undefined)
      : undefined;

  console.log(rawRequests);

  const requests = useMemo<Request[]>(() => {
    if (!rawRequests) return [];
    const [requestIds, isFulfilled, randomNumbers] = rawRequests;
    console.log(requestIds, isFulfilled, randomNumbers);
    return requestIds.map((id: bigint, i: number) => ({
      id: id.toString(),
      status: isFulfilled[i] ? "Fulfilled" : "Pending",
      randomNumber: randomNumbers[i].toString(),
    }));
  }, [rawRequests]);

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
        <EmptyState message="Please connect a wallet..." />
      ) : !isSupportedNetwork ? (
        <EmptyState message="Please connect to an Anvil network (or a supported testnet)." />
      ) : (
        <div className="mt-12">
          <div className="flex justify-end mb-4">
            <button
              onClick={() => {
                setIsSpinning(true);
                result.refetch().finally(() => {
                  setTimeout(() => setIsSpinning(false), 500);
                });
                console.log(result.data);
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
            onRequest={() => console.log("Random number request triggered")}
            commitReveal2Address={contracts.commitReveal2 as `0x${string}`}
            consumerExampleAddress={contracts.consumerExample as `0x${string}`}
            requestDisabled={requestDisabled}
            onRefresh={() => {
              setIsSpinning(true);
              result.refetch().finally(() => {
                setTimeout(() => setIsSpinning(false), 500);
              });
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
          />
        </div>
      )}
    </main>
  );
}

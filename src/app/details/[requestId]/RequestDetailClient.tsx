"use client";

import {
  chainsToContracts,
  commitReveal2Abi,
  consumerExampleAbi,
} from "@/constants";
import { getBlock, type GetBlockReturnType } from "@wagmi/core";
import { useCallback, useEffect, useMemo, useState } from "react";
import { FiRefreshCw } from "react-icons/fi";
import { useAccount, useChainId, useConfig, useReadContracts } from "wagmi";
import EmptyStateMessage from "./components/EmptyStateMessage";
import ParticipatingNodes from "./components/ParticipatingNodes";
import RandomNumberSection from "./components/RandomNumberSection";
import RequestInfoSection from "./components/RequestInfoSection";
import { useDecodedInput } from "./hooks/useDecodedInput";
import { useDecodedRevealOrder } from "./hooks/useDecodedRevealOrder";
import { useMerkleRoot } from "./hooks/useMerkleRoot";
import { useParticipants } from "./hooks/useParticipants";
import { useRequestMetadata } from "./hooks/useRequestMetadata";

export default function RequestDetailClient({
  requestId,
}: {
  requestId: string;
}) {
  const { isConnected, address } = useAccount();
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
        functionName: "s_requestInfos",
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
        address: consumerExampleAddress,
        abi: consumerExampleAbi,
        functionName: "s_requests",
        args: [requestId],
      },
    ],
  });

  const [isSpinning, setIsSpinning] = useState(false);
  const [refreshCounter, setRefreshCounter] = useState(0);

  const refetchData = useCallback(() => {
    result.refetch();
    setRefreshCounter((prev) => prev + 1);
  }, [result]);

  useEffect(() => {
    const interval = setInterval(() => {
      refetchData();
    }, 12000); // every 12 seconds

    return () => clearInterval(interval);
  }, [refetchData]);

  const startTime = useMemo(
    () => (result.data?.[2]?.result as [bigint, bigint])?.[1],
    [result.data]
  );

  const config = useConfig();
  type BlockWithTxs = GetBlockReturnType<true>;
  const [block, setBlock] = useState<BlockWithTxs | null>(null);

  const merkleRoot = useMerkleRoot(startTime, refreshCounter);

  const resultArray = useMemo(
    () => result.data?.[0]?.result as bigint[] | undefined,
    [result.data]
  );

  const requestBlockNumber = useMemo(() => resultArray?.[0], [resultArray]);

  useEffect(() => {
    if (!requestBlockNumber || block?.number === requestBlockNumber) return;

    let isMounted = true;
    getBlock(config, {
      blockNumber: requestBlockNumber,
      includeTransactions: true,
    }).then((blockData) => {
      if (isMounted) {
        setBlock(blockData);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [requestBlockNumber, config]);

  const generateBlockNumber = useMemo(() => resultArray?.[3], [resultArray]);

  const [generateBlock, setGenerateBlock] = useState<BlockWithTxs | null>(null);

  useEffect(() => {
    if (
      !generateBlockNumber ||
      generateBlockNumber === BigInt(0) ||
      generateBlock?.number === generateBlockNumber
    )
      return;

    let isMounted = true;
    getBlock(config, {
      blockNumber: generateBlockNumber,
      includeTransactions: true,
    }).then((blockData) => {
      if (isMounted) {
        setGenerateBlock(blockData);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [generateBlockNumber, config]);

  const generateTime = useMemo(
    () =>
      generateBlock
        ? new Date(Number(generateBlock.timestamp) * 1000).toLocaleString()
        : undefined,
    [generateBlock]
  );

  const generateTx = useMemo(
    () =>
      generateBlock?.transactions.find(
        (tx) => tx.to?.toLowerCase() === commitReveal2Address.toLowerCase()
      ),
    [generateBlock, commitReveal2Address]
  );

  const decodedInput = useDecodedInput(generateTx?.input);

  const revealRows = useDecodedRevealOrder(decodedInput);

  const currentRound = useMemo(
    () => result.data?.[1]?.result as bigint | undefined,
    [result.data]
  );

  const participants = useParticipants(
    requestId,
    currentRound,
    decodedInput,
    startTime
  );

  const { requestFee, requestTime, requestTxHash } = useRequestMetadata(
    resultArray,
    block,
    consumerExampleAddress
  );

  const randomNumberTuple = useMemo(
    () => result.data?.[3]?.result as [boolean, bigint] | undefined,
    [result.data]
  );

  const isGenerated = randomNumberTuple?.[0];
  const randomNumber = randomNumberTuple?.[1];

  return (
    <div className="flex flex-col min-h-[80vh] px-6 w-full items-start">
      <div className="mt-12 w-full max-w-5xl mx-auto space-y-10 items-start text-left">
        <div className="flex justify-end mb-4">
          <button
            onClick={() => {
              setIsSpinning(true);
              setRefreshCounter((prev) => prev + 1);
              result.refetch().finally(() => {
                setTimeout(() => setIsSpinning(false), 500);
              });
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
        <h1 className="text-2xl font-bold">Request Details</h1>

        <div className="w-full">
          <h2 className="font-semibold text-lg text-gray-800 mb-2">
            Request ID: <span className="font-mono break-all">{requestId}</span>
          </h2>
          {!block || requestBlockNumber === BigInt(0) ? (
            <EmptyStateMessage />
          ) : (
            <>
              <ParticipatingNodes
                participants={participants}
                chainId={chainId}
              />

              <div className="space-y-6">
                <RequestInfoSection
                  requestFee={requestFee}
                  requestTime={requestTime}
                  requestTxHash={requestTxHash}
                  chainId={chainId}
                />

                <RandomNumberSection
                  merkleRoot={merkleRoot}
                  isGenerated={isGenerated}
                  revealRows={revealRows}
                  randomNumber={randomNumber}
                  generateTime={generateTime}
                  generateTxHash={generateTx?.hash}
                  chainId={chainId}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

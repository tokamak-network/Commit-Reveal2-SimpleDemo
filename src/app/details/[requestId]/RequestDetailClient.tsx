"use client";

import {
  chainsToContracts,
  commitReveal2Abi,
  consumerExampleAbi,
} from "@/constants";
import { getBlock, type GetBlockReturnType } from "@wagmi/core";
import { useEffect, useMemo, useState } from "react";
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
        ...consumerExampleContract,
        functionName: "s_blockNumbers",
        args: [requestId],
      },
      {
        ...commitReveal2Contract,
        functionName: "s_currentRound",
      },
      {
        ...commitReveal2Contract,
        functionName: "s_requestInfo",
        args: [requestId],
      },
      {
        ...consumerExampleContract,
        functionName: "s_requests",
        args: [requestId],
      },
    ],
  });

  const [isSpinning, setIsSpinning] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      result.refetch();
    }, 12000); // every 12 seconds

    return () => clearInterval(interval);
  }, [result]);

  const startTime = (result.data?.[2]?.result as [bigint, bigint])?.[1];

  const config = useConfig();
  type BlockWithTxs = GetBlockReturnType<true>;
  const [block, setBlock] = useState<BlockWithTxs | null>(null);

  const merkleRoot = useMerkleRoot(startTime, result.dataUpdatedAt);

  const resultArray = result.data?.[0]?.result as bigint[] | undefined;
  const requestBlockNumber = resultArray?.[0];

  useEffect(() => {
    if (!requestBlockNumber) return;
    getBlock(config, {
      blockNumber: requestBlockNumber,
      includeTransactions: true,
    }).then(setBlock);
  }, [requestBlockNumber, config]);

  const generateBlockNumber = resultArray?.[2];
  const [generateBlock, setGenerateBlock] = useState<BlockWithTxs | null>(null);

  useEffect(() => {
    if (!generateBlockNumber || generateBlockNumber === BigInt(0)) return;
    getBlock(config, {
      blockNumber: generateBlockNumber,
      includeTransactions: true,
    }).then(setGenerateBlock);
  }, [generateBlockNumber, config]);

  const generateTime = generateBlock
    ? new Date(Number(generateBlock.timestamp) * 1000).toLocaleString()
    : undefined;

  const generateTx = generateBlock?.transactions.find(
    (tx) => tx.to?.toLowerCase() === contracts.commitReveal2.toLowerCase()
  );

  const decodedInput = useDecodedInput(generateTx?.input);

  const revealRows = useDecodedRevealOrder(decodedInput);
  const currentRound = result.data?.[1]?.result as bigint | undefined;
  const participants = useParticipants(
    requestId,
    currentRound,
    decodedInput,
    startTime
  );

  const { requestFee, requestTime, requestTxHash } = useRequestMetadata(
    resultArray,
    block,
    contracts.consumerExample
  );

  const randomNumberTuple = result.data?.[3]?.result as
    | [boolean, bigint]
    | undefined;

  const isGenerated = randomNumberTuple?.[0];
  const randomNumber = randomNumberTuple?.[1];

  return (
    <div className="flex flex-col min-h-[80vh] px-6 w-full items-start">
      <div className="mt-12 w-full max-w-5xl mx-auto space-y-10 items-start text-left">
        <div className="flex justify-end mb-4">
          <button
            onClick={() => {
              setIsSpinning(true);
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
              <ParticipatingNodes participants={participants} />

              <div className="space-y-6">
                <RequestInfoSection
                  requestFee={requestFee}
                  requestTime={requestTime}
                  requestTxHash={requestTxHash}
                />

                <RandomNumberSection
                  merkleRoot={merkleRoot}
                  isGenerated={isGenerated}
                  revealRows={revealRows}
                  randomNumber={randomNumber}
                  generateTime={generateTime}
                  generateTxHash={generateTx?.hash}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

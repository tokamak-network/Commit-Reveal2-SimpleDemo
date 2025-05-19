"use client";

import {
  chainsToContracts,
  commitReveal2Abi,
  consumerExampleAbi,
} from "@/constants";
import { getBlock, type GetBlockReturnType } from "@wagmi/core";
import { useEffect, useMemo, useState } from "react";
import { FiRefreshCw } from "react-icons/fi";
import { useChainId, useConfig, useReadContracts } from "wagmi";
import { useDecodedInput } from "../../hooks/useDecodedInput";
import { useDecodedRevealOrder } from "../../hooks/useDecodedRevealOrder";
import { useMerkleRoot } from "../../hooks/useMerkleRoot";
import { useParticipants } from "../../hooks/useParticipants";
import DetailEmptyState from "./DetailEmptyState";
import ParticipatingNodes from "./ParticipatingNodes";
import RandomNumberSection from "./RandomNumberSection";
import RequestInfoSection from "./RequestInfoSection";

export default function RequestDetailClient({
  requestId,
}: {
  requestId: string;
}) {
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
    ],
    query: {
      enabled: true,
      refetchInterval: 0,
      staleTime: 30000,
      retry: 0,
    },
  });

  const [isSpinning, setIsSpinning] = useState(false);
  const [refreshCounter, setRefreshCounter] = useState(0);

  useEffect(() => {
    let isMounted = true;
    let intervalId: NodeJS.Timeout | null = null;

    const fetchData = () => {
      if (isMounted) {
        result.refetch().catch((error) => {
          console.error("Error refetching in details page:", error);
        });
        setRefreshCounter((prev) => prev + 1);
      }
    };

    // 30초 지연 후 첫 실행
    const timeoutId = setTimeout(() => {
      if (isMounted) {
        fetchData();
        // 그 후 60초마다 실행
        intervalId = setInterval(fetchData, 60000);
      }
    }, 30000);

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
      if (intervalId) clearInterval(intervalId);
    };
  }, []);

  const startTime = useMemo(
    () => (result.data?.[2]?.result as [bigint, bigint])?.[1],
    [result.data]
  );

  const config = useConfig();
  type BlockWithTxs = GetBlockReturnType<true>;
  const [block, setBlock] = useState<BlockWithTxs | null>(null);

  const merkleRoot = useMerkleRoot(startTime, refreshCounter);

  // getDetailInfo 결과 분석
  const detailInfo = useMemo(() => {
    if (!result.data?.[0]?.result) return null;

    const [
      requester,
      requestFee,
      requestBlockNumber,
      fulfillBlockNumber,
      randomNumber,
    ] = result.data[0].result as [
      `0x${string}`,
      bigint,
      bigint,
      bigint,
      bigint
    ];

    return {
      requester,
      requestFee,
      requestBlockNumber,
      fulfillBlockNumber,
      randomNumber,
      isGenerated: fulfillBlockNumber > BigInt(0),
    };
  }, [result.data]);

  const requestBlockNumber = useMemo(
    () => detailInfo?.requestBlockNumber,
    [detailInfo]
  );

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

  const generateBlockNumber = useMemo(
    () => (detailInfo?.isGenerated ? detailInfo.fulfillBlockNumber : undefined),
    [detailInfo]
  );

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

  // 요청 메타데이터
  const requestMetadata = useMemo(() => {
    if (!block || !detailInfo)
      return { requestTime: undefined, requestTxHash: undefined };

    const requestTime = new Date(
      Number(block.timestamp) * 1000
    ).toLocaleString();

    // 트랜잭션 필터링 - detailInfo의 requester 기반으로 필터링
    const requestTxHash = block.transactions.find(
      (tx) =>
        tx.to?.toLowerCase() === consumerExampleAddress.toLowerCase() &&
        tx.from.toLowerCase() === detailInfo.requester.toLowerCase()
    )?.hash;

    return {
      requestTime,
      requestTxHash,
    };
  }, [block, detailInfo, consumerExampleAddress]);

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
          {!block ||
          !detailInfo ||
          detailInfo.requestBlockNumber === BigInt(0) ? (
            <DetailEmptyState />
          ) : (
            <>
              <ParticipatingNodes
                participants={participants}
                chainId={chainId}
              />

              <div className="space-y-6">
                <RequestInfoSection
                  requester={detailInfo.requester}
                  requestFee={detailInfo.requestFee}
                  requestTime={requestMetadata.requestTime}
                  requestTxHash={requestMetadata.requestTxHash}
                  chainId={chainId}
                />

                <RandomNumberSection
                  merkleRoot={merkleRoot}
                  isGenerated={detailInfo.isGenerated}
                  revealRows={revealRows}
                  randomNumber={detailInfo.randomNumber}
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

"use client";

import {
  chainsToContracts,
  commitReveal2Abi,
  consumerExampleAbi,
} from "@/constants";
import { DetailInfo } from "@/types/request";
import { useEffect, useMemo, useState } from "react";
import { useChainId, useConfig, useReadContracts } from "wagmi";

// Helper function to parse packed indices from LSB
function parsePackedIndicesFromLSB(packedIndices: bigint): number[] {
  const indices: number[] = [];
  let remaining = packedIndices;

  while (remaining > BigInt(0)) {
    const index = Number(remaining & BigInt(0xff)); // Get the least significant byte
    indices.push(index);
    remaining = remaining >> BigInt(8); // Shift right by 8 bits
  }

  return indices;
}

// Helper function to parse packed indices with length
function parsePackedIndicesWithLength(
  packedIndices: bigint,
  length: number
): number[] {
  const indices: number[] = [];
  let remaining = packedIndices;

  for (let i = 0; i < length; i++) {
    const index = Number(remaining & BigInt(0xff)); // Get the least significant byte
    indices.push(index);
    remaining = remaining >> BigInt(8); // Shift right by 8 bits
  }

  return indices;
}

// Helper function to parse reveal orders
function parseRevealOrders(
  packedRevealOrders: bigint,
  participantsLength: number
): number[] {
  const orders: number[] = [];
  let remaining = packedRevealOrders;

  // Parse exactly participantsLength bytes instead of stopping at 0
  for (let i = 0; i < participantsLength; i++) {
    const order = Number(remaining & BigInt(0xff)); // Get the least significant byte
    orders.push(order);
    remaining = remaining >> BigInt(8); // Shift right by 8 bits
  }

  return orders;
}

// Helper function to check if a node submitted on-chain based on bitmap
function getSubmittedOnChainNodes(
  bitmap: bigint,
  requestedIndices: number[]
): number[] {
  const submittedNodes: number[] = [];
  requestedIndices.forEach((nodeIndex, i) => {
    // Check if the i-th bit is 0 (submitted) or 1 (not submitted)
    const bitPosition = BigInt(nodeIndex);
    const bit = (bitmap >> bitPosition) & BigInt(1);
    if (bit === BigInt(0)) {
      // 0 means submitted
      submittedNodes.push(nodeIndex);
    }
  });

  return submittedNodes;
}

// Helper function to get off-chain submitted nodes (participants excluding requested nodes)
function getOffChainSubmittedNodes(
  totalParticipants: number,
  requestedNodes: number[]
): number[] {
  const allIndices = Array.from({ length: totalParticipants }, (_, i) => i);
  return allIndices.filter((index) => !requestedNodes.includes(index));
}

export interface DisputeInfo {
  // Cv submission info
  cvRequested: {
    timestamp: bigint;
    requestedNodes: number[];
    onChainSubmittedNodes: number[];
    offChainSubmittedNodes: number[]; // indices of nodes that submitted off-chain
  } | null;

  // Co submission info
  coRequested: {
    timestamp: bigint;
    requestedNodes: number[];
    onChainSubmittedNodes: number[];
    offChainSubmittedNodes: number[]; // indices of nodes that submitted off-chain
  } | null;

  // Secret submission info
  secretRequested: {
    timestamp: bigint;
    revealOrders: number[];
    submittedIndices: number[]; // K to n-1
    notSubmittedIndices: number[]; // 0 to K-1
    secretsInRevealOrder?: string[];
  } | null;
}

// Create a separate hook for dispute info calculation
export function useDisputeInfo(
  startTime: bigint | undefined,
  participants: `0x${string}`[]
) {
  const chainId = useChainId();
  const contracts = useMemo(() => chainsToContracts[chainId], [chainId]);
  const commitReveal2Address = useMemo(
    () => contracts.commitReveal2 as `0x${string}`,
    [contracts.commitReveal2]
  );

  const [disputeInfo, setDisputeInfo] = useState<DisputeInfo | null>(null);

  // Add getDisputeInfos call when we have startTime
  const disputeResult = useReadContracts({
    contracts: startTime
      ? [
          {
            address: commitReveal2Address,
            abi: commitReveal2Abi,
            functionName: "getDisputeInfos",
            args: [startTime],
          },
          {
            address: commitReveal2Address,
            abi: commitReveal2Abi,
            functionName: "getSecrets",
            args: [participants.length],
          },
        ]
      : [],
    query: {
      enabled: !!startTime,
      refetchInterval: 0,
      staleTime: 30000,
      retry: 0,
    },
  });

  // Calculate dispute info
  useEffect(() => {
    if (!disputeResult.data?.[0]?.result) {
      setDisputeInfo(null);
      return;
    }

    const [
      requestedToSubmitCvTimestamp,
      requestedToSubmitCvPackedIndicesAscFromLSB,
      zeroBitIfSubmittedCvBitmap,
      requestedToSubmitCoTimestamp,
      requestedToSubmitCoPackedIndices,
      requestedToSubmitCoLength,
      zeroBitIfSubmittedCoBitmap,
      previousSSubmitTimestamp,
      packedRevealOrders,
      requestedToSubmitSFromIndexK,
    ] = disputeResult.data[0].result as [
      bigint,
      bigint,
      bigint,
      bigint,
      bigint,
      bigint,
      bigint,
      bigint,
      bigint,
      bigint
    ];

    const info: DisputeInfo = {
      cvRequested: null,
      coRequested: null,
      secretRequested: null,
    };

    // If previousSSubmitTimestamp > 0, this indicates a historical dispute case
    // Even if participants.length === 0, we should return secretRequested info
    if (previousSSubmitTimestamp > BigInt(0)) {
      if (participants.length === 0) {
        // Historical dispute case - only return basic timestamp info
        info.secretRequested = {
          timestamp: previousSSubmitTimestamp,
          revealOrders: [],
          submittedIndices: [],
          notSubmittedIndices: [],
        };
      } else {
        // Normal case with participants data
        const revealOrders = parseRevealOrders(
          packedRevealOrders,
          participants.length
        );
        const kIndex = Number(requestedToSubmitSFromIndexK);

        const submittedIndices = revealOrders.slice(0, kIndex);
        const notSubmittedIndices = revealOrders.slice(kIndex);

        // Get secrets in reveal order if available (when startTime === curStartTime)
        let secretsInRevealOrder: string[] | undefined;
        if (
          disputeResult.data?.[1]?.result &&
          Array.isArray(disputeResult.data[1].result)
        ) {
          const secrets = disputeResult.data[1].result;
          console.log(
            "Secrets from contract:",
            secrets,
            "Type of first secret:",
            typeof secrets[0]
          );

          // Sort secrets according to reveal order
          secretsInRevealOrder = revealOrders.map((nodeIndex) => {
            const secret = secrets[nodeIndex];
            // Handle both string and bigint cases
            if (typeof secret === "string") {
              return secret;
            } else if (typeof secret === "bigint") {
              return `0x${secret.toString(16).padStart(64, "0")}`;
            }
            return "";
          });
        }

        info.secretRequested = {
          timestamp: previousSSubmitTimestamp,
          revealOrders,
          submittedIndices,
          notSubmittedIndices,
          secretsInRevealOrder,
        };
      }
    }

    // Only process CV and CO info if we have participants data
    if (participants.length > 0) {
      // Parse Cv submission info
      if (requestedToSubmitCvTimestamp > BigInt(1)) {
        const requestedNodes = parsePackedIndicesFromLSB(
          requestedToSubmitCvPackedIndicesAscFromLSB
        );
        const submittedNodes = getSubmittedOnChainNodes(
          zeroBitIfSubmittedCvBitmap,
          requestedNodes
        );

        info.cvRequested = {
          timestamp: requestedToSubmitCvTimestamp,
          requestedNodes,
          onChainSubmittedNodes: submittedNodes,
          offChainSubmittedNodes: getOffChainSubmittedNodes(
            participants.length,
            requestedNodes
          ),
        };
      }

      // Parse Co submission info
      if (requestedToSubmitCoTimestamp > BigInt(1)) {
        const requestedNodes = parsePackedIndicesWithLength(
          requestedToSubmitCoPackedIndices,
          Number(requestedToSubmitCoLength)
        );
        const submittedNodes = getSubmittedOnChainNodes(
          zeroBitIfSubmittedCoBitmap,
          requestedNodes
        );

        info.coRequested = {
          timestamp: requestedToSubmitCoTimestamp,
          requestedNodes,
          onChainSubmittedNodes: submittedNodes,
          offChainSubmittedNodes: getOffChainSubmittedNodes(
            participants.length,
            requestedNodes
          ),
        };
      }
    }

    setDisputeInfo(info);
  }, [disputeResult.data, participants]);

  return {
    disputeInfo,
    isLoading: disputeResult.isLoading,
    error: disputeResult.error,
    refetch: disputeResult.refetch,
  };
}

export function useRequestDetail(requestId: string) {
  const chainId = useChainId();
  const config = useConfig();
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
      {
        address: commitReveal2Address,
        abi: commitReveal2Abi,
        functionName: "getCurStartTime",
      },
    ],
    query: {
      enabled: true,
      refetchInterval: 0,
      staleTime: 30000,
      retry: 0,
    },
  });

  const startTime = useMemo(
    () => (result.data?.[2]?.result as [bigint, bigint])?.[1],
    [result.data]
  );

  const currentRound = useMemo(
    () => result.data?.[1]?.result as bigint | undefined,
    [result.data]
  );

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

  const processStatus = useMemo(
    () => result.data?.[3]?.result as bigint | undefined,
    [result.data]
  );

  const curStartTime = useMemo(
    () => result.data?.[4]?.result as bigint | undefined,
    [result.data]
  );

  const isHalted = useMemo(() => {
    return processStatus === BigInt(3); // HALTED = 3
  }, [processStatus]);

  return {
    detailInfo,
    currentRound,
    startTime,
    curStartTime,
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

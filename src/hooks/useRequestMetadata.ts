"use client";

import { DetailInfo, GenerateInfo, RequestMetadata } from "@/types/request";
import { type GetBlockReturnType } from "@wagmi/core";
import { useMemo } from "react";
import { useDecodedInput } from "./useDecodedInput";

type BlockWithTxs = GetBlockReturnType<true>;

export function useRequestMetadata(
  requestBlock: BlockWithTxs | null,
  generateBlock: BlockWithTxs | null,
  detailInfo: DetailInfo | null,
  consumerExampleAddress: `0x${string}`,
  commitReveal2Address: `0x${string}`
) {
  // 요청 메타데이터
  const requestMetadata = useMemo((): RequestMetadata => {
    if (!requestBlock || !detailInfo) {
      return { requestTime: undefined, requestTxHash: undefined };
    }

    const requestTime = new Date(
      Number(requestBlock.timestamp) * 1000
    ).toLocaleString();

    const requestTxHash = requestBlock.transactions.find(
      (tx) =>
        tx.to?.toLowerCase() === consumerExampleAddress.toLowerCase() &&
        tx.from.toLowerCase() === detailInfo.requester.toLowerCase()
    )?.hash;

    return {
      requestTime,
      requestTxHash,
    };
  }, [requestBlock, detailInfo, consumerExampleAddress]);

  // 생성 트랜잭션 찾기
  const generateTx = useMemo(
    () =>
      generateBlock?.transactions.find(
        (tx) => tx.to?.toLowerCase() === commitReveal2Address.toLowerCase()
      ),
    [generateBlock, commitReveal2Address]
  );

  // 생성 메타데이터
  const generateInfo = useMemo((): GenerateInfo => {
    const generateTime = generateBlock
      ? new Date(Number(generateBlock.timestamp) * 1000).toLocaleString()
      : undefined;

    return {
      generateTime,
      generateTxHash: generateTx?.hash,
    };
  }, [generateBlock, generateTx]);

  // 디코딩된 입력 데이터
  const decodedInput = useDecodedInput(generateTx?.input);

  return {
    requestMetadata,
    generateInfo,
    decodedInput,
    generateTx,
  };
}

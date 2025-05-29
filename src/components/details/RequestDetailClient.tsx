"use client";

import { useAccount, useChainId } from "wagmi";
import { useAutoRefresh } from "../../hooks/useAutoRefresh";
import { useBlockData } from "../../hooks/useBlockData";
import { useDecodedRevealOrder } from "../../hooks/useDecodedRevealOrder";
import { useMerkleRoot } from "../../hooks/useMerkleRoot";
import { useParticipants } from "../../hooks/useParticipants";
import { useRequestDetail } from "../../hooks/useRequestDetail";
import { useRequestMetadata } from "../../hooks/useRequestMetadata";
import DetailEmptyState from "./DetailEmptyState";
import ParticipatingNodes from "./ParticipatingNodes";
import RandomNumberSection from "./RandomNumberSection";
import RefreshButton from "./RefreshButton";
import RefundButton from "./RefundButton";
import RequestInfoSection from "./RequestInfoSection";
import SubmitMerkleRootSection from "./SubmitMerkleRootSection";

export default function RequestDetailClient({
  requestId,
}: {
  requestId: string;
}) {
  const chainId = useChainId();
  const { address } = useAccount();

  // 요청 상세 정보 가져오기
  const {
    detailInfo,
    currentRound,
    startTime,
    isHalted,
    isLoading,
    refetch,
    contracts: { commitReveal2Address, consumerExampleAddress },
  } = useRequestDetail(requestId);

  // 자동 새로고침 관리 (상세 페이지는 덜 자주 업데이트)
  const { refreshCounter, isSpinning, manualRefresh } = useAutoRefresh(
    refetch,
    {
      initialDelay: 30000, // 30초 후 첫 실행
      interval: 60000, // 60초마다 반복
    }
  );

  // 블록 데이터 가져오기
  const { block: requestBlock } = useBlockData(detailInfo?.requestBlockNumber);
  const { block: generateBlock } = useBlockData(
    detailInfo?.isGenerated ? detailInfo.fulfillBlockNumber : undefined
  );

  // 메타데이터 처리
  const { requestMetadata, generateInfo, decodedInput } = useRequestMetadata(
    requestBlock,
    generateBlock,
    detailInfo,
    consumerExampleAddress,
    commitReveal2Address
  );

  // 기타 데이터
  const merkleRoot = useMerkleRoot(startTime, refreshCounter);
  const revealRows = useDecodedRevealOrder(decodedInput);
  const participants = useParticipants(
    requestId,
    currentRound,
    decodedInput,
    startTime
  );

  // 로딩 상태 또는 데이터가 없는 경우
  const shouldShowEmptyState =
    !requestBlock || !detailInfo || detailInfo.requestBlockNumber === BigInt(0);

  return (
    <div className="flex flex-col min-h-[80vh] px-6 w-full items-start">
      <div className="mt-12 w-full max-w-5xl mx-auto space-y-10 items-start text-left">
        <RefreshButton onRefresh={manualRefresh} isSpinning={isSpinning} />

        <h1 className="text-2xl font-bold">Request Details</h1>

        <div className="w-full">
          <h2 className="font-semibold text-lg text-gray-800 mb-2">
            Request ID: <span className="font-mono break-all">{requestId}</span>
          </h2>

          {/* Refund button - show when halted, not generated, and user is requester */}
          {!shouldShowEmptyState &&
            detailInfo &&
            isHalted &&
            !detailInfo.isGenerated &&
            !detailInfo.isRefunded &&
            address &&
            detailInfo.requester.toLowerCase() === address.toLowerCase() && (
              <div className="mb-4">
                <RefundButton
                  requestId={requestId}
                  consumerExampleAddress={consumerExampleAddress}
                  chainId={chainId}
                  onRefundSuccess={manualRefresh}
                />
              </div>
            )}

          {/* Refunded status indicator */}
          {!shouldShowEmptyState && detailInfo && detailInfo.isRefunded && (
            <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                    <span className="text-gray-600 text-lg">✓</span>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-800">
                    Request Refunded
                  </h3>
                  <p className="text-xs text-gray-600 mt-1">
                    This request has been refunded. The request fee has been
                    returned to the requester.
                  </p>
                </div>
              </div>
            </div>
          )}

          {shouldShowEmptyState ? (
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

                <SubmitMerkleRootSection merkleRoot={merkleRoot} />

                <RandomNumberSection
                  isGenerated={detailInfo.isGenerated}
                  revealRows={revealRows}
                  randomNumber={detailInfo.randomNumber}
                  generateTime={generateInfo.generateTime}
                  generateTxHash={generateInfo.generateTxHash}
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

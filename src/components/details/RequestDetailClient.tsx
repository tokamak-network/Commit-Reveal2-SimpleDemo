"use client";

import { useMemo } from "react";
import { useAccount, useChainId } from "wagmi";
import { useAutoRefresh } from "../../hooks/useAutoRefresh";
import { useBlockData } from "../../hooks/useBlockData";
import { useDecodedRevealOrder } from "../../hooks/useDecodedRevealOrder";
import { useEnhancedMerkleRoot } from "../../hooks/useEnhancedMerkleRoot";
import { useParticipants } from "../../hooks/useParticipants";
import { useDisputeInfo, useRequestDetail } from "../../hooks/useRequestDetail";
import { useRequestMetadata } from "../../hooks/useRequestMetadata";
import DetailEmptyState from "./DetailEmptyState";
import DisputeSection from "./DisputeSection";
import ParticipatingNodes from "./ParticipatingNodes";
import RandomNumberSection from "./RandomNumberSection";
import RefreshButton from "./RefreshButton";
import RefundButton from "./RefundButton";
import RequestInfoSection from "./RequestInfoSection";
import SecretSubmissionSection from "./SecretSubmissionSection";
import SubmitMerkleRootSection from "./SubmitMerkleRootSection";

export default function RequestDetailClient({
  requestId,
}: {
  requestId: string;
}) {
  const chainId = useChainId();
  const { address } = useAccount();

  // Get basic request detail info (single call)
  const {
    detailInfo,
    currentRound,
    startTime,
    requestRound,
    requestTrialNum,
    curRound,
    curTrialNum,
    isHalted,
    isLoading: detailLoading,
    refetch: detailRefetch,
    contracts: { commitReveal2Address, consumerExampleAddress },
  } = useRequestDetail(requestId);

  // Get participants using the existing hook
  const { block: requestBlock } = useBlockData(detailInfo?.requestBlockNumber);
  const { block: generateBlock } = useBlockData(
    detailInfo?.isGenerated ? detailInfo.fulfillBlockNumber : undefined
  );

  const { requestMetadata, generateInfo, decodedInput } = useRequestMetadata(
    requestBlock,
    generateBlock,
    detailInfo,
    consumerExampleAddress,
    commitReveal2Address
  );

  const participants = useParticipants(
    requestId,
    currentRound,
    decodedInput,
    requestRound,
    requestTrialNum
  );

  // Get dispute info using separate hook
  const {
    disputeInfo,
    isLoading: disputeLoading,
    refetch: disputeRefetch,
  } = useDisputeInfo(requestRound, requestTrialNum, participants);

  // Check if this is a historical dispute case where data is not available
  const isHistoricalDispute =
    disputeInfo?.secretRequested &&
    requestRound !== undefined &&
    requestTrialNum !== undefined &&
    curRound !== undefined &&
    curTrialNum !== undefined &&
    (requestRound !== curRound || requestTrialNum !== curTrialNum);

  const isLoading = detailLoading || disputeLoading;

  // 자동 새로고침 관리 (상세 페이지는 덜 자주 업데이트)
  const { refreshCounter, isSpinning, manualRefresh } = useAutoRefresh(
    async () => {
      await detailRefetch();
      await disputeRefetch();
    },
    {
      initialDelay: 30000, // 30초 후 첫 실행
      interval: 60000, // 60초마다 반복
    }
  );

  // 기타 데이터
  const revealRows = useDecodedRevealOrder(decodedInput);
  const merkleRoot = useEnhancedMerkleRoot(
    requestRound,
    requestTrialNum,
    curRound,
    curTrialNum,
    revealRows,
    refreshCounter
  );

  // Extract final secret if this was generated through dispute and we have generateInfo
  const finalSecret = useMemo(() => {
    if (
      disputeInfo?.secretRequested &&
      generateInfo.generateTxHash &&
      decodedInput
    ) {
      // Check if decodedInput.secretList has only one secret (dispute case)
      if (decodedInput.secretList && decodedInput.secretList.length === 1) {
        return decodedInput.secretList[0];
      }
    }
    return undefined;
  }, [disputeInfo?.secretRequested, generateInfo.generateTxHash, decodedInput]);

  // 로딩 상태 또는 데이터가 없는 경우
  const shouldShowEmptyState =
    !requestBlock || !detailInfo || detailInfo.requestBlockNumber === BigInt(0);

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-[80vh] px-6 w-full items-center justify-center">
        <div className="text-lg text-gray-600">Loading request details...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-[80vh] px-6 w-full items-start">
      <div className="mt-12 w-full max-w-5xl mx-auto space-y-10 items-start text-left">
        <RefreshButton onRefresh={manualRefresh} isSpinning={isSpinning} />

        <h1 className="text-2xl font-bold">Request Details</h1>

        <div className="w-full">
          <h2 className="font-semibold text-lg text-gray-800 mb-2">
            Request ID: <span className="font-mono break-all">{requestId}</span>
          </h2>

          {/* Trial Information */}
          {requestTrialNum !== undefined && (
            <div className="mb-4">
              <h3 className="text-base font-semibold text-gray-900 mb-2">
                Trial Information
              </h3>
              <div className="text-sm text-gray-800 space-y-1">
                <p>
                  <span className="font-medium">Current Trial:</span> #
                  {requestTrialNum.toString()}
                </p>
                {requestTrialNum > BigInt(0) && (
                  <p>
                    <span className="font-medium">Failed Trials:</span>{" "}
                    {Array.from(
                      { length: Number(requestTrialNum) },
                      (_, i) => `#${i}`
                    ).join(", ")}{" "}
                    ({requestTrialNum.toString()} trial
                    {requestTrialNum > BigInt(1) ? "s" : ""} failed)
                  </p>
                )}
              </div>
            </div>
          )}

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
                  requestFee={detailInfo.requestFee}
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
              {!isHistoricalDispute && participants.length > 0 && (
                <ParticipatingNodes
                  participants={participants}
                  chainId={chainId}
                />
              )}

              <div className="space-y-6">
                <RequestInfoSection
                  requester={detailInfo.requester}
                  requestFee={detailInfo.requestFee}
                  requestTime={requestMetadata.requestTime}
                  requestTxHash={requestMetadata.requestTxHash}
                  chainId={chainId}
                />

                {/* Historical Dispute Warning Message */}
                {isHistoricalDispute && (
                  <div className="p-6 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                          <span className="text-amber-600 text-xl">⚠️</span>
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-amber-800 mb-3">
                          Historical Dispute Data Unavailable
                        </h3>
                        <p className="text-sm text-amber-700 leading-relaxed">
                          This random number was generated through an on-chain
                          dispute process this round. The smart contract does
                          not maintain historical data for past rounds, and when
                          on-chain disputes occur in subsequent rounds, the
                          previous data gets overwritten. As a result, we cannot
                          retrieve the original merkle root, participating
                          nodes, secrets, reveal orders, and other detailed
                          information for this request.
                        </p>
                        <p className="text-sm text-amber-700 mt-3">
                          Only the basic request information and final random
                          number result are available below.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {!isHistoricalDispute && (
                  <>
                    {/* Cv Dispute Section */}
                    {disputeInfo?.cvRequested && (
                      <DisputeSection
                        disputeType="cv"
                        disputeData={disputeInfo.cvRequested}
                      />
                    )}

                    <SubmitMerkleRootSection merkleRoot={merkleRoot} />

                    {/* Co Dispute Section */}
                    {disputeInfo?.coRequested && (
                      <DisputeSection
                        disputeType="co"
                        disputeData={disputeInfo.coRequested}
                      />
                    )}

                    {/* Secret Submission Section */}
                    {disputeInfo?.secretRequested && (
                      <SecretSubmissionSection
                        secretRequested={disputeInfo.secretRequested}
                        finalSecret={finalSecret}
                      />
                    )}
                  </>
                )}

                <RandomNumberSection
                  isGenerated={detailInfo.isGenerated}
                  revealRows={isHistoricalDispute ? [] : revealRows}
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

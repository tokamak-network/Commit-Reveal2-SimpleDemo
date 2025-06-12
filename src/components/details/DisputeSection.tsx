import { DisputeInfo } from "../../hooks/useRequestDetail";

interface Props {
  disputeType: "cv" | "co";
  disputeData: NonNullable<
    DisputeInfo["cvRequested"] | DisputeInfo["coRequested"]
  >;
}

export default function DisputeSection({ disputeType, disputeData }: Props) {
  const isCV = disputeType === "cv";
  const title = isCV
    ? "Onchain Cv Submission Required"
    : "Onchain Co Submission Required";
  const timeLabel = isCV
    ? "Requested to Submit Cv On-Chain Time"
    : "Requested to Submit Co On-Chain Time";

  return (
    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
            <span className="text-yellow-600 text-xl">⚠️</span>
          </div>
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-yellow-800 mb-4">
            Dispute - {title}
          </h3>

          <div className="text-sm text-yellow-700 space-y-3">
            <div>
              <strong>Already Off-chain Submitted (indices):</strong>{" "}
              {disputeData.offChainSubmittedNodes.length > 0 ? (
                <>
                  <span className="font-mono text-blue-700">
                    [{disputeData.offChainSubmittedNodes.join(", ")}]
                  </span>
                  <span className="text-blue-700">
                    {" "}
                    - Shared {isCV ? "Cv" : "Co"} values with leader node
                    off-chain
                  </span>
                </>
              ) : (
                <span className="text-gray-500">none</span>
              )}
            </div>

            <p>
              <strong>{timeLabel}:</strong>{" "}
              {new Date(Number(disputeData.timestamp) * 1000).toLocaleString()}
            </p>

            <div>
              <strong>Requested to Submit On-Chain Nodes (indices):</strong>{" "}
              <span className="font-mono">
                [{disputeData.requestedNodes.join(", ")}]
              </span>
            </div>

            <div>
              <strong>✅ On-chain Submitted (indices):</strong>{" "}
              {disputeData.onChainSubmittedNodes.length === 0 ? (
                <span className="text-gray-500">none</span>
              ) : (
                <>
                  <span className="font-mono text-green-700">
                    {" "}
                    [{disputeData.onChainSubmittedNodes.join(", ")}]
                  </span>
                  <span className="font-mono ml-2">
                    {disputeData.onChainSubmittedNodes.length}/
                    {disputeData.requestedNodes.length}
                  </span>
                  {disputeData.onChainSubmittedNodes.length ===
                    disputeData.requestedNodes.length && (
                    <span className="text-green-700"> - Complete</span>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

interface SecretSubmissionSectionProps {
  secretRequested: {
    timestamp: bigint;
    revealOrders: number[];
    submittedIndices: number[];
    notSubmittedIndices: number[];
    secretsInRevealOrder?: string[];
  };
  finalSecret?: `0x${string}`; // The final secret from decodedInput when dispute generated random number
}

export default function SecretSubmissionSection({
  secretRequested,
  finalSecret,
}: SecretSubmissionSectionProps) {
  const {
    timestamp,
    revealOrders,
    submittedIndices,
    notSubmittedIndices,
    secretsInRevealOrder,
  } = secretRequested;

  // Format timestamp
  const formattedTime = new Date(Number(timestamp) * 1000).toLocaleString();

  // Determine title based on submittedIndices
  const getTitle = () => {
    if (submittedIndices.length === 0) {
      return `Requested to Submit Secret On-Chain Time: ${formattedTime}`;
    } else {
      // Get the last index in submittedIndices (most recent)
      const lastIndex = submittedIndices[submittedIndices.length - 1];
      return `Node #${lastIndex} On-chain Secret Submission Time: ${formattedTime}`;
    }
  };

  // Determine status for each node in reveal order
  const getNodeStatus = (nodeIndex: number, position: number) => {
    if (submittedIndices.includes(nodeIndex)) {
      return "submitted";
    } else if (notSubmittedIndices.includes(nodeIndex)) {
      // First node in notSubmittedIndices is processing, rest are pending
      const firstNotSubmitted = notSubmittedIndices[0];
      // If we have a finalSecret and this is the first not submitted node, it's actually submitted
      if (nodeIndex === firstNotSubmitted && finalSecret) {
        return "submitted";
      } else if (nodeIndex === firstNotSubmitted) {
        return "processing...";
      } else {
        return "pending...";
      }
    } else {
      return "pending...";
    }
  };

  // Get secret for a specific node
  const getSecretForNode = (nodeIndex: number, position: number) => {
    // If this is the first not submitted node and we have finalSecret
    if (finalSecret && notSubmittedIndices[0] === nodeIndex) {
      return finalSecret;
    }

    // Otherwise use secrets from reveal order if available
    if (secretsInRevealOrder && position < secretsInRevealOrder.length) {
      const secret = secretsInRevealOrder[position];
      if (
        secret &&
        secret !==
          "0x0000000000000000000000000000000000000000000000000000000000000000"
      ) {
        // Secret is already a hex string, just return it
        return secret;
      }
    }

    return undefined;
  };

  return (
    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
            <span className="text-yellow-600 text-lg">⚠️</span>
          </div>
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">
            Dispute - Onchain Secret Submission Required
          </h3>
          <p className="text-sm text-yellow-700 mb-3">{getTitle()}</p>

          <div className="space-y-1">
            <p className="text-sm font-medium text-yellow-800 mb-2">
              Secret Submission Status In Reveal Order:
            </p>
            {revealOrders.map((nodeIndex, position) => (
              <div key={position} className="text-sm text-yellow-700">
                <span className="font-mono">Node #{nodeIndex}:</span>{" "}
                <span
                  className={`font-medium ${
                    getNodeStatus(nodeIndex, position) === "submitted"
                      ? "text-green-600"
                      : getNodeStatus(nodeIndex, position) === "processing..."
                      ? "text-orange-600"
                      : "text-gray-500"
                  }`}
                >
                  {getNodeStatus(nodeIndex, position)}
                </span>
                {getNodeStatus(nodeIndex, position) === "submitted" && (
                  <span className="text-sm text-gray-500">
                    {" "}
                    (Secret: {getSecretForNode(nodeIndex, position)})
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { LuExternalLink } from "react-icons/lu";
import { formatEther } from "viem";

export default function RequestInfoSection({
  requestFee,
  requestTime,
  requestTxHash,
}: {
  requestFee: bigint | undefined;
  requestTime: string | undefined;
  requestTxHash: `0x${string}` | undefined;
}) {
  return (
    <div>
      <h3 className="font-semibold text-lg mb-2">Request Random Number</h3>
      <p>Request Fee: {formatEther(requestFee ?? BigInt(0))} ETH</p>
      <p className="mt-1">Time: {requestTime ?? "Loading..."}</p>
      <p className="mt-1">
        Tx:{" "}
        <a
          href={`https://etherscan.io/tx/${requestTxHash}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline inline-flex items-center gap-1"
        >
          {requestTxHash}
          <LuExternalLink />
        </a>
      </p>
    </div>
  );
}

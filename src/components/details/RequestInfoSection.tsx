"use client";

import { getExplorerUrl } from "@/constants";
import { LuExternalLink } from "react-icons/lu";
import { formatEther } from "viem";

interface Props {
  requester: `0x${string}`;
  requestFee: bigint | undefined;
  requestTime: string | undefined;
  requestTxHash: `0x${string}` | undefined;
  chainId: number;
}

export default function RequestInfoSection({
  requester,
  requestFee,
  requestTime,
  requestTxHash,
  chainId,
}: Props) {
  const txUrl = requestTxHash
    ? getExplorerUrl(chainId, `tx/${requestTxHash}`)
    : "#";

  const requesterUrl = getExplorerUrl(chainId, `address/${requester}`);

  return (
    <div>
      <h3 className="font-semibold text-lg mb-2">Request Random Number</h3>
      <p>
        Requester:{" "}
        <a
          href={requesterUrl}
          onClick={(e) => {
            if (chainId === 31337) e.preventDefault();
          }}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline inline-flex items-center gap-1"
        >
          <span className="font-mono">{requester}</span>
          <LuExternalLink size={12} />
        </a>
      </p>
      <p className="mt-1">
        Request Fee: {formatEther(requestFee ?? BigInt(0))} ETH
      </p>
      <p className="mt-1">Time: {requestTime ?? "Loading..."}</p>
      <p className="mt-1">
        Tx:{" "}
        <a
          href={txUrl}
          onClick={(e) => {
            if (txUrl === "#") e.preventDefault();
          }}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline inline-flex items-center gap-1"
        >
          {requestTxHash}
          <LuExternalLink size={12} />
        </a>
      </p>
    </div>
  );
}

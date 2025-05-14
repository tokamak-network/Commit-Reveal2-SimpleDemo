"use client";

import { LuExternalLink } from "react-icons/lu";
import RevealOrderTable from "./RevealOrderTable";

export default function RandomNumberSection({
  merkleRoot,
  isGenerated,
  revealRows,
  randomNumber,
  generateTime,
  generateTxHash,
}: {
  merkleRoot: string | null;
  isGenerated: boolean | undefined;
  revealRows: {
    revealOrder: number;
    nodeIndex: number;
    secret: `0x${string}` | undefined;
  }[];
  randomNumber: bigint | undefined;
  generateTime: string | undefined;
  generateTxHash: `0x${string}` | undefined;
}) {
  return (
    <div>
      <h3 className="font-semibold text-lg mb-2">
        Random Number Generation Process
      </h3>
      <div className="mb-4">
        <p>
          <span className="font-semibold">Merkle Root:</span>{" "}
          {merkleRoot ? (
            <span className="font-mono">{merkleRoot}</span>
          ) : (
            <span className="text-gray-500 italic">Not submitted yet</span>
          )}
        </p>
      </div>
      {!isGenerated ? (
        <p className="text-gray-500 italic mt-2">
          Random number has not been generated for this request.
        </p>
      ) : (
        <div>
          <p className="font-semibold mt-4">
            Secrets used to generate the random number:
          </p>
          <RevealOrderTable revealRows={revealRows} />
          <p className="font-semibold mt-4">Random Number:</p>
          <div className="ml-6">
            <p>Hex: 0x{randomNumber?.toString(16)}</p>
            <p>Decimal: {randomNumber?.toString()}</p>
          </div>
          <p className="mt-4">Time: {generateTime ?? "Loading..."}</p>
          <p>
            Tx:{" "}
            <a
              href={`https://etherscan.io/tx/${generateTxHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline inline-flex items-center gap-1"
            >
              {generateTxHash}
              <LuExternalLink />
            </a>
          </p>
        </div>
      )}
    </div>
  );
}

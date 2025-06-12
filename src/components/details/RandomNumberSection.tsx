"use client";

import { getExplorerUrl } from "@/constants";
import { useMemo } from "react";
import { LuExternalLink } from "react-icons/lu";
import RevealOrderTable from "./RevealOrderTable";

export default function RandomNumberSection({
  isGenerated,
  revealRows,
  randomNumber,
  generateTime,
  generateTxHash,
  chainId,
}: {
  isGenerated: boolean | undefined;
  revealRows: {
    revealOrder: number;
    nodeIndex: number;
    secret: `0x${string}` | undefined;
  }[];
  randomNumber: bigint | undefined;
  generateTime: string | undefined;
  generateTxHash: `0x${string}` | undefined;
  chainId: number;
}) {
  const txUrl = useMemo(
    () => getExplorerUrl(chainId, `tx/${generateTxHash}`),
    [chainId, generateTxHash]
  );

  const hasRevealRows = useMemo(
    () => Array.isArray(revealRows) && revealRows.length > 0,
    [revealRows]
  );

  const formattedRandomNumber = useMemo(() => {
    if (!randomNumber) return { hex: "N/A", decimal: "N/A" };
    try {
      return {
        hex: `0x${randomNumber.toString(16)}`,
        decimal: randomNumber.toString(),
      };
    } catch (error) {
      console.error("Error formatting random number:", error);
      return { hex: "Error", decimal: "Error" };
    }
  }, [randomNumber]);

  return (
    <div>
      <h3 className="font-semibold text-lg mb-2">Generate a Random Number</h3>
      {!isGenerated ? (
        <p className="text-gray-500 italic mt-2">
          Random number has not been generated for this request.
        </p>
      ) : (
        <div>
          {hasRevealRows && (
            <>
              <p className="font-semibold">
                Secrets used to generate the random number:
              </p>
              <RevealOrderTable revealRows={revealRows} />
            </>
          )}
          <p className="font-semibold mt-4">Random Number:</p>
          <div className="ml-6">
            <p>Hex: {formattedRandomNumber.hex}</p>
            <p>Decimal: {formattedRandomNumber.decimal}</p>
          </div>
          <p className="mt-4">Time: {generateTime ?? "Loading..."}</p>
          {generateTxHash && (
            <p>
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
                {generateTxHash}
                <LuExternalLink />
              </a>
            </p>
          )}
        </div>
      )}
    </div>
  );
}

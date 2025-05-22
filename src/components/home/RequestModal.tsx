"use client";

import { consumerExampleAbi, getExplorerUrl } from "@/constants";
import { useEffect, useState } from "react";
import { CgSpinner } from "react-icons/cg";
import { LuExternalLink } from "react-icons/lu";
import { formatEther } from "viem";
import { useWaitForTransactionReceipt, useWriteContract } from "wagmi";

interface Props {
  requestFee: bigint;
  networkFee: bigint;
  totalFee: bigint;
  consumerExampleAddress: `0x${string}`;
  chainId: number;
  onClose: () => void;
}

export default function RequestModal({
  requestFee,
  networkFee,
  totalFee,
  consumerExampleAddress,
  chainId,
  onClose,
}: Props) {
  const { data: hash, isPending, writeContractAsync } = useWriteContract();
  const [currentRequestFee, setCurrentRequestFee] = useState(requestFee);
  const [currentNetworkFee, setCurrentNetworkFee] = useState(networkFee);
  const [currentTotalFee, setCurrentTotalFee] = useState(totalFee);

  // Update fee values when they change from parent component
  useEffect(() => {
    setCurrentRequestFee(requestFee);
    setCurrentNetworkFee(networkFee);
    setCurrentTotalFee(totalFee);
  }, [requestFee, networkFee, totalFee]);

  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    isError,
    failureReason,
    error,
  } = useWaitForTransactionReceipt({
    confirmations: 0,
    hash,
    pollingInterval: 10000,
    timeout: 200000,
  });

  const formattedTotal = formatEther(currentTotalFee);

  async function handleSendTransaction() {
    try {
      await writeContractAsync({
        abi: consumerExampleAbi,
        address: consumerExampleAddress,
        functionName: "requestRandomNumber",
        value: currentRequestFee,
      });
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white relative rounded-4xl shadow-xl p-6 w-full max-w-md min-h-[200px] space-y-4">
        <div className="flex items-center justify-between absolute top-4 left-6 right-6">
          <div className="flex-1">
            {!isConfirmed && (
              <h2 className="text-sm font-semibold text-gray-500 text-left">
                You're requesting a random number...
              </h2>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-xl text-gray-400 hover:text-gray-600 ml-auto cursor-pointer"
          >
            &times;
          </button>
        </div>
        {isConfirmed ? (
          <div className="flex flex-col items-center justify-center gap-2 py-6 text-center">
            <div className="text-green-600 text-3xl">✅</div>
            <p className="text-lg font-semibold text-gray-800">
              Transaction Confirmed
            </p>
            {hash &&
              (() => {
                const explorerUrl = getExplorerUrl(chainId, `tx/${hash}`);
                return (
                  <a
                    href={explorerUrl}
                    onClick={(e) => {
                      if (explorerUrl === "#") e.preventDefault();
                    }}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-sm inline-flex items-center gap-1"
                  >
                    View on Explorer <LuExternalLink size={12} />
                  </a>
                );
              })()}
          </div>
        ) : (
          <div className="text-[15px] text-gray-700 space-y-1 pt-12 text-left">
            <p>
              Request Fee:{" "}
              <span className="font-mono">
                {formatEther(currentRequestFee)} ETH
              </span>
            </p>
            <p>
              Network Fee:{" "}
              <span className="font-mono">
                {formatEther(currentNetworkFee)} ETH
              </span>
            </p>
            <div className="border-t border-gray-200 pt-2 mt-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold">
                  Total Fee:{" "}
                  <span className="font-mono">{formattedTotal} ETH</span>
                </span>
                <a
                  href={`https://www.google.com/search?q=${encodeURIComponent(
                    `${formattedTotal} ETH to dollar`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline inline-flex items-center gap-1 text-xs"
                >
                  check USD <LuExternalLink size={12} />
                </a>
              </div>
            </div>
          </div>
        )}
        {isError && error && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">
            Transaction failed: {error.message || "Unknown error"}
          </div>
        )}
        {isConfirmed ? (
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 text-sm cursor-pointer"
          >
            Close
          </button>
        ) : (
          <button
            onClick={isError ? onClose : handleSendTransaction}
            className={
              isPending || isConfirming
                ? "w-full px-4 py-2 bg-blue-400 text-white rounded-lg text-sm cursor-not-allowed"
                : isError
                ? "w-full px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 text-sm cursor-pointer"
                : "w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm cursor-pointer"
            }
            disabled={isPending || isConfirming}
          >
            {isPending ? (
              <div className="flex items-center justify-center gap-2">
                <CgSpinner className="animate-spin" size={16} />
                <span>Confirming in wallet...</span>
              </div>
            ) : isConfirming ? (
              <div className="flex items-center justify-center gap-2">
                <CgSpinner className="animate-spin" size={16} />
                <span>Waiting for tx...</span>
              </div>
            ) : isError ? (
              <span>Close</span>
            ) : (
              "Send a Transaction"
            )}
          </button>
        )}
      </div>
    </div>
  );
}

"use client";

import { consumerExampleAbi, getExplorerUrl } from "@/constants";
import { useState } from "react";
import { CgSpinner } from "react-icons/cg";
import { CiCircleQuestion } from "react-icons/ci";
import { LuExternalLink } from "react-icons/lu";
import {
  useAccount,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";

interface Props {
  requestId: string;
  consumerExampleAddress: `0x${string}`;
  chainId: number;
  onRefundSuccess?: () => void;
}

export default function RefundButton({
  requestId,
  consumerExampleAddress,
  chainId,
  onRefundSuccess,
}: Props) {
  const { address } = useAccount();
  const { data: hash, isPending, writeContractAsync } = useWriteContract();
  const [showModal, setShowModal] = useState(false);

  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    isError,
    error,
  } = useWaitForTransactionReceipt({
    confirmations: 0,
    hash,
    pollingInterval: 10000,
    timeout: 300000,
  });

  async function handleRefund() {
    try {
      await writeContractAsync({
        abi: consumerExampleAbi,
        address: consumerExampleAddress,
        functionName: "refund",
        args: [requestId],
      });
      setShowModal(true);
    } catch (err) {
      console.error("Refund failed:", err);
    }
  }

  function closeModal() {
    setShowModal(false);
    if (isConfirmed && onRefundSuccess) {
      onRefundSuccess();
    }
  }

  // Check if error is specifically a DRPC timeout error
  const isDrpcTimeoutError =
    isError && error?.message?.includes("Request timeout on the free tier");

  return (
    <>
      <div className="relative group">
        <button
          onClick={handleRefund}
          disabled={isPending || isConfirming}
          className="inline-flex justify-center px-4 py-2 text-sm bg-red-50 text-red-700 border border-red-300 rounded-lg hover:bg-red-100 transition items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {isPending || isConfirming ? (
            <>
              <CgSpinner className="animate-spin" size={16} />
              <span>Processing...</span>
            </>
          ) : (
            <>
              <span>Refund</span>
              <CiCircleQuestion size={16} />
            </>
          )}
        </button>
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 py-1 px-2 bg-gray-900 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-[9999] whitespace-nowrap shadow-lg">
          Refund now or wait for protocol resume to fulfill request.
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
        </div>
      </div>

      {/* Refund Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white relative rounded-4xl shadow-xl p-6 w-full max-w-md min-h-[200px] space-y-4">
            <div className="flex items-center justify-between absolute top-4 left-6 right-6">
              <div className="flex-1">
                {!isConfirmed && (
                  <h2 className="text-sm font-semibold text-gray-500 text-left">
                    Refunding request {requestId}...
                  </h2>
                )}
              </div>
              <button
                onClick={closeModal}
                className="text-xl text-gray-400 hover:text-gray-600 ml-auto cursor-pointer"
              >
                &times;
              </button>
            </div>

            {isConfirmed ? (
              <div className="flex flex-col items-center justify-center gap-2 py-6 text-center">
                <div className="text-green-600 text-3xl">✅</div>
                <p className="text-lg font-semibold text-gray-800">
                  Refund Successful
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
                  Request ID: <span className="font-mono">{requestId}</span>
                </p>
                <p>Refunding your request fee...</p>
              </div>
            )}

            {isError && error && !isDrpcTimeoutError && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">
                Refund failed: {error.message || "Unknown error"}
              </div>
            )}

            {isDrpcTimeoutError && (
              <div className="text-sm text-yellow-600 bg-yellow-50 border border-yellow-200 rounded p-2">
                RPC provider timeout. Your transaction may still be processing.
                Please check the explorer.
              </div>
            )}

            {isConfirmed || isDrpcTimeoutError ? (
              <button
                onClick={closeModal}
                className="w-full px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 text-sm cursor-pointer"
              >
                Close
              </button>
            ) : (
              <div className="flex items-center justify-center gap-2 py-4">
                <CgSpinner className="animate-spin" size={20} />
                <span>
                  {isPending
                    ? "Confirming in wallet..."
                    : isConfirming
                    ? "Waiting for transaction..."
                    : "Processing..."}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

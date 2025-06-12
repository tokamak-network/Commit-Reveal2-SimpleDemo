"use client";

import { consumerExampleAbi, getExplorerUrl } from "@/constants";
import { estimateFeesPerGas, estimateGas } from "@wagmi/core";
import axios from "axios";
import { useState } from "react";
import { CgSpinner } from "react-icons/cg";
import { CiCircleQuestion } from "react-icons/ci";
import { LuExternalLink } from "react-icons/lu";
import { encodeFunctionData, formatEther, parseGwei } from "viem";
import {
  useAccount,
  useConfig,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";

interface Props {
  requestId: string;
  consumerExampleAddress: `0x${string}`;
  chainId: number;
  requestFee: bigint;
  onRefundSuccess?: () => void;
}

export default function RefundButton({
  requestId,
  consumerExampleAddress,
  chainId,
  requestFee,
  onRefundSuccess,
}: Props) {
  const { address } = useAccount();
  const config = useConfig();
  const { data: hash, isPending, writeContractAsync } = useWriteContract();
  const [showModal, setShowModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmModalData, setConfirmModalData] = useState<{
    requestFee: bigint;
    networkFee: bigint;
    youReceive: bigint;
  } | null>(null);

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

  // Function to get gas price from Infura API
  const getInfuraGasPrice = async (): Promise<bigint> => {
    // For local network (Anvil), directly use estimateFeesPerGas
    if (chainId === 31337) {
      return (await estimateFeesPerGas(config)).maxFeePerGas;
    }

    try {
      const { data } = await axios.get(
        `https://gas.api.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_API_KEY}/networks/${chainId}/suggestedGasFees`
      );

      // Convert maxFeePerGas from gwei to wei
      if (data && data.medium.suggestedMaxFeePerGas) {
        return parseGwei(data.medium.suggestedMaxFeePerGas);
      }

      // Fallback to wagmi's estimateFeesPerGas if Infura API fails or returns unexpected format
      console.log("Falling back to estimateFeesPerGas");
      return (await estimateFeesPerGas(config)).maxFeePerGas;
    } catch (error) {
      console.error("Error fetching gas price from Infura:", error);
      // Fallback to wagmi's estimateFeesPerGas
      return (await estimateFeesPerGas(config)).maxFeePerGas;
    }
  };

  async function handleRefundClick() {
    try {
      // Get gas price and estimate network fee
      const gasPrice = await getInfuraGasPrice();
      const data = encodeFunctionData({
        abi: consumerExampleAbi,
        functionName: "refund",
        args: [requestId],
      });
      const estimatedGasUsed = await estimateGas(config, {
        data: data,
        to: consumerExampleAddress,
      });
      const networkFee = estimatedGasUsed * gasPrice;
      const youReceive = requestFee - networkFee;

      setConfirmModalData({
        requestFee,
        networkFee,
        youReceive,
      });
      setShowConfirmModal(true);
    } catch (err) {
      console.error("Failed to prepare refund:", err);
    }
  }

  async function handleRefund() {
    try {
      await writeContractAsync({
        abi: consumerExampleAbi,
        address: consumerExampleAddress,
        functionName: "refund",
        args: [requestId],
      });
      setShowConfirmModal(false);
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

  function closeConfirmModal() {
    setShowConfirmModal(false);
    setConfirmModalData(null);
  }

  // Check if error is specifically a DRPC timeout error
  const isDrpcTimeoutError =
    isError && error?.message?.includes("Request timeout on the free tier");

  return (
    <>
      {/* Protocol Halt Status Message */}
      <div className="mb-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
              <span className="text-orange-600 text-lg">⚠️</span>
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-orange-800 mb-1">
              Protocol Halted
            </h3>
            <p className="text-sm text-orange-700 mb-3">
              The protocol is currently halted due to insufficient active
              operators (minimum 2 required) or leader node being slashed. You
              can refund your request fee now or wait for the protocol to resume
              and fulfill your request.
            </p>

            <div className="relative">
              <button
                onClick={handleRefundClick}
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
                    <div className="relative group">
                      <CiCircleQuestion size={16} />
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 py-1 px-2 bg-gray-900 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-[9999] whitespace-nowrap shadow-lg">
                        Refund now or wait for protocol resume to fulfill
                        request.
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                      </div>
                    </div>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Refund Confirmation Modal */}
      {showConfirmModal && confirmModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white relative rounded-4xl shadow-xl p-6 w-full max-w-md min-h-[200px] space-y-4">
            <div className="flex items-center justify-between absolute top-4 left-6 right-6">
              <div className="flex-1">
                <h2 className="text-sm font-semibold text-gray-500 text-left">
                  Confirm Refund for Request {requestId}
                </h2>
              </div>
              <button
                onClick={closeConfirmModal}
                className="text-xl text-gray-400 hover:text-gray-600 ml-auto cursor-pointer"
              >
                &times;
              </button>
            </div>

            <div className="text-[15px] text-gray-700 space-y-1 pt-12 text-left">
              <div className="flex justify-between items-center">
                <span>+ Refund Amount:</span>
                <span className="font-mono text-green-600">
                  {formatEther(confirmModalData.requestFee)} ETH
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>- Network Fee:</span>
                <span className="font-mono text-red-600">
                  {formatEther(confirmModalData.networkFee)} ETH
                </span>
              </div>
              <div className="border-t border-gray-200 pt-2 mt-2">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">= You Receive:</span>
                  <span className="font-mono font-semibold text-blue-600">
                    {formatEther(confirmModalData.youReceive)} ETH
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={handleRefund}
              disabled={isPending}
              className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? (
                <div className="flex items-center justify-center gap-2">
                  <CgSpinner className="animate-spin" size={16} />
                  <span>Confirming in wallet...</span>
                </div>
              ) : (
                "Send a Transaction"
              )}
            </button>
          </div>
        </div>
      )}

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

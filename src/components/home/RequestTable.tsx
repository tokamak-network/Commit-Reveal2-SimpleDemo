"use client";

import { consumerExampleAbi, getExplorerUrl } from "@/constants";
import { DisputeInfo } from "@/types/home";
import { estimateFeesPerGas, estimateGas } from "@wagmi/core";
import axios from "axios";
import Link from "next/link";
import { useMemo, useState } from "react";
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
import Pagination from "./Pagination";
import type { Request } from "./types";

interface Props {
  requests: Request[];
  currentPage: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  isHalted: boolean;
  consumerExampleAddress: `0x${string}`;
  chainId: number;
  onRefundSuccess?: () => void;
  disputeInfo: DisputeInfo;
}

export default function RequestTable({
  requests,
  currentPage,
  itemsPerPage,
  onPageChange,
  isHalted,
  consumerExampleAddress,
  chainId,
  onRefundSuccess,
  disputeInfo,
}: Props) {
  const { address } = useAccount();
  const config = useConfig();
  const [showOnlyMyRequests, setShowOnlyMyRequests] = useState(false);
  const [refundingRequestId, setRefundingRequestId] = useState<string | null>(
    null
  );
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmModalData, setConfirmModalData] = useState<{
    requestId: string;
    requestFee: bigint;
    networkFee: bigint;
    youReceive: bigint;
  } | null>(null);

  const { data: hash, isPending, writeContractAsync } = useWriteContract();

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

  const filteredRequests = useMemo(() => {
    if (!showOnlyMyRequests || !address) return requests;
    return requests.filter(
      (req) => req.requester.toLowerCase() === address.toLowerCase()
    );
  }, [requests, showOnlyMyRequests, address]);

  const sortedRequests = filteredRequests;
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentRequests = sortedRequests.slice(indexOfFirst, indexOfLast);

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

  async function handleRefundClick(requestId: string) {
    try {
      // Find the request to get the requestFee
      const request = requests.find((req) => req.id === requestId);
      if (!request) return;

      const requestFee = BigInt(request.requestFee);

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
        requestId,
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
    if (!confirmModalData) return;

    try {
      setRefundingRequestId(confirmModalData.requestId);
      await writeContractAsync({
        abi: consumerExampleAbi,
        address: consumerExampleAddress,
        functionName: "refund",
        args: [confirmModalData.requestId],
      });
      setShowConfirmModal(false);
      setShowRefundModal(true);
    } catch (err) {
      console.error("Refund failed:", err);
      setRefundingRequestId(null);
    }
  }

  function closeRefundModal() {
    setShowRefundModal(false);
    setRefundingRequestId(null);
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
      <style jsx>{`
        @media (max-width: 930px) {
          .hide-on-small {
            display: none !important;
          }
        }
        @media (min-width: 931px) {
          .hide-on-small {
            display: table-cell !important;
          }
        }
      `}</style>
      <div className="w-full max-w-6xl backdrop-blur-sm bg-white/60 rounded-xl p-6 shadow">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-gray-700">
              Request Information
            </h2>
            <div className="text-xs text-gray-500 italic">
              {showOnlyMyRequests
                ? "Showing only your requests from the most recent 100"
                : "Showing the most recent 100 requests"}
            </div>
          </div>
          <div className="relative inline-flex items-center">
            <span className="mr-3 text-sm text-gray-700">
              Show only my requests
            </span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={showOnlyMyRequests}
                onChange={() => setShowOnlyMyRequests(!showOnlyMyRequests)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
        <div className="relative">
          <table className="w-full table-fixed text-sm text-left text-gray-700">
            <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
              <tr>
                <th className="w-1/12 px-4 py-2">
                  <span className="hidden md:block">Request</span> ID
                </th>
                <th className="w-1/12 px-4 py-2 hidden sm:table-cell">
                  <div className="hidden md:block">Status</div>
                </th>
                <th
                  className="px-4 py-2 hide-on-small"
                  style={{ width: "11%" }}
                >
                  Requester
                </th>
                <th className="pr-4 pl-7 py-2" style={{ width: "64%" }}>
                  Random Number
                </th>
                <th className="px-4 py-2 text-right w-1/12 md:w-1/8  xl:w-1/12">
                  {" "}
                </th>
              </tr>
            </thead>
            <tbody className="min-h-[200px]">
              {currentRequests.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="text-center text-gray-500 py-6 w-full"
                  >
                    {showOnlyMyRequests
                      ? "You haven't made any requests yet."
                      : "No requests found."}
                  </td>
                </tr>
              ) : (
                currentRequests.map((req) => (
                  <tr
                    key={req.id}
                    className={`border-b border-gray-200 hover:bg-gray-50 ${
                      req.isRefunded
                        ? "bg-gray-50 opacity-75"
                        : address &&
                          req.requester.toLowerCase() === address.toLowerCase()
                        ? "bg-blue-50"
                        : ""
                    }`}
                  >
                    <td className="px-4 py-2 text-sm font-medium text-gray-700">
                      <div className="flex items-center gap-2">
                        <span>{req.id}</span>
                        {/* Dispute indicator for current round */}
                        {disputeInfo.hasDispute &&
                          disputeInfo.curRound === req.id && (
                            <div className="relative group">
                              <span className="text-xs font-medium px-1.5 py-0.5 rounded bg-orange-100 text-orange-700 border border-orange-300">
                                ⚠️
                              </span>
                              <div className="fixed mt-[-60px] ml-[-10px] py-1 px-2 bg-gray-900 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-[9999] whitespace-nowrap shadow-lg">
                                Current round has dispute
                                <div className="absolute top-full left-5 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                              </div>
                            </div>
                          )}
                      </div>
                    </td>
                    <td className="px-2 py-2 text-sm hidden sm:table-cell">
                      <span
                        className={`text-xs font-medium px-2 py-1 rounded ${
                          req.isRefunded
                            ? "bg-gray-100 text-gray-600"
                            : req.status === "Fulfilled"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {req.isRefunded ? "Refunded" : req.status}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-xs font-mono overflow-hidden overflow-ellipsis hide-on-small">
                      <div className="group relative">
                        <span className="hidden xl:inline">
                          {req.requester.substring(0, 6)}...
                          {req.requester.substring(req.requester.length - 4)}
                        </span>
                        <span className="inline xl:hidden">
                          {req.requester.substring(0, 4)}...
                          {req.requester.substring(req.requester.length - 3)}
                        </span>
                        <div className="fixed mt-[-60px] ml-[-10px] py-1 px-2 bg-gray-900 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-[9999] whitespace-nowrap shadow-lg">
                          {req.requester}
                          <div className="absolute top-full left-5 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                        </div>
                      </div>
                    </td>
                    <td className="pr-4 pl-7 py-2 text-sm font-medium text-gray-800 break-normal font-mono tracking-normal overflow-hidden overflow-ellipsis">
                      {req.status === "Fulfilled" ? (
                        <div className="group relative">
                          <span className="truncate block whitespace-nowrap overflow-hidden text-ellipsis">
                            {req.randomNumber}
                          </span>
                          <div className="fixed mt-[-60px] ml-[-10px] py-1 px-2 bg-gray-900 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-[9999] whitespace-nowrap shadow-lg">
                            {req.randomNumber}
                            <div className="absolute top-full left-5 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                          </div>
                        </div>
                      ) : (
                        ""
                      )}
                    </td>
                    <td className="px-2 py-2 text-right">
                      <div className="flex justify-end gap-1">
                        {/* Refund button - show when halted, not fulfilled, not refunded, and user is requester */}
                        {isHalted &&
                          req.status !== "Fulfilled" &&
                          !req.isRefunded &&
                          address &&
                          req.requester.toLowerCase() ===
                            address.toLowerCase() && (
                            <div className="relative group">
                              <button
                                onClick={() => handleRefundClick(req.id)}
                                disabled={
                                  isPending ||
                                  isConfirming ||
                                  refundingRequestId === req.id
                                }
                                className="inline-flex justify-center px-2 py-1 text-xs bg-red-50 text-red-700 border border-red-300 rounded hover:bg-red-100 transition items-center gap-1 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {refundingRequestId === req.id &&
                                (isPending || isConfirming) ? (
                                  <>
                                    <CgSpinner
                                      className="animate-spin"
                                      size={12}
                                    />
                                    <span className="hidden md:inline">
                                      Processing
                                    </span>
                                    <span className="md:hidden">P</span>
                                  </>
                                ) : (
                                  <>
                                    <span className="hidden md:inline">
                                      Refund
                                    </span>
                                    <span className="md:hidden">R</span>
                                    <CiCircleQuestion size={14} />
                                  </>
                                )}
                              </button>
                              <div className="fixed mt-[-60px] ml-[-10px] py-1 px-2 bg-gray-900 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-[9999] whitespace-nowrap shadow-lg">
                                Refund now or wait for protocol resume to
                                fulfill request.
                                <div className="absolute top-full left-5 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                              </div>
                            </div>
                          )}

                        {/* Refunded indicator - show when request is refunded */}
                        {req.isRefunded && (
                          <div className="inline-flex justify-center px-2 py-1 text-xs bg-gray-100 text-gray-600 border border-gray-300 rounded items-center gap-1">
                            <span className="hidden md:inline">Refunded</span>
                            <span className="md:hidden">RF</span>
                            <span className="text-gray-500">✓</span>
                          </div>
                        )}

                        <Link
                          href={`/details/${req.id}`}
                          className="inline-flex justify-end px-2 py-1 text-xs bg-blue-50 text-blue-700 border border-blue-300 rounded hover:bg-blue-100 transition items-center gap-1"
                        >
                          <span className="hidden md:inline">Details</span>
                          <LuExternalLink size={14} />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          currentPage={currentPage}
          totalCount={filteredRequests.length}
          itemsPerPage={itemsPerPage}
          onPageChange={onPageChange}
        />
      </div>

      {/* Refund Confirmation Modal */}
      {showConfirmModal && confirmModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white relative rounded-4xl shadow-xl p-6 w-full max-w-md min-h-[200px] space-y-4">
            <div className="flex items-center justify-between absolute top-4 left-6 right-6">
              <div className="flex-1">
                <h2 className="text-sm font-semibold text-gray-500 text-left">
                  Confirm Refund for Request {confirmModalData.requestId}
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
      {showRefundModal && refundingRequestId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white relative rounded-4xl shadow-xl p-6 w-full max-w-md min-h-[200px] space-y-4">
            <div className="flex items-center justify-between absolute top-4 left-6 right-6">
              <div className="flex-1">
                {!isConfirmed && (
                  <h2 className="text-sm font-semibold text-gray-500 text-left">
                    Refunding request {refundingRequestId}...
                  </h2>
                )}
              </div>
              <button
                onClick={closeRefundModal}
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
                  Request ID:{" "}
                  <span className="font-mono">{refundingRequestId}</span>
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
                onClick={closeRefundModal}
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

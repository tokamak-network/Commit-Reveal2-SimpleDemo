"use client";

import { commitReveal2Abi, consumerExampleAbi } from "@/constants";
import { estimateGas, getGasPrice, readContract } from "@wagmi/core";
import { useState } from "react";
import { LuExternalLink } from "react-icons/lu";
import { encodeFunctionData } from "viem";
import { useConfig } from "wagmi";
import RequestModal from "./RequestModal";

interface Props {
  requestsCount: number;
  onRequest: () => void;
  commitReveal2Address: `0x${string}`;
  consumerExampleAddress: `0x${string}`;
  requestDisabled?: boolean;
  onRefresh: () => void;
}

export default function RequestHeader({
  requestsCount,
  onRequest,
  commitReveal2Address,
  consumerExampleAddress,
  requestDisabled,
  onRefresh,
}: Props) {
  const config = useConfig();
  const [showModal, setShowModal] = useState(false);
  const [feeData, setFeeData] = useState<{
    requestFee: bigint;
    networkFee: bigint;
    totalFee: bigint;
  } | null>(null);

  async function handleClick() {
    const requestFee = await getRequestFee(
      commitReveal2Address,
      consumerExampleAddress
    );

    const data = encodeFunctionData({
      abi: consumerExampleAbi,
      functionName: "requestRandomNumber",
    });
    const estimatedGasUsed = await estimateGas(config, {
      data: data,
      to: consumerExampleAddress,
      value: requestFee,
    });
    const networkFee = estimatedGasUsed * (await getGasPrice(config));
    const totalFee = requestFee + networkFee;

    setFeeData({ requestFee, networkFee, totalFee });
    setShowModal(true);
  }

  async function getRequestFee(
    commitReveal2Address: `0x${string}`,
    consumerExampleAddress: `0x${string}`
  ): Promise<bigint> {
    const callbackGasLimit = await readContract(config, {
      abi: consumerExampleAbi,
      address: consumerExampleAddress,
      functionName: "CALLBACK_GAS_LIMIT",
    });
    const gasPrice = await getGasPrice(config);
    const requestFee = await readContract(config, {
      abi: commitReveal2Abi,
      address: commitReveal2Address,
      functionName: "estimateRequestPrice",
      args: [callbackGasLimit, gasPrice],
    });
    return requestFee as bigint;
  }

  return (
    <>
      <h1 className="text-4xl font-bold text-blue-700 mb-2">
        Request a Random Number
      </h1>
      <p className="text-lg text-gray-600 mb-4">
        Your Requests Count:{" "}
        <span className="font-semibold text-black">{requestsCount}</span>
      </p>
      <button
        onClick={handleClick}
        className="bg-blue-600 hover:bg-blue-700 text-white text-xl font-semibold py-3 px-12 rounded-full transition mb-1 cursor-pointer disabled:bg-gray-300 disabled:text-gray-100 disabled:cursor-not-allowed"
        disabled={requestDisabled}
      >
        {requestDisabled ? "Request Disabled" : "Request"}
      </button>
      {requestDisabled && (
        <p className="text-sm text-red-500">
          At least 2 activated operators are required to request a random
          number.
        </p>
      )}
      <p className="text-sm text-gray-500 mb-12 mt-12">
        Random numbers are requested via this Consumer{" "}
        <a
          href={`https://etherscan.io/address/${consumerExampleAddress}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-blue-600 hover:underline"
        >
          contract
          <LuExternalLink size={12} />
        </a>
        .
      </p>
      {showModal && feeData && (
        <RequestModal
          requestFee={feeData.requestFee}
          networkFee={feeData.networkFee}
          totalFee={feeData.totalFee}
          consumerExampleAddress={consumerExampleAddress}
          onClose={() => {
            setShowModal(false);
            onRefresh();
          }}
        />
      )}
    </>
  );
}

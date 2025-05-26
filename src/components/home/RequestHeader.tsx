"use client";

import {
  commitReveal2Abi,
  consumerExampleAbi,
  getExplorerUrl,
} from "@/constants";
import { estimateFeesPerGas, estimateGas, readContract } from "@wagmi/core";
import axios from "axios";
import { useEffect, useState } from "react";
import { CgSpinner } from "react-icons/cg";
import { IoMdClose } from "react-icons/io";
import { LuExternalLink } from "react-icons/lu";
import { encodeFunctionData, parseGwei } from "viem";
import { useConfig } from "wagmi";
import RequestModal from "./RequestModal";

interface Props {
  requestsCount: number;
  commitReveal2Address: `0x${string}`;
  consumerExampleAddress: `0x${string}`;
  requestDisabled?: boolean;
  chainId: number;
  onRefresh: () => void;
}

export default function RequestHeader({
  requestsCount,
  commitReveal2Address,
  consumerExampleAddress,
  requestDisabled,
  chainId,
  onRefresh,
}: Props) {
  const config = useConfig();
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showNotification, setShowNotification] = useState(false);
  const [feeData, setFeeData] = useState<{
    requestFee: bigint;
    networkFee: bigint;
    totalFee: bigint;
  } | null>(null);
  const [callbackGasLimit, setCallbackGasLimit] = useState<bigint | null>(null);

  // 에러 메시지가 설정되면 알림을 표시하고 일정 시간 후 자동으로 숨김
  useEffect(() => {
    if (errorMessage) {
      setShowNotification(true);
      const timer = setTimeout(() => {
        setShowNotification(false);
        // 알림이 사라진 후 애니메이션을 위해 약간의 시간을 두고 메시지를 지움
        setTimeout(() => {
          setErrorMessage(null);
        }, 300);
      }, 5000); // 5초 후 알림 숨김

      return () => {
        clearTimeout(timer);
      };
    }
  }, [errorMessage]);

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

  // Update fee data every 11 seconds while modal is open
  useEffect(() => {
    if (!showModal || !callbackGasLimit) return;

    let isMounted = true;
    const updateFees = async () => {
      if (!isMounted) return;

      try {
        const gasPrice = await getInfuraGasPrice();

        const requestFee = await readContract(config, {
          abi: commitReveal2Abi,
          address: commitReveal2Address,
          functionName: "estimateRequestPrice",
          args: [callbackGasLimit, gasPrice],
        });

        const data = encodeFunctionData({
          abi: consumerExampleAbi,
          functionName: "requestRandomNumber",
        });
        const estimatedGasUsed = await estimateGas(config, {
          data: data,
          to: consumerExampleAddress,
          value: requestFee as bigint,
        });
        const networkFee = estimatedGasUsed * gasPrice;
        const totalFee = (requestFee as bigint) + networkFee;

        if (isMounted) {
          setFeeData({
            requestFee: requestFee as bigint,
            networkFee,
            totalFee,
          });
        }
      } catch (error) {
        console.error("Error updating fee data:", error);
      }
    };

    // Update immediately and then every 11 seconds
    updateFees();
    const intervalId = setInterval(updateFees, 11000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [
    showModal,
    callbackGasLimit,
    commitReveal2Address,
    consumerExampleAddress,
    config,
    // Removed chainId from deps as it's already included in the config
  ]);

  async function handleClick() {
    setIsLoading(true);
    setErrorMessage(null);
    setShowNotification(false);

    try {
      const { requestFee, gasPrice } = await getRequestFee(
        commitReveal2Address,
        consumerExampleAddress
      );

      const data = encodeFunctionData({
        abi: consumerExampleAbi,
        functionName: "requestRandomNumber",
      });

      try {
        const estimatedGasUsed = await estimateGas(config, {
          data: data,
          to: consumerExampleAddress,
          value: requestFee,
        });

        const networkFee = estimatedGasUsed * gasPrice;
        const totalFee = requestFee + networkFee;

        setFeeData({ requestFee, networkFee, totalFee });
        setShowModal(true);
      } catch (error: any) {
        // 가스 추정 오류 처리
        console.error("Gas estimation error:", error);
        let errorMsg = "Failed to estimate gas. ";

        // 잔액 부족 오류 감지
        if (error.message && error.message.includes("insufficient funds")) {
          errorMsg =
            "Insufficient funds to complete this transaction. Please check your wallet balance.";
        } else if (error.message) {
          errorMsg += error.message.slice(0, 100);
        } else {
          errorMsg += "Please check your wallet or try again later.";
        }

        setErrorMessage(errorMsg);
      }
    } catch (error: any) {
      console.error("Error preparing request:", error);
      setErrorMessage(
        error.message || "An error occurred while preparing the request."
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function getRequestFee(
    commitReveal2Address: `0x${string}`,
    consumerExampleAddress: `0x${string}`
  ): Promise<{ requestFee: bigint; gasPrice: bigint }> {
    const callbackGasLimit = await readContract(config, {
      abi: consumerExampleAbi,
      address: consumerExampleAddress,
      functionName: "CALLBACK_GAS_LIMIT",
    });
    setCallbackGasLimit(callbackGasLimit as bigint);

    const gasPrice = await getInfuraGasPrice();

    const requestFee = await readContract(config, {
      abi: commitReveal2Abi,
      address: commitReveal2Address,
      functionName: "estimateRequestPrice",
      args: [callbackGasLimit, gasPrice],
    });
    return { requestFee: requestFee as bigint, gasPrice };
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
        disabled={requestDisabled || isLoading}
      >
        {isLoading ? (
          <div className="flex items-center justify-center gap-2">
            <CgSpinner className="animate-spin" size={20} />
            <span>Preparing...</span>
          </div>
        ) : requestDisabled ? (
          "Request Disabled"
        ) : (
          "Request"
        )}
      </button>

      {/* 알림 컴포넌트 */}
      {errorMessage && (
        <div
          className={`fixed top-4 right-4 max-w-md bg-red-50 border border-red-200 rounded-lg p-4 shadow-lg text-red-600 transition-all duration-300 ${
            showNotification
              ? "opacity-100 translate-y-0"
              : "opacity-0 -translate-y-4"
          }`}
        >
          <div className="flex items-start">
            <div className="flex-1">
              <p className="font-semibold mb-1">Error</p>
              <p className="text-sm">{errorMessage}</p>
            </div>
            <button
              onClick={() => setShowNotification(false)}
              className="ml-4 text-gray-400 hover:text-gray-600"
            >
              <IoMdClose size={18} />
            </button>
          </div>
        </div>
      )}

      {requestDisabled && (
        <p className="text-sm text-red-500">
          At least 2 activated operators are required to request a random
          number.
        </p>
      )}
      <p className="text-sm text-gray-500 mb-12 mt-12">
        Random numbers are requested via this Consumer{" "}
        <a
          href={getExplorerUrl(chainId, `address/${consumerExampleAddress}`)}
          onClick={(e) => {
            if (chainId === 31337) e.preventDefault();
          }}
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
          chainId={chainId}
          onClose={() => {
            setShowModal(false);
            onRefresh();
          }}
        />
      )}
    </>
  );
}

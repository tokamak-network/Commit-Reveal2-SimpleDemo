"use client";

import { chainsToContracts } from "@/constants";
import { useState } from "react";
import { useAccount, useChainId } from "wagmi";
import { useAutoRefresh } from "../../hooks/useAutoRefresh";
import { useHomeData } from "../../hooks/useHomeData";
import RefreshButton from "../details/RefreshButton";
import ActivatedNodeList from "./ActivatedNodeList";
import HomeEmptyState from "./HomeEmptyState";
import RequestHeader from "./RequestHeader";
import RequestTable from "./RequestTable";

export default function HomeContent() {
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const isSupportedNetwork = !!chainsToContracts[chainId];
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // 홈 데이터 가져오기
  const { homeData, contracts, isLoading, error, refetch } = useHomeData();

  // 자동 새로고침 관리 (홈은 더 자주 업데이트)
  const { isSpinning, manualRefresh } = useAutoRefresh(refetch, {
    initialDelay: 12000, // 15초 후 첫 실행
    interval: 15000, // 30초마다 반복
  });

  // 연결되지 않은 상태
  if (!isConnected) {
    return (
      <main>
        <HomeEmptyState message="Please connect a wallet..." />
      </main>
    );
  }

  // 지원되지 않는 네트워크
  if (!isSupportedNetwork) {
    return (
      <main>
        <HomeEmptyState message="Please connect to an Anvil network (or a supported testnet)." />
      </main>
    );
  }

  return (
    <main>
      <div className="mt-12">
        <RefreshButton onRefresh={manualRefresh} isSpinning={isSpinning} />

        <RequestHeader
          requestsCount={homeData.requests.length}
          commitReveal2Address={contracts.commitReveal2 as `0x${string}`}
          consumerExampleAddress={contracts.consumerExample as `0x${string}`}
          requestDisabled={homeData.requestDisabled}
          chainId={chainId}
          onRefresh={manualRefresh}
        />

        <RequestTable
          requests={homeData.requests}
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          isHalted={homeData.isHalted}
          consumerExampleAddress={contracts.consumerExample as `0x${string}`}
          chainId={chainId}
          onRefundSuccess={manualRefresh}
        />

        <ActivatedNodeList
          nodes={homeData.activatedNodeList}
          leaderAddress={homeData.leaderAddress}
          commitReveal2Address={contracts.commitReveal2 as `0x${string}`}
          chainId={chainId}
        />
      </div>
    </main>
  );
}

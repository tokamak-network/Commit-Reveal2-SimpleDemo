"use client";

import { FiRefreshCw } from "react-icons/fi";

interface RefreshButtonProps {
  onRefresh: () => void;
  isSpinning: boolean;
}

export default function RefreshButton({
  onRefresh,
  isSpinning,
}: RefreshButtonProps) {
  return (
    <div className="flex justify-end mb-4">
      <button
        onClick={onRefresh}
        className="text-blue-600 hover:text-blue-800 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
      >
        <FiRefreshCw size={18} className={isSpinning ? "animate-spin" : ""} />
        Refresh
      </button>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { LuExternalLink } from "react-icons/lu";
import { useAccount } from "wagmi";
import Pagination from "./Pagination";
import type { Request } from "./types";

interface Props {
  requests: Request[];
  currentPage: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}

export default function RequestTable({
  requests,
  currentPage,
  itemsPerPage,
  onPageChange,
}: Props) {
  const { address } = useAccount();
  const [showOnlyMyRequests, setShowOnlyMyRequests] = useState(false);

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

  return (
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
              <th className="w-1/12 px-4 py-2">Request ID</th>
              <th className="w-1/12 px-4 py-2">Status</th>
              <th className="w-3/12 px-4 py-2">Requester</th>
              <th className="w-5/12 px-4 py-2">Random Number</th>
              <th className="w-2/12 px-4 py-2 text-right"> </th>
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
                    address &&
                    req.requester.toLowerCase() === address.toLowerCase()
                      ? "bg-blue-50"
                      : ""
                  }`}
                >
                  <td className="px-4 py-2 text-sm font-medium text-gray-700">
                    {req.id}
                  </td>
                  <td className="px-4 py-2 text-sm">
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded ${
                        req.status === "Fulfilled"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {req.status}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-xs font-mono overflow-hidden overflow-ellipsis">
                    <div className="group relative">
                      <span>
                        {req.requester.substring(0, 6)}...
                        {req.requester.substring(req.requester.length - 4)}
                      </span>
                      <div className="fixed mt-[-60px] ml-[-10px] py-1 px-2 bg-gray-900 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-[9999] whitespace-nowrap shadow-lg">
                        {req.requester}
                        <div className="absolute top-full left-5 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-2 text-sm font-medium text-gray-800 break-normal font-mono tracking-normal overflow-hidden overflow-ellipsis">
                    {req.status === "Fulfilled" ? req.randomNumber : ""}
                  </td>
                  <td className="px-4 py-2 text-right">
                    <Link
                      href={`/details/${req.id}`}
                      className="inline-flex justify-end px-2 py-1 text-xs bg-blue-50 text-blue-700 border border-blue-300 rounded hover:bg-blue-100 transition items-center gap-1"
                    >
                      Details
                      <LuExternalLink size={14} />
                    </Link>
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
  );
}

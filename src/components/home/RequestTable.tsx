"use client";

import Link from "next/link";
import { LuExternalLink } from "react-icons/lu";
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
  console.log(requests);
  const sortedRequests = [...requests].sort(
    (a, b) => Number(b.id) - Number(a.id)
  );
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentRequests = sortedRequests.slice(indexOfFirst, indexOfLast);

  return (
    <div className="w-full max-w-6xl backdrop-blur-sm bg-white/60 rounded-xl p-6 shadow">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-700">My Request Info</h2>
      </div>
      <table className="w-full table-fixed text-sm text-left text-gray-700">
        <thead className="bg-gray-100 text-gray-600 uppercase">
          <tr>
            <th className="w-1.5/12 px-4 py-2">RequestId</th>
            <th className="w-1.5/12 px-4 py-2">Status</th>
            <th className="w-7/12 px-4 py-2">RandomNumber</th>
            <th className="w-2/12 px-4 py-2 text-right"> </th>
          </tr>
        </thead>
        <tbody className="min-h-[200px]">
          {currentRequests.length === 0 ? (
            <tr>
              <td colSpan={4} className="text-center text-gray-500 py-6 w-full">
                No requests found.
              </td>
            </tr>
          ) : (
            currentRequests.map((req) => (
              <tr
                key={req.id}
                className="border-b border-gray-200 hover:bg-gray-50"
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
                <td className="px-4 py-2 text-sm font-medium text-gray-800 break-normal font-mono tracking-normal">
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

      <Pagination
        currentPage={currentPage}
        totalCount={requests.length}
        itemsPerPage={itemsPerPage}
        onPageChange={onPageChange}
      />
    </div>
  );
}

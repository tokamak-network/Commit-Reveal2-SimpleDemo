"use client";

import { useState } from "react";
import { LuExternalLink } from "react-icons/lu";
import type { ActivatedNode } from "./types";

interface Props {
  nodes: ActivatedNode[];
  leaderAddress: `0x${string}` | undefined;
  commitReveal2Address: string;
}

export default function ActivatedNodeList({
  nodes,
  leaderAddress,
  commitReveal2Address,
}: Props) {
  const [visibleCount, setVisibleCount] = useState(10);

  return (
    <div className="w-full max-w-6xl backdrop-blur-sm bg-white/60 rounded-xl p-6 shadow mt-12">
      <h2 className="text-lg text-left font-semibold text-gray-700 mb-4">
        Contract & Node Info
      </h2>
      <div className="mb-6 space-y-2 text-base text-gray-700 text-left">
        <div className="text-left">
          <span className="font-semibold">CommitReveal2 Contract:</span>{" "}
          <a
            href={`https://etherscan.io/address/${commitReveal2Address}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-blue-700 hover:underline break-all"
          >
            {commitReveal2Address}
            <LuExternalLink size={12} />
          </a>
        </div>
        <div className="text-left border-b border-gray-300 pb-2 mb-2">
          <span className="font-semibold">Leader Node:</span>{" "}
          <a
            href={`https://etherscan.io/address/${leaderAddress}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-blue-700 hover:underline break-all"
          >
            {leaderAddress}
            <LuExternalLink size={12} />
          </a>
        </div>

        <h2 className="text-base font-semibold text-gray-700 text-left">
          Activated Nodes: {nodes.length}
        </h2>
      </div>
      <table className="w-full table-fixed text-sm text-left text-gray-700">
        <thead className="bg-gray-100 text-gray-600 uppercase">
          <tr>
            <th className="px-4 py-2 w-2/12">Index</th>
            <th className="px-4 py-2 w-10/12">Address</th>
          </tr>
        </thead>
        <tbody>
          {nodes.length === 0 ? (
            <tr>
              <td colSpan={2} className="text-center text-gray-500 py-6">
                No activated nodes found.
              </td>
            </tr>
          ) : (
            nodes.slice(0, visibleCount).map((node) => (
              <tr
                key={node.index}
                className="border-b border-gray-200 hover:bg-gray-50"
              >
                <td className="px-4 py-2 font-medium text-sm text-gray-700">
                  {node.index}
                </td>
                <td className="px-4 py-2 font-mono text-sm font-medium text-gray-800 break-all">
                  <a
                    href={`https://etherscan.io/address/${node.address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-blue-700 hover:underline break-all"
                  >
                    {node.address}
                    <LuExternalLink size={12} />
                  </a>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      {visibleCount < nodes.length && (
        <div className="flex justify-center mt-6">
          <button
            className="text-sm px-4 py-2 border rounded bg-white hover:bg-gray-50 transition"
            onClick={() => setVisibleCount((prev) => prev + 10)}
          >
            Show More
          </button>
        </div>
      )}
    </div>
  );
}

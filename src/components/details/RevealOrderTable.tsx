"use client";

import { useMemo } from "react";

export default function RevealOrderTable({
  revealRows,
}: {
  revealRows: {
    revealOrder: number;
    nodeIndex: number;
    secret: `0x${string}` | undefined;
  }[];
}) {
  // Safely handle the revealRows data
  const safeRevealRows = useMemo(() => {
    if (!Array.isArray(revealRows)) return [];
    return revealRows.filter(
      (row) =>
        row &&
        typeof row.revealOrder === "number" &&
        typeof row.nodeIndex === "number"
    );
  }, [revealRows]);

  if (safeRevealRows.length === 0) {
    return (
      <p className="text-gray-500 italic mt-2">No reveal data available</p>
    );
  }

  return (
    <table className="w-full text-sm text-left mt-2 border border-gray-200">
      <thead className="bg-gray-100 text-gray-600 uppercase font-semibold">
        <tr>
          <th className="px-4 py-2 w-2/12">Reveal Order</th>
          <th className="px-4 py-2 w-2/12">Node Index</th>
          <th className="px-4 py-2 w-8/12">Secret</th>
        </tr>
      </thead>
      <tbody>
        {safeRevealRows.map((row) => (
          <tr key={row.revealOrder} className="border-t border-gray-100">
            <td className="px-4 py-2">#{row.revealOrder}</td>
            <td className="px-4 py-2">{row.nodeIndex}</td>
            <td className="px-4 py-2 font-mono text-gray-800">
              {row.secret || "N/A"}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

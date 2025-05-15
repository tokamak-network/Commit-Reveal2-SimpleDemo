// Copyright 2025 euisingee
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

"use client";

import { getExplorerUrl } from "@/constants";
import { LuExternalLink } from "react-icons/lu";

export default function ParticipatingNodes({
  participants,
  chainId,
}: {
  participants: `0x${string}`[];
  chainId: number;
}) {
  return (
    <div className="mb-6">
      <h2 className="font-semibold text-lg text-gray-800 mb-2">
        Participating Nodes
      </h2>
      <div className="space-y-2">
        {participants.map((address, i) => {
          const explorerUrl = getExplorerUrl(chainId, `address/${address}`);
          return (
            <div key={i} className="flex gap-4 items-center text-sm">
              <span className="text-gray-600 font-medium">#{i}</span>
              <a
                href={explorerUrl}
                onClick={(e) => {
                  if (explorerUrl === "#") e.preventDefault();
                }}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline inline-flex items-center gap-1 font-mono"
              >
                {address}
                <LuExternalLink size={12} />
              </a>
            </div>
          );
        })}
      </div>
    </div>
  );
}

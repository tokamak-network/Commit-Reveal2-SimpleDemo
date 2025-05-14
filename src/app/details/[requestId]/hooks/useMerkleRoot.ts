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

import { chainsToContracts, commitReveal2Abi } from "@/constants";
import { readContract } from "@wagmi/core";
import { useEffect, useState } from "react";
import { useChainId, useConfig } from "wagmi";

export function useMerkleRoot(
  startTime: bigint | undefined,
  refetchKey?: number
) {
  const config = useConfig();
  const chainId = useChainId();
  const contracts = chainsToContracts[chainId];
  const [merkleRoot, setMerkleRoot] = useState<string | null>(null);

  useEffect(() => {
    if (!startTime || startTime === BigInt(0)) return;

    readContract(config, {
      abi: commitReveal2Abi,
      address: contracts.commitReveal2 as `0x${string}`,
      functionName: "getMerkleRoot",
      args: [startTime],
    }).then((res) => {
      const [root, submitted] = res as [`0x${string}`, boolean];
      setMerkleRoot(submitted ? root : null);
    });
  }, [startTime, config, contracts, refetchKey]);

  return merkleRoot;
}

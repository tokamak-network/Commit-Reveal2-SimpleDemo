import { concat, keccak256 } from "viem";

/**
 * Efficient keccak256 implementation that mimics the Solidity _efficientKeccak256 function
 */
function efficientKeccak256(a: `0x${string}`, b: `0x${string}`): `0x${string}` {
  return keccak256(concat([a, b]));
}

/**
 * Unchecked increment function that mimics Solidity's unchecked_inc
 */
function uncheckedInc(i: number): number {
  return i + 1;
}

/**
 * TypeScript implementation of the Solidity createMerkleRoot function
 * @param leaves Array of bytes32 leaves (each leaf should be a double keccak256 hash of the secret)
 * @returns The merkle root as a bytes32 string
 */
export function createMerkleRoot(leaves: `0x${string}`[]): `0x${string}` {
  const leavesLen = leaves.length;

  if (leavesLen === 0) {
    throw new Error("Cannot create merkle root from empty leaves array");
  }

  if (leavesLen === 1) {
    return leaves[0];
  }

  const hashCount = leavesLen - 1;
  const hashes: `0x${string}`[] = new Array(hashCount);
  let leafPos = 0;
  let hashPos = 0;

  for (let i = 0; i < hashCount; i = uncheckedInc(i)) {
    const a = leafPos < leavesLen ? leaves[leafPos++] : hashes[hashPos++];
    const b = leafPos < leavesLen ? leaves[leafPos++] : hashes[hashPos++];
    hashes[i] = efficientKeccak256(a, b);
  }

  return hashes[hashCount - 1];
}

/**
 * Create leaves array from reveal rows, ordered by nodeIndex
 * Each leaf is a double keccak256 hash of the corresponding secret
 */
export function createLeavesFromRevealRows(
  revealRows: Array<{ nodeIndex: number; secret: `0x${string}` | undefined }>
): `0x${string}`[] {
  // Filter out rows without secrets and sort by nodeIndex
  const validRows = revealRows
    .filter(
      (row): row is { nodeIndex: number; secret: `0x${string}` } =>
        row.secret !== undefined
    )
    .sort((a, b) => a.nodeIndex - b.nodeIndex);

  // Create leaves array - each leaf is double keccak256 of the secret
  return validRows.map((row) => keccak256(keccak256(row.secret)));
}

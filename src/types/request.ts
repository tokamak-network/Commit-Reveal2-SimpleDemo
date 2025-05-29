export interface DetailInfo {
  requester: `0x${string}`;
  requestFee: bigint;
  requestBlockNumber: bigint;
  fulfillBlockNumber: bigint;
  randomNumber: bigint;
  isGenerated: boolean;
  isRefunded: boolean;
}

export interface RequestMetadata {
  requestTime: string | undefined;
  requestTxHash: `0x${string}` | undefined;
}

export interface GenerateInfo {
  generateTime: string | undefined;
  generateTxHash: `0x${string}` | undefined;
}

export interface RevealRow {
  revealOrder: number;
  nodeIndex: number;
  secret: `0x${string}` | undefined;
}

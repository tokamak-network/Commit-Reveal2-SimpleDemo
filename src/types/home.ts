export interface Request {
  id: string;
  status: string;
  randomNumber: string;
  requester: string;
  isRefunded: boolean;
  requestFee: string;
}

export interface ActivatedNode {
  index: number;
  address: string;
}

export interface DisputeInfo {
  hasDispute: boolean;
  curRound: string | null;
  requestedToSubmitCvTimestamp?: string;
  requestedToSubmitCoTimestamp?: string;
  previousSSubmitTimestamp?: string;
}

export interface HomeData {
  activatedOperators: `0x${string}`[] | undefined;
  leaderAddress: `0x${string}` | undefined;
  requests: Request[];
  activatedNodeList: ActivatedNode[];
  requestDisabled: boolean;
  isHalted: boolean;
  disputeInfo: DisputeInfo;
}

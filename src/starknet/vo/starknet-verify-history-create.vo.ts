export class StarknetVerifyHistoryCreateVo {
  chainId: string;
  contractAddress: string;
  compileTimestamp: number | null;
  classHash: string;
  compiledClassHash: string;
  declareTxHash: string;
  scarbVersion: string;
  verifiedTimestamp: number | null;
  verifyRequestAddress: string | undefined;
}

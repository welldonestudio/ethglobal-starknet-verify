const BASE_PATH = process.cwd();

export class StarknetHelper {
  static s3VerificationSrcBucket() {
    return 'wds-code-verification';
  }

  static s3VerificationSrcZipFileKey(chainId: string, contractAddress: string, timestamp: string) {
    return `starknet/${chainId}/${contractAddress}/${timestamp}/${timestamp}.zip`;
  }

  static s3VerificationSrcOutZipFileKey(chainId: string, contractAddress: string, timestamp: string) {
    return `starknet/${chainId}/${contractAddress}/${timestamp}/out_${timestamp}_cairo.zip`;
  }

  static localSrcCairoZipDir({
    chainId,
    contractAddress,
    timestamp,
  }: {
    chainId: string;
    contractAddress: string;
    timestamp: string;
  }): string {
    return this.localVerificationSrcCairoZipDir(chainId, contractAddress, timestamp);
  }

  static localVerificationSrcCairoZipDir(chainId: string, contractAddress: string, timestamp: string) {
    return (
      BASE_PATH + '/' + 'verification' + '/' + 'starknet' + '/' + chainId + '/' + contractAddress + '/' + timestamp
    );
  }

  static localVerificationSrcZipPath(chainId: string, contractAddress: string, timestamp: string) {
    return (
      BASE_PATH +
      '/' +
      'verification' +
      '/' +
      'starknet' +
      '/' +
      chainId +
      '/' +
      contractAddress +
      '/' +
      timestamp +
      '/' +
      timestamp +
      '.zip'
    );
  }
}

export class S3Path {
  static manualUploadVerificationBucket() {
    return 'wds-code-verification';
  }

  static s3CairoZipSrcFilesKey(chainId: string, contractAddress: string, timestamp: string | undefined) {
    return `starknet/${chainId}/${contractAddress}/${timestamp}/${timestamp}.zip`;
  }

  static s3CairoZipOutFilesKey(chainId: string, contractAddress: string, timestamp: string | undefined) {
    return `starknet/${chainId}/${contractAddress}/${timestamp}/out_${timestamp}_cairo.zip`;
  }
}

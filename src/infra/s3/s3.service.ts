import { S3 } from 'aws-sdk';
import { readFileSync } from 'fs';
import { StarknetHelper } from '../../starknet/starknet-helper';

export class S3Service {
  private getS3Client(): S3 {
    return new S3({ region: 'us-east-2', signatureVersion: 'v4' });
  }

  async uploadStarknetVerificationSrc(chainId: string, contractAddress: string, timestamp: string) {
    console.log(
      `uploadVerificationSrc Bucket=${StarknetHelper.s3VerificationSrcBucket()}, Key=${StarknetHelper.s3VerificationSrcZipFileKey(
        chainId,
        contractAddress,
        timestamp,
      )}`,
    );

    const contractFileBuffer = readFileSync(
      StarknetHelper.localVerificationSrcZipPath(chainId, contractAddress, timestamp),
    );
    await new S3.ManagedUpload({
      params: {
        Bucket: StarknetHelper.s3VerificationSrcBucket(),
        Key: StarknetHelper.s3VerificationSrcZipFileKey(chainId, contractAddress, timestamp),
        Body: contractFileBuffer,
      },
    }).promise();

    return {
      srcFileId: timestamp.toString(),
    };
  }
}

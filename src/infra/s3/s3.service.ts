import { S3 } from 'aws-sdk';
import { readFileSync } from 'fs';
import { StarknetHelper } from '../../starknet/starknet-helper';
import { PassThrough } from 'stream';
import * as archiver from 'archiver';

const SIGNED_URL_EXPIRE = 604800;

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

  async uploadStarknetVerificationOutput(
    chainId: string,
    contractAddress: string,
    timestamp: string,
    cairoAbi: string,
    sierraFileName: string,
  ) {
    console.log(
      `uploadVerificationOut Bucket=${StarknetHelper.s3VerificationSrcBucket()}, Key=${StarknetHelper.s3VerificationSrcOutZipFileKey(
        chainId,
        contractAddress,
        timestamp,
      )}`,
    );

    const cairoAbiBuffer = Buffer.from(JSON.stringify(cairoAbi, null, 2));
    const passThrough = new PassThrough();
    const archive = archiver('zip', {
      zlib: { level: 9 },
    });

    archive.pipe(passThrough);

    archive.append(cairoAbiBuffer, { name: `${sierraFileName}_abi.json` });

    await archive.finalize();

    await new S3.ManagedUpload({
      params: {
        Bucket: StarknetHelper.s3VerificationSrcBucket(),
        Key: StarknetHelper.s3VerificationSrcOutZipFileKey(chainId, contractAddress, timestamp),
        Body: passThrough,
        ContentType: 'application/zip',
      },
    }).promise();
  }

  async getObject(bucket: string, fileKey: string): Promise<Buffer | undefined> {
    const s3 = this.getS3Client();
    console.debug(`getObject bucket=${bucket}, fileKey=${fileKey}`);
    const object = await s3
      .getObject({
        Bucket: bucket,
        Key: fileKey,
      })
      .promise();

    if (object.Body) {
      return object.Body as Buffer;
    }

    return undefined;
  }

  async downloadUrl(bucket: string, fileKey: string): Promise<string | undefined> {
    const s3 = this.getS3Client();

    const params = {
      Bucket: bucket,
      Expires: SIGNED_URL_EXPIRE,
      Key: fileKey,
    };

    try {
      const url = await s3.getSignedUrlPromise('getObject', params);
      return url;
    } catch (err) {
      console.error(err);
      return '';
    }
  }
}

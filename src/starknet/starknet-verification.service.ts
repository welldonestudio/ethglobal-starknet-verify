import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { StarknetVerifyHistory } from './starknet-verify-history.entity';
import { Repository } from 'typeorm';
import { StarknetVerificationBuildProcessor } from './starknet-verification-build-processor';
import { HttpService } from '@nestjs/axios';
import { S3Service } from '../infra/s3/s3.service';
import * as fs from 'fs';
import { StarknetHelper } from './starknet-helper';
import { lastValueFrom, map } from 'rxjs';
import { S3Path } from '../infra/s3/s3-path';

@Injectable()
export class StarknetVerificationService {
  constructor(
    @InjectRepository(StarknetVerifyHistory)
    private readonly starknetVerifyHistoryRepository: Repository<StarknetVerifyHistory>,
    private readonly starknetVerificationBuildProcessor: StarknetVerificationBuildProcessor,
    private readonly httpService: HttpService,
    private readonly s3Service: S3Service,
  ) {}

  async verifyCairoContract(
    contractAddress: string,
    chainId: string,
    timestamp: string,
    scarbVersion: string,
    verifyRequestAddress: string | undefined,
  ) {
    const starknetPackage = await this.starknetVerifyHistoryRepository.findOne({
      where: {
        chainId: chainId,
        contractAddress: contractAddress,
      },
    });

    if (starknetPackage) {
      return {
        chainId: starknetPackage.chainId,
        contractAddress: starknetPackage.contractAddress,
        declareTxHash: starknetPackage.declareTxHash,
        errMsg: 'Already verified',
      };
    }

    const getClassHashAt = await this.getStrkClassHash(contractAddress, chainId);
    if (!getClassHashAt) {
      return {
        chainId: chainId,
        contractAddress: contractAddress,
        errMsg: 'Failed to get class hash from contract',
      };
    }

    const declareTransactionHash = await this.getDeclareTransactionHash(getClassHashAt);

    const getCompiledClassHash = await this.getStrkCompiledClassHash(declareTransactionHash, chainId);

    const compileTime = new Date();
    const { sierraClassHash, compiledClassHash, compiledSierraABI, sierraFileName } =
      await this.starknetVerificationBuildProcessor.compileCairoSierra(
        contractAddress,
        chainId,
        timestamp,
        scarbVersion,
      );

    console.log('getClassHashAt: ', getClassHashAt);
    console.log('sierraClassHash: ', sierraClassHash);
    console.log('getCompiledClassHash: ', getCompiledClassHash);
    console.log('compiledClassHash: ', compiledClassHash);
    console.log(`@@@ chainId=${chainId}, contractAddress=${contractAddress}, timestamp=${timestamp}`);
    if (getClassHashAt !== sierraClassHash && getCompiledClassHash !== compiledClassHash) {
      return {
        chainId: chainId,
        contractAddress: contractAddress,
        errMsg: `On-chain Sierra class hash and CASM class hash both are mismatch`,
      };
    }

    if (getClassHashAt !== sierraClassHash && getCompiledClassHash === compiledClassHash) {
      return {
        chainId: chainId,
        contractAddress: contractAddress,
        errMsg: `On-chain Sierra hash and contract Sierra are mismatch`,
      };
    }

    if (getClassHashAt === sierraClassHash && getCompiledClassHash !== compiledClassHash) {
      return {
        chainId: chainId,
        contractAddress: contractAddress,
        errMsg: `On-chain CASM hash and contract CASM are mismatch`,
      };
    }

    await this.s3Service.uploadStarknetVerificationOutput(
      chainId,
      contractAddress,
      timestamp,
      compiledSierraABI,
      sierraFileName,
    );

    const starknetVerifyHistory = await this.starknetVerifyHistoryRepository.save(
      StarknetVerifyHistory.create({
        chainId: chainId,
        contractAddress: contractAddress,
        compileTimestamp: Number(compileTime),
        classHash: getClassHashAt,
        compiledClassHash: getCompiledClassHash,
        declareTxHash: declareTransactionHash,
        scarbVersion: scarbVersion,
        verifiedTimestamp: Number(timestamp),
        verifyRequestAddress: verifyRequestAddress,
      }),
    );

    const verifiedSrcUrl = await this.verifiedStarknetSrcDownloadUrl(starknetVerifyHistory);
    const verifiedOutUrl = await this.verifiedStarknetOutDownloadUrl(starknetVerifyHistory);

    return {
      chainId: chainId,
      contractAddress: contractAddress,
      declareTxHash: declareTransactionHash,
      verifiedSrcUrl: verifiedSrcUrl,
      outFileUrl: verifiedOutUrl,
      verifyRequestAddress: verifyRequestAddress,
    };
  }

  async getStrkClassHash(contractAddress: string, chainId: string): Promise<string> {
    const starknetRpcUrl = this.getStarknetRpcUrl(chainId);
    if (!starknetRpcUrl) {
      throw new Error('Invalid Starknet chain id');
    }

    const headersRequest = {
      'Content-Type': 'application/json', // afaik this one is not needed
      'x-apikey': 'avL8ol0p8tVlJzmvoSA2iN0CeLODmQEuV2DMEncG7dmSX2qYoBgwMeqrfhKrz6LM',
    };
    const requestBody = {
      method: 'starknet_getClassHashAt',
      params: ['latest', contractAddress],
      id: 1,
      jsonrpc: '2.0',
    };

    try {
      return await lastValueFrom(
        this.httpService
          .post(starknetRpcUrl, requestBody, { headers: headersRequest })
          .pipe(map((response) => response.data.result)),
      );
    } catch (e) {
      throw new Error(`Failed to get starknet class hash from contract: ${e.message}`);
    }
  }

  async getDeclareTransactionHash(classHash: string): Promise<string> {
    try {
      const voyagerApiUrl = `https://sepolia.voyager.online/api/class/${classHash}`;
      const headersRequest = {
        'Content-Type': 'application/json', // afaik this one is not needed
        'x-apikey': 'avL8ol0p8tVlJzmvoSA2iN0CeLODmQEuV2DMEncG7dmSX2qYoBgwMeqrfhKrz6LM',
      };

      return await lastValueFrom(
        this.httpService
          .get(voyagerApiUrl, { headers: headersRequest })
          .pipe(map((response) => response.data.transactionHash)),
      );
    } catch (e) {
      throw new Error('Failed to get starknet compile class hash from declare tx hash');
    }
  }

  async getStrkCompiledClassHash(declareTxHash: string, chainId: string): Promise<string> {
    const starknetRpcUrl = this.getStarknetRpcUrl(chainId);
    if (!starknetRpcUrl) {
      throw new Error('Invalid Starknet chain id');
    }

    const requestBody = {
      method: 'starknet_getTransactionByHash',
      params: [declareTxHash],
      id: 1,
      jsonrpc: '2.0',
    };

    const headersRequest = {
      'Content-Type': 'application/json', // afaik this one is not needed
      'x-apikey': 'avL8ol0p8tVlJzmvoSA2iN0CeLODmQEuV2DMEncG7dmSX2qYoBgwMeqrfhKrz6LM',
    };

    try {
      return await lastValueFrom(
        this.httpService
          .post(starknetRpcUrl, requestBody, { headers: headersRequest })
          .pipe(map((response) => response.data.result.compiled_class_hash)),
      );
    } catch (e) {
      throw new Error('Failed to get starknet compile class hash from declare tx hash');
    }
  }

  private getStarknetRpcUrl(chainId: string) {
    switch (chainId) {
      case '0x534e5f4d41494e':
        return `https://rpc.nethermind.io/mainnet-juno`;
      case '0x534e5f5345504f4c4941':
        return `https://rpc.nethermind.io/sepolia-juno`;
      default:
        return null;
    }
  }

  async verifyCheck(chainId: string, contractAddress: string) {
    console.log(`@@@ chainId=${chainId}, contractAddress=${contractAddress}`);
    const starknetEntity = await this.starknetVerifyHistoryRepository.findOne({
      where: {
        chainId: chainId,
        contractAddress: contractAddress,
      },
    });

    if (!starknetEntity) {
      return {
        chainId: chainId,
        contractAddress: contractAddress,
        errMsg: `Not found contract verification history. chainId=${chainId}, contractAddress=${contractAddress}`,
      };
    }

    const verifiedSrcUrl = await this.verifiedStarknetSrcDownloadUrl(starknetEntity);
    const verifiedOutUrl = await this.verifiedStarknetOutDownloadUrl(starknetEntity);

    return {
      chainId: chainId,
      contractAddress: contractAddress,
      declareTxHash: starknetEntity.declareTxHash,
      verifiedSrcUrl: verifiedSrcUrl,
      verifyRequestAddress: starknetEntity.verifyRequestAddress,
      outFileUrl: verifiedOutUrl,
    };
  }

  private async saveSrcFile({
    chainId,
    contractAddress,
    timestamp,
  }: {
    chainId: string;
    contractAddress: string;
    timestamp: string;
  }) {
    const srcFileKey = StarknetHelper.s3VerificationSrcZipFileKey(chainId, contractAddress, timestamp);

    const zipFileBuf = await this.s3Service.getObject(S3Path.manualUploadVerificationBucket(), srcFileKey);

    const srcZipDir = StarknetHelper.localSrcCairoZipDir({
      chainId,
      contractAddress,
      timestamp,
    });

    fs.mkdirSync(srcZipDir, {
      recursive: true,
    });

    const srcZipFilePath = StarknetHelper.localVerificationSrcZipPath(chainId, contractAddress, timestamp);

    fs.writeFileSync(srcZipFilePath, zipFileBuf);
  }

  private async verifiedStarknetSrcDownloadUrl(entity: StarknetVerifyHistory) {
    return await this.s3Service.downloadUrl(
      StarknetHelper.s3VerificationSrcBucket(),
      S3Path.s3CairoZipSrcFilesKey(entity.chainId, entity.contractAddress, entity.verifiedTimestamp?.toString()),
    );
  }

  private async verifiedStarknetOutDownloadUrl(entity: StarknetVerifyHistory) {
    return await this.s3Service.downloadUrl(
      StarknetHelper.s3VerificationSrcBucket(),
      S3Path.s3CairoZipOutFilesKey(entity.chainId, entity.contractAddress, entity.verifiedTimestamp?.toString()),
    );
  }
}

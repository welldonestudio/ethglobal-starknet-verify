import { Injectable } from '@nestjs/common';
import { StarknetHelper } from './starknet-helper';
import * as fs from 'fs';
import * as unzipper from 'unzipper';
import * as path from 'path';
import { spawnSync } from 'child_process';
import { hash, json } from 'starknet';
import * as os from 'os';
import { S3Service } from '../infra/s3/s3.service';

@Injectable()
export class StarknetVerificationBuildProcessor {
  constructor(private readonly s3Service: S3Service) {}

  async compileCairoSierra(contractAddress: string, chainId: string, timestamp: string, scarbVersion: string) {
    const cairoZipDir = StarknetHelper.localSrcCairoZipDir({
      chainId,
      contractAddress,
      timestamp,
    });

    const files = fs.readdirSync(cairoZipDir);
    const targetFile = files.find((file) => file.endsWith('.zip'));
    if (!targetFile) {
      throw new Error(`Can't find target file: ${targetFile}`);
    }
    const targetFilePath = path.join(cairoZipDir, targetFile);
    const unzippedCairoFilePath = await this.unzipCairoZipFIle(targetFilePath);

    const homedir = os.homedir();
    const scarbPath = `${homedir}/.asdf/installs/scarb/${scarbVersion}/bin/scarb`;

    if (!fs.existsSync(scarbPath)) {
      console.log(`Requested scarb version ${scarbVersion} not found, installing...`);
      const installResult = spawnSync('asdf', ['install', 'scarb', scarbVersion]);

      if (installResult.error || installResult.status !== 0) {
        throw new Error(`Failed to install scarb version ${scarbVersion}: ${installResult.stderr.toString()}`);
      }

      console.log(`scarb version ${scarbVersion} installed successfully.`);
    }
    spawnSync(scarbPath, ['build'], {
      cwd: unzippedCairoFilePath,
    });

    const compiledFiles = fs.readdirSync(path.join(unzippedCairoFilePath, '/target/dev/'));
    const sierraCompiledJson = compiledFiles.find((file) => file.endsWith('.contract_class.json'));
    if (!sierraCompiledJson) {
      throw new Error('no sierra compile contract json file');
    }

    const sierraCompiledJsonPath = path.join(unzippedCairoFilePath, '/target/dev/', sierraCompiledJson);
    const compiledSierra = json.parse(fs.readFileSync(sierraCompiledJsonPath, 'ascii'));
    const compiledSierraABI = compiledSierra.abi;
    const sierraClassHash = hash.computeContractClassHash(compiledSierra);

    const compiledCasmClassHash = compiledFiles.find((file) => file.endsWith('.compiled_contract_class.json'));
    if (!compiledCasmClassHash) {
      throw new Error('no compiled class contract json file');
    }

    const compiledClassHashJsonPath = path.join(unzippedCairoFilePath, '/target/dev/', compiledCasmClassHash);
    const compiledCasm = json.parse(fs.readFileSync(compiledClassHashJsonPath, 'ascii'));
    const compiledClassHash = hash.computeCompiledClassHash(compiledCasm);

    const sierraFileName = sierraCompiledJson.split('.')[0];

    return {
      sierraClassHash,
      compiledClassHash,
      compiledSierraABI,
      sierraFileName,
    };
  }

  async unzipCairoZipFIle(targetFilePath: string) {
    const extractDir = path.dirname(targetFilePath);
    await fs
      .createReadStream(targetFilePath)
      .pipe(unzipper.Extract({ path: extractDir }))
      .promise();

    const macosxDir = path.join(extractDir, '__MACOSX');
    if (fs.existsSync(macosxDir)) {
      fs.rmSync(macosxDir, { recursive: true, force: true });
    }

    const filesInExtractDir = fs.readdirSync(extractDir);

    const extractedDir = filesInExtractDir.find((file) => {
      const fullPath = path.join(extractDir, file);
      return fs.statSync(fullPath).isDirectory();
    });

    if (!extractedDir) {
      throw new Error('No directory found in the extracted contents.');
    }
    return path.join(extractDir, extractedDir);
  }
}

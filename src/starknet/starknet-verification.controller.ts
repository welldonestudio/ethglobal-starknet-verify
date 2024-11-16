import { Body, Controller, HttpStatus, Post, UseInterceptors } from '@nestjs/common';
import { StarknetVerificationService } from './starknet-verification.service';
import * as fs from 'fs';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiResponse } from '@nestjs/swagger';
import { StarknetVerificationUploadReqDto } from './dto/starknet-verification-upload-req.dto';
import { StarknetVerificationUploadResultDto } from './dto/starknet-verification-upload-result.dto';
import { diskStorage } from 'multer';
import { StarknetHelper } from './starknet-helper';
import { S3Service } from '../infra/s3/s3.service';

@Controller('starknet')
export class StarknetVerificationController {
  constructor(
    private readonly starknetVerificationService: StarknetVerificationService,
    private readonly s3Service: S3Service,
  ) {}

  @Post('verifications/sources')
  @UseInterceptors(
    FileInterceptor('srcZipFile', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          req.body['srcFileId'] = Date.now().toString();
          console.log('@@@ req.body', JSON.stringify(req.body, null, 2));
          const srcZipPath = StarknetHelper.localVerificationSrcCairoZipDir(
            req.body.chainId,
            req.body.contractAddress,
            req.body.srcFileId,
          );

          fs.mkdirSync(srcZipPath, { recursive: true });

          cb(null, srcZipPath);
        },
        filename: (req, file, cb) => {
          cb(null, req.body.srcFileId + '.zip');
        },
      }),
    }),
  )
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Upload cairo contract zip file',
    type: StarknetVerificationUploadReqDto,
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    type: StarknetVerificationUploadReqDto,
  })
  async uploadStarknetVerificationSrc(
    @Body() req: StarknetVerificationUploadReqDto,
  ): Promise<StarknetVerificationUploadResultDto> {
    const result = await this.s3Service.uploadStarknetVerificationSrc(req.chainId, req.contractAddress, req.srcFileId);

    return {
      srcFileId: result.srcFileId,
    };
  }
}

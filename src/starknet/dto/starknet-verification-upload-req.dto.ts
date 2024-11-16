import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class StarknetVerificationUploadReqDto {
  @ApiProperty({
    name: 'contractAddress',
    required: true,
    example: '0x04f65a8f5198d5883c8784f4de644d0caca7c34a4c2b7dcfe333013e63979eb7',
  })
  @IsNotEmpty()
  contractAddress: string;

  @ApiProperty({
    name: 'chainId',
    required: true,
    example: '0x534e5f4d41494e',
  })
  @IsNotEmpty()
  chainId: string;

  @ApiProperty({
    name: 'srcZipFile',
    required: true,
    type: 'string',
    format: 'binary',
  })
  srcZipFile: Express.Multer.File;

  @ApiHideProperty()
  srcFileId: string;
}

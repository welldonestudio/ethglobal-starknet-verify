import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class StarknetVerificationReqDto {
  @ApiProperty({
    name: 'contractAddress',
    required: true,
    example: '0x04f65a8f5198d5883c8784f4de644d0caca7c34a4c2b7dcfe333013e63979eb7',
  })
  @IsNotEmpty()
  contractAddress: string;

  @ApiProperty({
    name: 'declareTxHash',
    required: true,
    example: '0x29ef688a01fd5c0dc4587bb14cefd06a707c583befef6d523fcd1e47d4cdeef',
  })
  @IsNotEmpty()
  declareTxHash: string;

  @ApiProperty({
    name: 'scarbVersion',
    required: true,
    example: '2.8.0',
  })
  @IsNotEmpty()
  scarbVersion: string;

  @ApiProperty({
    name: 'srcFileId',
    required: true,
  })
  srcFileId: string;

  @ApiProperty({
    name: 'chainId',
    required: true,
    example: '0x534e5f4d41494e',
  })
  @IsNotEmpty()
  chainId: string;

  @ApiProperty({
    name: 'verifyRequestAddress',
    required: false,
    example: '0x0dED557Ed864B26A0f3F552157AB6ad84C9448af',
  })
  verifyRequestAddress?: string;
}

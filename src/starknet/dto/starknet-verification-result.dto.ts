import { ApiProperty } from '@nestjs/swagger';

export class StarknetVerificationResultDto {
  @ApiProperty({ example: '0x534e5f4d41494e' })
  chainId: string;

  @ApiProperty({
    example: '0x04f65a8f5198d5883c8784f4de644d0caca7c34a4c2b7dcfe333013e63979eb7',
  })
  contractAddress: string;

  @ApiProperty()
  declareTxHash?: string;

  @ApiProperty({
    nullable: true,
    example: 'on chain sierra class hash and contract sierra hash are mismatch',
  })
  errMsg?: string;

  @ApiProperty({
    nullable: true,
    example:
      'https://verification-storage.com/starknet/0x534e5f4d41494e/0xc948e62bc2e632d7107717d23ff05872e7c847e2c78851af37885c4f54bef0c0/1694998406166/1694998406166.zip',
  })
  verifiedSrcUrl?: string;

  @ApiProperty({
    nullable: true,
    example:
      'https://verification-storage.com/starknet/0x534e5f4d41494e/0xc948e62bc2e632d7107717d23ff05872e7c847e2c78851af37885c4f54bef0c0/1694998406166/out_1694998406166.zip',
  })
  outFileUrl?: string;

  @ApiProperty({
    nullable: true,
    name: 'verifyRequestAddress',
    example: '0x0dED557Ed864B26A0f3F552157AB6ad84C9448af',
  })
  verifyRequestAddress?: string;
}

import { ApiProperty } from '@nestjs/swagger';

export class StarknetVerificationUploadResultDto {
  @ApiProperty()
  srcFileId: string;
}

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { S3Module } from 'src/infra/s3/s3.module';

@Module({
  imports: [ConfigModule, S3Module],
  providers: [],
  exports: [S3Module],
})
export class InfraModule {}

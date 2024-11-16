import { Module } from '@nestjs/common';
import { StarknetVerificationService } from './starknet-verification.service';
import { StarknetVerificationController } from './starknet-verification.controller';
import { InfraModule } from '../infra/infura.module';
import { HttpModule } from '@nestjs/axios';
import { StarknetVerifyHistory } from './starknet-verify-history.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [InfraModule, HttpModule, TypeOrmModule.forFeature([StarknetVerifyHistory])],
  controllers: [StarknetVerificationController],
  providers: [StarknetVerificationService],
  exports: [StarknetVerificationService],
})
export class StarknetVerificationModule {}

import { Module } from '@nestjs/common';
import { StarknetVerificationService } from './starknet-verification.service';
import { StarknetVerificationController } from './starknet-verification.controller';
import { InfraModule } from '../infra/infura.module';
import { HttpModule } from '@nestjs/axios';
import { StarknetVerifyHistory } from './starknet-verify-history.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StarknetVerificationBuildProcessor } from './starknet-verification-build-processor';

@Module({
  imports: [InfraModule, HttpModule, TypeOrmModule.forFeature([StarknetVerifyHistory])],
  controllers: [StarknetVerificationController],
  providers: [StarknetVerificationService, StarknetVerificationBuildProcessor],
  exports: [StarknetVerificationService],
})
export class StarknetVerificationModule {}

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { StarknetVerifyHistory } from './starknet-verify-history.entity';
import { Repository } from 'typeorm';

@Injectable()
export class StarknetVerificationService {
  constructor(
    @InjectRepository(StarknetVerifyHistory)
    private readonly starknetVerifyHistoryRepository: Repository<StarknetVerifyHistory>,
  ) {}
}

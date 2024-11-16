import { Controller } from '@nestjs/common';
import { StarknetVerificationService } from './starknet-verification.service';

@Controller('starknet')
export class StarknetVerificationController {
  constructor(private readonly starknetVerificationService: StarknetVerificationService) {}
}

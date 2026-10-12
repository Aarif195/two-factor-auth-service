import { Module } from '@nestjs/common';
import { TwoFactorController } from './two-factor.controller';
import { TotpService } from './totp.service';

@Module({
  controllers: [TwoFactorController],
  providers: [TotpService]
})
export class TwoFactorModule {}

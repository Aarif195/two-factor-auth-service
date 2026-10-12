import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { TwoFactorModule } from './two-factor/two-factor.module';

@Module({
  imports: [AuthModule, PrismaModule, TwoFactorModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

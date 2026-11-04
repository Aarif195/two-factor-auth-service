import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { TwoFactorModule } from './two-factor/two-factor.module';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration';
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    ThrottlerModule.forRoot(
      [
        {
          ttl: 60,
          limit: 10
        }
      ]
    ),
    AuthModule, PrismaModule, TwoFactorModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }

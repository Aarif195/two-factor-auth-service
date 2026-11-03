import { Controller, Post, Body, UseGuards, Get, Request} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import { TwoFactorGuard } from './guards/two-factor.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';


@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

@Post('login/2fa')
  async verifyTwoFactorLogin(
    @Body('userId') userId: string,
    @Body('code') code: string,
    @Body('type') type: 'TOTP' | 'EMAIL' | 'SMS',
  ) {
    return this.authService.verifyTwoFactorLogin(userId, code, type);
  }

  @UseGuards(JwtAuthGuard, TwoFactorGuard)
  @Get('profile')
  getProfile(@Request() req: any) {
    return {
      message: 'Access granted to secure endpoint',
      user: req.user,
    };
  }

}
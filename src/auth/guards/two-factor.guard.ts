import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class TwoFactorGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException('Unauthenticated');
    }

    // If user has 2FA enabled, enforce that 2FA verification was completed
    if (user.isTwoFactorEnabled && !user.isTwoFactorAuthenticated) {
      throw new UnauthorizedException('Two-Factor Authentication required');
    }

    return true;
  }
}
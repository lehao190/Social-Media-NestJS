import { Controller, UseGuards, Request, Post, Get, Session, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth/auth.service';
import { LocalAuthGuard } from './auth/local-auth.guard';

@Controller()
export class AppController {
  constructor(
    private authService: AuthService,
  ) {}

  // Login
  @UseGuards(LocalAuthGuard)
  @Post('auth/login')
  async login(@Request() req) {
    return this.authService.login(req.user);
  }

  // Refresh token
  @Post('auth/refresh')
  async refresh(@Request() req) {
    if(req.session.passport && req.session.passport.user) {
      const accessToken = this.authService.createNewToken(req.user);
      return {
        accessToken
      };
    } else {
      throw new UnauthorizedException('Cannot issue token!');
    }
  }

  // Logout
  @Post('auth/logout')
  logout(@Request() req): object{
    if(req.session.passport && req.session.passport.user) {
      req.session.destroy();
      this.authService.logout(req.user);

      return {
        message: 'Logout Successfully!!!'
      };
    }
    return {
      message: 'Not Logged In!!!'
    };
  }

  // Get Authenticated User's Credentials
  // @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req, @Session() session: Record<string, any>) {
    if(session.passport && session.passport.user) {
      const user = { 
        ...session.passport.user 
      };
      delete user.refresh_token;
      return user;
    } else {
      throw new UnauthorizedException('Can not get user profile');
    }
  }
}

import {
  Controller,
  UseGuards,
  Request,
  Post,
  Get,
  Session,
  UnauthorizedException,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth/auth.service';
import { LocalAuthGuard } from './auth/local-auth.guard';

@Controller()
export class AppController {
  constructor(private authService: AuthService) {}

  // Login
  @UseGuards(LocalAuthGuard)
  @Post('auth/login')
  async login(@Request() req) {
    return this.authService.login(req.user);
  }

  // Refresh token
  @Post('auth/refresh')
  async refresh(@Request() req) {
    if (req.session.passport && req.session.passport.user) {
      const accessToken = this.authService.createNewToken(req.user);
      return {
        accessToken,
      };
    } else {
      throw new UnauthorizedException('Cannot issue token!');
    }
  }

  // Logout
  @Post('auth/logout')
  async logout(@Request() req, @Res() res: Response) {
    if (req.session.passport && req.session.passport.user) {
      this.authService.logout(req.user);

      return req.logout(() => {
        res.clearCookie('connect.sid');
        req.session.destroy();

        res.status(200).json({
          message: 'Logout Successfully!!!',
        });
      });
    }
    return res.json({
      message: 'Not Logged In!!!',
    });
  }

  // Get Authenticated User's Credentials
  @Get('profile')
  getProfile(@Request() req, @Session() session: Record<string, any>) {
    if (session.passport && session.passport.user) {
      const user = {
        ...session.passport.user,
      };
      delete user.refresh_token;
      return user;
    } else {
      throw new UnauthorizedException('Can not get user profile');
    }
  }
}

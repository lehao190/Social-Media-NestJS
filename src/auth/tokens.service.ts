import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class TokensService {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  issueTokens(user: User) {
    const payload = {
      sub: user.id,
      username: user.username,
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('jwt.accessToken.secret'),
      expiresIn: this.configService.get<string>('jwt.accessToken.expiresIn'),
    });
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('jwt.refreshToken.secret'),
      expiresIn: this.configService.get<string>('jwt.refreshToken.expiresIn'),
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  issueNewToken(user: User, isAccessToken) {
    try {
      this.jwtService.verify(user.refresh_token, {
        secret: this.configService.get<string>('jwt.refreshToken.secret'),
      });
  
      const payload = {
        sub: user.id,
        username: user.username,
      };
  
      const newToken = this.jwtService.sign(payload, {
        secret: isAccessToken
          ? this.configService.get<string>('jwt.accessToken.secret')
          : this.configService.get<string>('jwt.refreshToken.secret'),
        expiresIn: isAccessToken
          ? this.configService.get<string>('jwt.accessToken.expiresIn')
          : this.configService.get<string>('jwt.refreshToken.expiresIn'),
      });
  
      return newToken;
    } catch (error) {
      console.error(error)
      throw new UnauthorizedException();
    }
  }
}

import { Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';
import { User } from 'src/users/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TokensService } from './tokens.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,

    private usersService: UsersService,
    private tokensService: TokensService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findOne(email);
    const hashedPassword = user.password;
    const validPassowrd = await bcrypt.compare(password, hashedPassword);
    
    if (user && validPassowrd) {
      delete user.password;
      return user;
    }
    
    return null;
  }

  async login(user: User) {
    const { accessToken, refreshToken } = this.tokensService.issueTokens(user);
    user.refresh_token = refreshToken;
    this.usersRepository.save(user);

    return {
      accessToken
    }
  }

  async logout(user: User) {
    user.refresh_token = null;
    this.usersRepository.save(user);
  }

  createNewToken(user: User) {
    return this.tokensService.issueNewToken(user, true);
  }
}

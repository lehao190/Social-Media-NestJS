import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TokensService } from 'src/auth/tokens.service';
import { JwtModule } from '@nestjs/jwt';

@Module({
  controllers: [UsersController],
  providers: [UsersService, TokensService],
  imports: [TypeOrmModule.forFeature([User]), JwtModule.register({})],
  exports: [UsersService],
})
export class UsersModule {}

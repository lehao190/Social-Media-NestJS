// import { PartialType } from '@nestjs/mapped-types';
// import { CreateUserDto } from './create-user.dto';
import { IsString, IsEmail, IsNotEmpty } from "class-validator"

// export class UpdateUserDto extends PartialType(CreateUserDto) {}
export class UpdateUserDto {
    @IsString()
    @IsNotEmpty()
    username: string;
  
    @IsEmail()
    @IsNotEmpty()
    email: string;
  }

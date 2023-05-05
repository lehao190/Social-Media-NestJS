import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import { getStorage } from 'firebase-admin/storage';
import { IPaginationOptions, paginate, Pagination } from 'nestjs-typeorm-paginate';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async paginate(options: IPaginationOptions): Promise<Pagination<User>> {
    return paginate<User>(this.usersRepository, options, {
      select: {
        id: true,
        email: true,
        username: true,
        avatar: true,
        isAdmin: true,
        created_at: true,
        updated_at: true,
      },
    });
  }

  async create(createUserDto: CreateUserDto, avatar) {
    // Check if user existed
    const existedUser = await this.usersRepository.findOneBy({ email: createUserDto.email });
    if(existedUser) {
      throw new BadRequestException('User Already Exists!');
    }

    const user = new User();
    user.username = createUserDto.username;
    user.email = createUserDto.email;

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    user.password = hashedPassword;

    // Upload avatar to firebase storage
    if(avatar) {
      const avatarName = 'images/'+ Date.now() + avatar.originalname;
      // await getStorage().bucket().file(avatarName).save(avatar.buffer)
      // await getStorage().bucket().file(avatarName).makePublic();
      // const userAvatar = await getStorage().bucket().file(avatarName).publicUrl();
      const firebaseFile = await getStorage().bucket().file(avatarName)
      await firebaseFile.save(avatar.buffer)
      await firebaseFile.makePublic()
      const userAvatar = await firebaseFile.publicUrl()
      user.avatar = userAvatar;
    }

    const createdUser = await this.usersRepository.save(user);
    delete createdUser.password;
    delete createdUser.refresh_token;

    return createdUser;
  }

  findAll(): Promise<User[]> {
    return this.usersRepository.find({
      select: {
        id: true,
        email: true,
        username: true,
        avatar: true,
        isAdmin: true,
        created_at: true,
        updated_at: true,
      }
    });
  }

  async findOne(email: string): Promise<User> {
    return this.usersRepository.findOneBy({ email });
  }
  
  async findOneById(id: number): Promise<User> {
    return this.usersRepository.findOneBy({ id });
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const existedUser = await this.usersRepository.findOneBy({ id });
    
    if(!existedUser) {
      throw new BadRequestException('User Not Existed!');
    }
    
    await this.usersRepository.update({ id }, updateUserDto);
    const updatedUser = await this.usersRepository.findOneBy({ id });

    delete updatedUser.password;
    delete updatedUser.refresh_token;
    return updatedUser;
  }

  async remove(id: number) {
    const existedUser = await this.usersRepository.findOneBy({ id });
    
    if(!existedUser) {
      throw new BadRequestException('User Not Existed!');
    }

    if(existedUser.avatar) {
      const avatarName = existedUser.avatar.split('%2F');
      await getStorage().bucket().file('images/' + avatarName[1]).delete();
    }
    
    await this.usersRepository.delete(id);
    
    return {
      message: 'Delete User Successfully'
    }
  }
}

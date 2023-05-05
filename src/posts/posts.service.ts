import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { getStorage } from 'firebase-admin/storage';
import { IPaginationOptions, paginate, Pagination } from 'nestjs-typeorm-paginate';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Post } from './entities/post.entity';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private postsRepository: Repository<Post>,

    @InjectRepository(User)
    private usersRepository: Repository<User>
  ) {}

  async create(createPostDto: CreatePostDto, file, user) {
    const newPost = this.postsRepository.create({
      text: createPostDto.text,
      user
    });

    if(file) {
      const fileName = 'posts/'+ Date.now() + file.originalname;
      // await getStorage().bucket().file(fileName).save(file.buffer)
      // await getStorage().bucket().file(fileName).makePublic();
      // const postFile = await getStorage().bucket().file(fileName).publicUrl();
      const firebaseFile = await getStorage().bucket().file(fileName);
      await firebaseFile.save(file.buffer);
      await firebaseFile.makePublic();
      const postFile = firebaseFile.publicUrl();
      newPost.file = postFile;
    }

    await this.postsRepository.save(newPost);

    delete newPost.user.refresh_token;

    return newPost;
  }

  async paginate(options: IPaginationOptions): Promise<Pagination<Post>> {
    return paginate<Post>(this.postsRepository, options, {
      select: {
        id: true,
        text: true,
        file: true,
        user: {
          id: true,
          username: true,
          avatar: true,
        },
        created_at: true,
        updated_at: true,
      },
      relations: {
        user: true
      },
      order: {
        created_at: 'DESC'
      }
    });
  }

  findOne(id: number) {
    return this.postsRepository.findOneBy({ id });
  }

  async update(id: number, updatePostDto: UpdatePostDto) {
    const existedPost = await this.postsRepository.findOneBy({ id });
    
    if(!existedPost) {
      throw new BadRequestException('Post Not Existed!');
    }

    await this.postsRepository.update({ id }, updatePostDto);
    return await this.postsRepository.findOneBy({ id });
  }

  async remove(id: number) {
    const existedPost = await this.postsRepository.findOneBy({ id });
    
    if(!existedPost) {
      throw new BadRequestException('Post Not Existed!');
    }

    if(existedPost.file) {
      const postImageName = existedPost.file.split('%2F');
      await getStorage().bucket().file('posts/' + postImageName[1]).delete();
    }

    await this.postsRepository.delete(id)

    return {
      message: 'Delete Post Successfully'
    }
  }
}

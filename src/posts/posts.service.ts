import { Injectable } from '@nestjs/common';
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
      await getStorage().bucket().file(fileName).save(file.buffer)
      await getStorage().bucket().file(fileName).makePublic();
      const postFile = await getStorage().bucket().file(fileName).publicUrl();
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
    return `This action returns a #${id} post`;
  }

  update(id: number, updatePostDto: UpdatePostDto) {
    return `This action updates a #${id} post`;
  }

  remove(id: number) {
    return `This action removes a #${id} post`;
  }
}

import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
  DefaultValuePipe,
  Query,
  UseInterceptors,
  UploadedFile,
  Session,
  BadRequestException,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Pagination } from 'nestjs-typeorm-paginate';
import { Post as UserPost } from './entities/post.entity';
import { FileInterceptor } from '@nestjs/platform-express';
import { ValidationPipe } from 'src/validation.pipe';

@UseGuards(JwtAuthGuard)
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file', {
    limits: {
      fileSize: 30 * 1024 * 1024,
    },
    fileFilter: (req, file, cb) => {
      if (file.mimetype.match(/\/(jpg|jpeg|png|mp4|ogg|mov|avi|wmv)$/)) {
        cb(null, true);
      } else {
        cb(new BadRequestException('File type is not acceptable!'), false);
      }
    },
  }))
  create(
    @Session() session: Record<string, any>,
    @Body(new ValidationPipe()) createPostDto: CreatePostDto,
    @UploadedFile()
    file: Express.Multer.File,
  ) {
    return this.postsService.create(createPostDto, file, session.passport.user);
  }

  @Get()
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number = 10,
  ): Promise<Pagination<UserPost>> {
    limit = limit > 100 ? 100 : limit;
    return this.postsService.paginate({
      page,
      limit,
    });
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.postsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updatePostDto: UpdatePostDto) {
    return this.postsService.update(+id, updatePostDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.postsService.remove(+id);
  }
}

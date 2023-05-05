// import { PartialType } from '@nestjs/mapped-types';
// import { CreatePostDto } from './create-post.dto';
import { IsString, IsNotEmpty } from "class-validator"

// export class UpdatePostDto extends PartialType(CreatePostDto) {}

export class UpdatePostDto {
	@IsNotEmpty()
	@IsString()
	text: string;

	// file: string;

	// @IsString()
	// @IsNotEmpty()
	// userId: string;
}
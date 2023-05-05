import { IsString, IsNotEmpty } from "class-validator"
export class CreatePostDto {
  @IsNotEmpty()
  @IsString()
  text: string;
  
  file: string;
  
  @IsString()
  @IsNotEmpty()
  userId: string;
}

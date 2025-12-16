import { IsEnum, IsMongoId, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddToListDto {
  @ApiProperty({ example: '507f1f77bcf86cd799439011' })
  @IsNotEmpty()
  @IsMongoId()
  contentId: string;

  @ApiProperty({ enum: ['movie', 'tvshow'], example: 'movie' })
  @IsNotEmpty()
  @IsEnum(['movie', 'tvshow'])
  contentType: string;
}

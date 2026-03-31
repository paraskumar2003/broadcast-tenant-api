import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsEnum } from 'class-validator';

export class CreateMediaDto {
    @ApiProperty({ example: '6482c4adda0e29b69bfec072' })
    @IsString()
    @IsNotEmpty()
    projectId: string;

    @ApiPropertyOptional({ example: 'Banner image for campaign' })
    @IsString()
    @IsOptional()
    alt?: string;

    @ApiPropertyOptional({ enum: ['image', 'video', 'document', 'other'], example: 'image' })
    @IsEnum(['image', 'video', 'document', 'other'])
    @IsOptional()
    mediaType?: string;
}

export class UpdateMediaDto {
    @ApiPropertyOptional({ example: 'Updated alt text' })
    @IsString()
    @IsOptional()
    alt?: string;

    @ApiPropertyOptional({ example: 'New filename' })
    @IsString()
    @IsOptional()
    filename?: string;

    @ApiPropertyOptional({ enum: ['image', 'video', 'document', 'other'], example: 'image' })
    @IsEnum(['image', 'video', 'document', 'other'])
    @IsOptional()
    mediaType?: string;
}

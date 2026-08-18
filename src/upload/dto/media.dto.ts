import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsEnum } from 'class-validator';

export class PresignMediaDto {
    @ApiProperty({ example: '6482c4adda0e29b69bfec072' })
    @IsString()
    @IsNotEmpty()
    projectId: string;

    @ApiProperty({ example: 'campaign-banner.jpg' })
    @IsString()
    @IsNotEmpty()
    filename: string;

    @ApiProperty({ example: 'image/jpeg' })
    @IsString()
    @IsNotEmpty()
    contentType: string;
}

export class ConfirmMediaDto {
    @ApiProperty({ example: '6482c4adda0e29b69bfec072' })
    @IsString()
    @IsNotEmpty()
    projectId: string;

    @ApiProperty({
        example: 'whatsapp-service/development/uploads/0f734bec-...jpeg',
        description: 'The S3 key returned by /media/presign, after the file has been PUT there.',
    })
    @IsString()
    @IsNotEmpty()
    key: string;

    @ApiProperty({ example: 'campaign-banner.jpg' })
    @IsString()
    @IsNotEmpty()
    filename: string;

    @ApiPropertyOptional({ example: 'Banner image for campaign' })
    @IsString()
    @IsOptional()
    alt?: string;

    @ApiPropertyOptional({ enum: ['image', 'video', 'document', 'other'], example: 'image' })
    @IsEnum(['image', 'video', 'document', 'other'])
    @IsOptional()
    mediaType?: string;
}

export class MetaHandleDto {
    @ApiProperty({ example: '6482c4adda0e29b69bfec072' })
    @IsString()
    @IsNotEmpty()
    projectId: string;

    @ApiPropertyOptional({
        example: '6482c4adda0e29b69bfec099',
        description: 'A media gallery item to convert. Provide this or `url`.',
    })
    @IsString()
    @IsOptional()
    mediaId?: string;

    @ApiPropertyOptional({
        example: 'https://example.com/some-image.jpg',
        description: 'A direct media URL to convert. Provide this or `mediaId`.',
    })
    @IsString()
    @IsOptional()
    url?: string;
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

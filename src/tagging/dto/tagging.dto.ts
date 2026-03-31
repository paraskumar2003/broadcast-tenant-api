import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsEnum } from 'class-validator';

export class CreateTagDto {
  @ApiProperty({ example: '6482c4adda0e29b69bfec072' })
  @IsString()
  @IsNotEmpty()
  projectId: string;

  @ApiProperty({ example: 'Marketing' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: '#EF4444' })
  @IsString()
  @IsOptional()
  color?: string;
}

export class UpdateTagDto {
  @ApiPropertyOptional({ example: 'Sale Campaign' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ example: '#10B981' })
  @IsString()
  @IsOptional()
  color?: string;
}

export enum EntityType {
  UPLOAD = 'upload',
  TEMPLATE = 'template',
  CONTACT = 'contact',
}

export class AttachDetachTagDto {
  @ApiProperty({ example: '6482c4adda0e29b69bfec072' })
  @IsString()
  @IsNotEmpty()
  projectId: string;

  @ApiProperty({ example: '6482c4adda0e29b69bfec099' })
  @IsString()
  @IsNotEmpty()
  tagId: string;

  @ApiProperty({ enum: EntityType, example: EntityType.TEMPLATE })
  @IsEnum(EntityType)
  @IsNotEmpty()
  entityType: EntityType;

  @ApiProperty({ description: 'ID of the media/contact or Name of the template', example: 'summer_sale_v1' })
  @IsString()
  @IsNotEmpty()
  entityId: string;
}

import {
  IsString,
  IsArray,
  IsOptional,
  IsObject,
  IsBoolean,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SendSingleDto {
  @ApiProperty({ description: 'Project configuration ID' })
  @IsString()
  projectConfigId: string;

  @ApiProperty({ description: 'Recipient phone number' })
  @IsString()
  number: string;

  @ApiProperty({ description: 'Template JSON (stringified or object)' })
  @IsObject()
  template: Record<string, any>;

  @ApiPropertyOptional({ description: 'Template body parameters' })
  @IsOptional()
  @IsObject()
  params?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Language code', default: 'en_US' })
  @IsOptional()
  @IsString()
  language?: string;

  @ApiPropertyOptional({ description: 'Schedule ISO date (null = immediate)' })
  @IsOptional()
  @IsString()
  scheduledAt?: string;

  @ApiPropertyOptional({
    description: 'Skip broadcast creation — send as a quick message',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  skipBroadcast?: boolean;

  @ApiPropertyOptional({
    description:
      'Broadcast name (auto-generated if empty). Ignored when skipBroadcast is true.',
  })
  @IsOptional()
  @IsString()
  broadcastName?: string;
}

export class SendBulkDto {
  @ApiProperty({ description: 'Project configuration ID' })
  @IsString()
  projectConfigId: string;

  @ApiProperty({ description: 'Template JSON' })
  @IsObject()
  template: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Array of recipient objects with number and params',
  })
  @IsOptional()
  @IsArray()
  recipients?: Array<{
    number: string;
    params?: Record<string, any>;
  }>;

  @ApiPropertyOptional({
    description:
      'Array of tag IDs — all active contacts mapped to these tags will be included (deduplicated)',
  })
  @IsOptional()
  @IsArray()
  tagIds?: string[];

  @ApiPropertyOptional({
    description:
      'Default template parameters applied to all tag-resolved contacts',
  })
  @IsOptional()
  @IsObject()
  params?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Language code', default: 'en_US' })
  @IsOptional()
  @IsString()
  language?: string;

  @ApiPropertyOptional({ description: 'Schedule ISO date' })
  @IsOptional()
  @IsString()
  scheduledAt?: string;

  @ApiPropertyOptional({
    description: 'Skip broadcast creation — send as a quick message',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  skipBroadcast?: boolean;

  @ApiPropertyOptional({
    description:
      'Broadcast name (auto-generated if empty). Ignored when skipBroadcast is true.',
  })
  @IsOptional()
  @IsString()
  broadcastName?: string;
}

export class SendTextDto {
  @ApiProperty({ description: 'Project configuration ID' })
  @IsString()
  projectConfigId: string;

  @ApiProperty({ description: 'Recipient phone number' })
  @IsString()
  number: string;

  @ApiProperty({ description: 'Text message body' })
  @IsString()
  text: string;
}

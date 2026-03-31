import { IsString, IsArray, IsOptional, IsObject } from 'class-validator';
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
}

export class SendBulkDto {
  @ApiProperty({ description: 'Project configuration ID' })
  @IsString()
  projectConfigId: string;

  @ApiProperty({ description: 'Template JSON' })
  @IsObject()
  template: Record<string, any>;

  @ApiProperty({
    description: 'Array of recipient objects with number and params',
  })
  @IsArray()
  recipients: Array<{
    number: string;
    params?: Record<string, any>;
  }>;

  @ApiPropertyOptional({ description: 'Language code', default: 'en_US' })
  @IsOptional()
  @IsString()
  language?: string;

  @ApiPropertyOptional({ description: 'Schedule ISO date' })
  @IsOptional()
  @IsString()
  scheduledAt?: string;
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

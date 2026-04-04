import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsArray,
  IsNumberString,
  IsNumber,
  IsBoolean,
  Min,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';

// ─── Create ───────────────────────────────────────────────────────────────────

export class CreateContactDto {
  @ApiProperty({ example: '6482c4adda0e29b69bfec072' })
  @IsString()
  @IsNotEmpty()
  projectId: string;

  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ example: '+919876543210', description: 'Mobile number (E.164 recommended)' })
  @IsString()
  @IsNotEmpty()
  mobile: string;

  @ApiPropertyOptional({
    type: [String],
    example: ['6482c4adda0e29b69bfec099'],
    description: 'Optional list of tag IDs to attach on creation',
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tagIds?: string[];

  @ApiPropertyOptional({
    type: Object,
    example: { city: 'Mumbai', tier: 'premium' },
    description: 'Free-form metadata',
  })
  @IsOptional()
  metadata?: Record<string, any>;
}

// ─── Update ───────────────────────────────────────────────────────────────────

export class UpdateContactDto {
  @ApiPropertyOptional({ example: 'Jane Doe' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ example: '+911234567890' })
  @IsString()
  @IsOptional()
  mobile?: string;

  @ApiPropertyOptional({ type: Object })
  @IsOptional()
  metadata?: Record<string, any>;

  @ApiPropertyOptional({
    type: [String],
    example: ['6482c4adda0e29b69bfec099'],
    description: 'Tag IDs to attach to the contact',
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  addTagIds?: string[];

  @ApiPropertyOptional({
    type: [String],
    example: ['6482c4adda0e29b69bfec077'],
    description: 'Tag IDs to detach from the contact',
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  removeTagIds?: string[];
}

// ─── List Query ───────────────────────────────────────────────────────────────

export class ListContactsQueryDto {
  @ApiPropertyOptional({
    description: 'Filter contacts by a specific tag ID',
    example: '6482c4adda0e29b69bfec099',
  })
  @IsString()
  @IsOptional()
  tagId?: string;

  @ApiPropertyOptional({
    description: 'Search contacts by name or mobile (case-insensitive, partial match)',
    example: 'John',
  })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filter by active status. true = active only, false = inactive only, omit = all',
    example: true,
  })
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return undefined;
  })
  @IsBoolean()
  @IsOptional()
  active?: boolean;

  @ApiPropertyOptional({ example: 1, default: 1 })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({ example: 20, default: 20 })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @IsOptional()
  limit?: number = 20;
}

// ─── CSV Import Response ───────────────────────────────────────────────────────

export class CsvImportResultDto {
  imported: number;
  skipped: number;
  errors: { row: number; reason: string }[];
}

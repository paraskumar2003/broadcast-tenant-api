import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsArray, IsOptional, IsEnum, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class TemplateDto {
    @ApiProperty({ example: '6482c4adda0e29b69bxxxXXX' })
    @IsString()
    @IsNotEmpty()
    projectId: string;
}

export class CreateTemplateDto {
    @ApiProperty({ example: '6482c4adda0e29b69bxxxXXX', description: 'Project ID to resolve WABA credentials' })
    @IsString()
    @IsNotEmpty()
    projectId: string;

    @ApiProperty({ example: 'order_confirmation_v2', description: 'Template name (lowercase, underscores)' })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({ example: 'en', description: 'Language code' })
    @IsString()
    @IsNotEmpty()
    language: string;

    @ApiProperty({ enum: ['MARKETING', 'UTILITY', 'AUTHENTICATION'], example: 'UTILITY' })
    @IsString()
    @IsNotEmpty()
    category: string;

    @ApiProperty({
        description: 'Template components array (HEADER, BODY, FOOTER, BUTTONS, CAROUSEL)',
        example: [
            {
                type: 'BODY',
                text: 'Dear User,\n\nYour order {{1}} for {{2}} is confirmed.\n\nVisit {{3}} for details.',
                example: { body_text: [['ORD123', 'Product', 'https://example.com']] },
            },
            { type: 'FOOTER', text: 'Thank You' },
        ],
    })
    @IsArray()
    @IsNotEmpty()
    components: any[];

    @ApiPropertyOptional({ example: true })
    @IsOptional()
    allow_category_change?: boolean;
}
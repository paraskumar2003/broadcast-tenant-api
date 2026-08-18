import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class ProjectConfigurationDto {
    @ApiProperty({ example: '6482c4adda0e29b69bfec072' })
    @IsString()
    @IsNotEmpty()
    projectId: string;

    @ApiProperty({ example: '10119541635XXXX' })
    @IsString()
    @IsNotEmpty()
    whatsappBusinessAccountId: string;

    @ApiProperty({ example: '10119541635XXXX' })
    @IsString()
    @IsNotEmpty()
    phoneNumberId: string;

    @ApiProperty({ example: '9199999999' })
    @IsString()
    @IsNotEmpty()
    phoneNumber: string;

    @ApiProperty({ example: 'EAAV6N3zZAtGUBAN5z9LrJ0FrZ....' })
    @IsString()
    @IsNotEmpty()
    accessToken: string;

    @ApiProperty({ example: 'https://example.com/logo.png' })
    @IsString()
    @IsNotEmpty()
    logo: string;

    @ApiPropertyOptional({
        example: '1234567890123456',
        description:
            'Meta App ID (from developers.facebook.com) — required to generate template header media handles via the Resumable Upload API.',
    })
    @IsString()
    @IsOptional()
    metaAppId?: string;
}
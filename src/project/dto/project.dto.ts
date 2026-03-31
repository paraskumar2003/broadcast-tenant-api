import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class ProjectDto {
    @ApiProperty({ example: '9199999999' })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({ example: 'password123' })
    @IsString()
    @IsNotEmpty()
    slug: string;
}
import { IsOptional, IsString } from 'class-validator';

export class ApiResponseDto<T = any> {
  status: boolean;
  message: string;

  @IsOptional()
  data?: T;

  @IsOptional()
  @IsString()
  error?: string;

  constructor(partial: Partial<ApiResponseDto<T>>) {
    Object.assign(this, partial);
  }

  static success<T>(message: string, data?: T): ApiResponseDto<T> {
    return new ApiResponseDto({ status: true, message, data });
  }

  static error(message: string, error?: string): ApiResponseDto {
    return new ApiResponseDto({ status: false, message, error });
  }
}

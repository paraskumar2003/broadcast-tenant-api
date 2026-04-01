export declare class ApiResponseDto<T = any> {
    status: boolean;
    message: string;
    data?: T;
    error?: string;
    constructor(partial: Partial<ApiResponseDto<T>>);
    static success<T>(message: string, data?: T): ApiResponseDto<T>;
    static error(message: string, error?: string): ApiResponseDto;
}

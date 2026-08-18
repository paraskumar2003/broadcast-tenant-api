import { ApiResponseDto } from '../common/dto/api-response.dto';
import { MediaService } from './media.service';
import { PresignMediaDto, ConfirmMediaDto, UpdateMediaDto, MetaHandleDto } from './dto/media.dto';
export declare class MediaController {
    private readonly mediaService;
    constructor(mediaService: MediaService);
    presign(dto: PresignMediaDto): Promise<ApiResponseDto<{
        uploadUrl: string;
        key: string;
    }>>;
    confirm(dto: ConfirmMediaDto): Promise<ApiResponseDto<any>>;
    listByProject(projectId: string): Promise<ApiResponseDto<any[]>>;
    getMetaHandle(dto: MetaHandleDto): Promise<ApiResponseDto<{
        handle: string;
        url: string;
        contentType: string;
    }>>;
    getById(id: string): Promise<ApiResponseDto<any>>;
    update(id: string, dto: UpdateMediaDto): Promise<ApiResponseDto<any>>;
    delete(id: string): Promise<ApiResponseDto<unknown>>;
}

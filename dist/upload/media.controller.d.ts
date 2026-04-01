import { ApiResponseDto } from '../common/dto/api-response.dto';
import { MediaService } from './media.service';
import { CreateMediaDto, UpdateMediaDto } from './dto/media.dto';
export declare class MediaController {
    private readonly mediaService;
    constructor(mediaService: MediaService);
    uploadSingle(file: Express.MulterS3.File, body: CreateMediaDto): Promise<ApiResponseDto<import("./schemas/media.schema").MediaDocument>>;
    uploadMultiple(files: Express.MulterS3.File[], body: CreateMediaDto): Promise<ApiResponseDto<import("./schemas/media.schema").MediaDocument[]>>;
    listByProject(projectId: string): Promise<ApiResponseDto<any[]>>;
    getById(id: string): Promise<ApiResponseDto<import("./schemas/media.schema").MediaDocument>>;
    update(id: string, dto: UpdateMediaDto): Promise<ApiResponseDto<import("./schemas/media.schema").MediaDocument>>;
    delete(id: string): Promise<ApiResponseDto<unknown>>;
}

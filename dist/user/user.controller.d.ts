import { UserService } from './user.service';
import { ApiResponseDto } from '../common/dto/api-response.dto';
import { CreateUserDto, GrantAccessDto } from './dto/user.dto';
export declare class UserController {
    private readonly userService;
    constructor(userService: UserService);
    create(dto: CreateUserDto, user: any): Promise<ApiResponseDto<any>>;
    list(user: any): Promise<ApiResponseDto<(import("mongoose").Document<unknown, {}, import("./schemas/user.schema").UserDocument, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/user.schema").User & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>>;
    getById(id: string): Promise<ApiResponseDto<import("mongoose").Document<unknown, {}, import("./schemas/user.schema").UserDocument, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/user.schema").User & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>>;
    update(id: string, body: {
        name?: string;
        status?: string;
    }): Promise<ApiResponseDto<(import("mongoose").Document<unknown, {}, import("./schemas/user.schema").UserDocument, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/user.schema").User & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }) | null>>;
    delete(id: string): Promise<ApiResponseDto<unknown>>;
    grantAccess(dto: GrantAccessDto, user: any): Promise<ApiResponseDto<import("mongoose").Document<unknown, {}, import("./schemas/user-project-access.schema").UserProjectAccessDocument, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/user-project-access.schema").UserProjectAccess & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>>;
    revokeAccess(dto: GrantAccessDto): Promise<ApiResponseDto<unknown>>;
    listAccess(userId: string): Promise<ApiResponseDto<(import("mongoose").Document<unknown, {}, import("./schemas/user-project-access.schema").UserProjectAccessDocument, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/user-project-access.schema").UserProjectAccess & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>>;
}

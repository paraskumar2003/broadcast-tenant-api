"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportingModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const reporting_service_1 = require("./reporting.service");
const reporting_controller_1 = require("./reporting.controller");
const message_schema_1 = require("../messaging/schemas/message.schema");
const message_session_schema_1 = require("../messaging/schemas/message-session.schema");
const delivery_status_schema_1 = require("../webhook/schemas/delivery-status.schema");
let ReportingModule = class ReportingModule {
};
exports.ReportingModule = ReportingModule;
exports.ReportingModule = ReportingModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: message_schema_1.Message.name, schema: message_schema_1.MessageSchema },
                { name: message_session_schema_1.MessageSession.name, schema: message_session_schema_1.MessageSessionSchema },
                { name: delivery_status_schema_1.DeliveryStatus.name, schema: delivery_status_schema_1.DeliveryStatusSchema },
            ]),
        ],
        providers: [reporting_service_1.ReportingService],
        controllers: [reporting_controller_1.ReportingController],
    })
], ReportingModule);
//# sourceMappingURL=reporting.module.js.map
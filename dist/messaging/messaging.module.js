"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessagingModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const messaging_service_1 = require("./messaging.service");
const messaging_controller_1 = require("./messaging.controller");
const messaging_consumer_1 = require("./messaging.consumer");
const template_builder_service_1 = require("./template-builder.service");
const message_schema_1 = require("./schemas/message.schema");
const message_session_schema_1 = require("./schemas/message-session.schema");
const contact_schema_1 = require("../contact/schemas/contact.schema");
const meta_api_module_1 = require("../meta-api/meta-api.module");
const project_module_1 = require("../project/project.module");
const tagging_module_1 = require("../tagging/tagging.module");
let MessagingModule = class MessagingModule {
};
exports.MessagingModule = MessagingModule;
exports.MessagingModule = MessagingModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: message_schema_1.Message.name, schema: message_schema_1.MessageSchema },
                { name: message_session_schema_1.MessageSession.name, schema: message_session_schema_1.MessageSessionSchema },
                { name: contact_schema_1.Contact.name, schema: contact_schema_1.ContactSchema },
            ]),
            meta_api_module_1.MetaApiModule,
            project_module_1.ProjectModule,
            tagging_module_1.TaggingModule,
        ],
        providers: [messaging_service_1.MessagingService, messaging_consumer_1.MessagingConsumer, template_builder_service_1.TemplateBuilderService],
        controllers: [messaging_controller_1.MessagingController],
        exports: [messaging_service_1.MessagingService],
    })
], MessagingModule);
//# sourceMappingURL=messaging.module.js.map
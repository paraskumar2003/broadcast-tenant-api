"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhookModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const webhook_controller_1 = require("./webhook.controller");
const webhook_service_1 = require("./webhook.service");
const webhook_consumer_1 = require("./webhook.consumer");
const delivery_status_schema_1 = require("./schemas/delivery-status.schema");
const message_schema_1 = require("../messaging/schemas/message.schema");
const message_session_schema_1 = require("../messaging/schemas/message-session.schema");
const contact_schema_1 = require("../contact/schemas/contact.schema");
const conversation_module_1 = require("../conversation/conversation.module");
const project_module_1 = require("../project/project.module");
const broadcast_schema_1 = require("../messaging/schemas/broadcast.schema");
let WebhookModule = class WebhookModule {
};
exports.WebhookModule = WebhookModule;
exports.WebhookModule = WebhookModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: delivery_status_schema_1.DeliveryStatus.name, schema: delivery_status_schema_1.DeliveryStatusSchema },
                { name: message_schema_1.Message.name, schema: message_schema_1.MessageSchema },
                { name: message_session_schema_1.MessageSession.name, schema: message_session_schema_1.MessageSessionSchema },
                { name: contact_schema_1.Contact.name, schema: contact_schema_1.ContactSchema },
                { name: broadcast_schema_1.Broadcast.name, schema: broadcast_schema_1.BroadcastSchema },
            ]),
            conversation_module_1.ConversationModule,
            project_module_1.ProjectModule,
        ],
        controllers: [webhook_controller_1.WebhookController],
        providers: [webhook_service_1.WebhookService, webhook_consumer_1.WebhookConsumer],
        exports: [webhook_service_1.WebhookService],
    })
], WebhookModule);
//# sourceMappingURL=webhook.module.js.map
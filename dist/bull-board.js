"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createBullBoardServer = createBullBoardServer;
const api_1 = require("@bull-board/api");
const bullMQAdapter_1 = require("@bull-board/api/bullMQAdapter");
const express_1 = require("@bull-board/express");
function createBullBoardServer(queues) {
    const serverAdapter = new express_1.ExpressAdapter();
    serverAdapter.setBasePath('/admin/queues');
    (0, api_1.createBullBoard)({
        queues: queues.map((q) => new bullMQAdapter_1.BullMQAdapter(q)),
        serverAdapter,
    });
    return serverAdapter;
}
//# sourceMappingURL=bull-board.js.map
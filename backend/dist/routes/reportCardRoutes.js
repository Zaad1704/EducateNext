"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const reportCardController_1 = require("../controllers/reportCardController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
router.post('/', authMiddleware_1.protect, (0, authMiddleware_1.authorize)(['Teacher', 'Administrator']), reportCardController_1.createReportCard);
router.post('/bulk', authMiddleware_1.protect, (0, authMiddleware_1.authorize)(['Administrator']), reportCardController_1.bulkGenerateReports);
router.get('/', authMiddleware_1.protect, reportCardController_1.getReportCards);
router.put('/:reportCardId/publish', authMiddleware_1.protect, (0, authMiddleware_1.authorize)(['Administrator']), reportCardController_1.publishReportCard);
exports.default = router;

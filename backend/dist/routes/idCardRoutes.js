"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const idCardController_1 = require("../controllers/idCardController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
router.post('/', authMiddleware_1.protect, (0, authMiddleware_1.authorize)(['Administrator', 'Teacher']), idCardController_1.createIDCard);
router.post('/bulk', authMiddleware_1.protect, (0, authMiddleware_1.authorize)(['Administrator']), idCardController_1.bulkGenerateCards);
router.get('/:userId', authMiddleware_1.protect, idCardController_1.getIDCard);
router.get('/:cardId/download', authMiddleware_1.protect, idCardController_1.downloadIDCard);
router.post('/:cardId/wallet', authMiddleware_1.protect, idCardController_1.addToWallet);
router.put('/:cardId/print-status', authMiddleware_1.protect, (0, authMiddleware_1.authorize)(['Administrator']), idCardController_1.updatePrintStatus);
exports.default = router;

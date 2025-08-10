"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const evaluationController_1 = require("../controllers/evaluationController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
router.post('/', authMiddleware_1.protect, (0, authMiddleware_1.authorize)(['Administrator', 'Teacher']), evaluationController_1.createEvaluation);
router.get('/', authMiddleware_1.protect, (0, authMiddleware_1.authorize)(['Administrator', 'Teacher']), evaluationController_1.getEvaluations);
router.put('/:evaluationId/finalize', authMiddleware_1.protect, (0, authMiddleware_1.authorize)(['Administrator']), evaluationController_1.finalizeEvaluation);
exports.default = router;

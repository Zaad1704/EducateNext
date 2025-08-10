"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const assignmentController_1 = require("../controllers/assignmentController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
router.post('/', authMiddleware_1.protect, (0, authMiddleware_1.authorize)(['Teacher', 'Administrator']), assignmentController_1.createAssignment);
router.get('/', authMiddleware_1.protect, assignmentController_1.getAssignments);
router.post('/:assignmentId/submit', authMiddleware_1.protect, (0, authMiddleware_1.authorize)(['Student']), assignmentController_1.submitAssignment);
exports.default = router;

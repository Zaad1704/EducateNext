"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const attendanceSessionController_1 = require("../controllers/attendanceSessionController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
router.post('/start', authMiddleware_1.protect, (0, authMiddleware_1.authorize)(['Teacher', 'Administrator']), attendanceSessionController_1.startAttendanceSession);
router.put('/:sessionId/end', authMiddleware_1.protect, (0, authMiddleware_1.authorize)(['Teacher', 'Administrator']), attendanceSessionController_1.endAttendanceSession);
router.post('/scan', authMiddleware_1.protect, (0, authMiddleware_1.authorize)(['Teacher', 'Administrator']), attendanceSessionController_1.scanQRAttendance);
router.get('/active', authMiddleware_1.protect, (0, authMiddleware_1.authorize)(['Teacher', 'Administrator']), attendanceSessionController_1.getActiveSessions);
router.get('/history', authMiddleware_1.protect, (0, authMiddleware_1.authorize)(['Teacher', 'Administrator']), attendanceSessionController_1.getSessionHistory);
exports.default = router;

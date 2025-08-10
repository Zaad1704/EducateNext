"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const analyticsController_1 = require("../controllers/analyticsController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
router.get('/dashboard', authMiddleware_1.protect, (0, authMiddleware_1.authorize)(['Administrator', 'Teacher']), analyticsController_1.getDashboardAnalytics);
router.post('/reports', authMiddleware_1.protect, (0, authMiddleware_1.authorize)(['Administrator']), analyticsController_1.generateAnalyticsReport);
router.get('/trends', authMiddleware_1.protect, (0, authMiddleware_1.authorize)(['Administrator', 'Teacher']), analyticsController_1.getPerformanceTrends);
router.get('/alerts', authMiddleware_1.protect, analyticsController_1.getAlerts);
router.put('/alerts/:alertId/resolve', authMiddleware_1.protect, (0, authMiddleware_1.authorize)(['Administrator']), analyticsController_1.resolveAlert);
exports.default = router;

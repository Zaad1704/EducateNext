"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cmsController_1 = require("../controllers/cmsController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
// Protected routes (require authentication)
router.post('/sites', authMiddleware_1.protect, (0, authMiddleware_1.authorize)(['Administrator']), cmsController_1.createSite);
router.get('/sites', authMiddleware_1.protect, cmsController_1.getSite);
router.put('/sites', authMiddleware_1.protect, (0, authMiddleware_1.authorize)(['Administrator', 'Website Manager']), cmsController_1.updateSite);
router.post('/sites/publish', authMiddleware_1.protect, (0, authMiddleware_1.authorize)(['Administrator']), cmsController_1.publishSite);
router.post('/sites/sync-staff', authMiddleware_1.protect, (0, authMiddleware_1.authorize)(['Administrator', 'Website Manager']), cmsController_1.syncStaffData);
// Public routes (no authentication required)
router.get('/public/:domain', cmsController_1.getPublicSite);
exports.default = router;

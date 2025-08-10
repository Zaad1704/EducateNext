"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const teacherMonitoringController_1 = require("../controllers/teacherMonitoringController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const rbac_1 = require("../middleware/rbac");
const router = express_1.default.Router();
// Apply authentication middleware to all routes
router.use(authMiddleware_1.authenticateToken);
// Get teacher monitoring data (Admin, Principal, Incharge)
router.get('/data', (0, rbac_1.checkRole)(['admin', 'principal', 'incharge']), teacherMonitoringController_1.getTeacherMonitoringData);
// Get real-time teacher activity (Admin, Principal, Incharge)
router.get('/realtime/:institutionId', (0, rbac_1.checkRole)(['admin', 'principal', 'incharge']), teacherMonitoringController_1.getRealTimeTeacherActivity);
// Update teacher location (Teacher - from mobile app)
router.post('/location', (0, rbac_1.checkRole)(['teacher']), teacherMonitoringController_1.updateTeacherLocation);
// Update device activity (Teacher - from mobile app)
router.post('/device-activity', (0, rbac_1.checkRole)(['teacher']), teacherMonitoringController_1.updateDeviceActivity);
// Mark teacher attendance (Teacher, Admin)
router.post('/attendance', (0, rbac_1.checkRole)(['teacher', 'admin']), teacherMonitoringController_1.markTeacherAttendance);
// Resolve alerts (Admin, Principal, Incharge)
router.post('/resolve-alert', (0, rbac_1.checkRole)(['admin', 'principal', 'incharge']), teacherMonitoringController_1.resolveAlert);
// Get teacher performance analytics (Admin, Principal, Incharge)
router.get('/analytics', (0, rbac_1.checkRole)(['admin', 'principal', 'incharge']), teacherMonitoringController_1.getTeacherPerformanceAnalytics);
// Update monitoring settings (Teacher, Admin)
router.put('/settings', (0, rbac_1.checkRole)(['teacher', 'admin']), teacherMonitoringController_1.updateMonitoringSettings);
exports.default = router;

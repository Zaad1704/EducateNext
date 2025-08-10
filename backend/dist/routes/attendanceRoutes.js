"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// backend/routes/attendanceRoutes.ts
const express_1 = require("express");
const attendanceController_1 = require("../controllers/attendanceController");
const authMiddleware_1 = require("../middleware/authMiddleware"); // Import authMiddleware
const rbac_1 = require("../middleware/rbac"); // Import authorize middleware
const router = (0, express_1.Router)();
// Route to mark attendance: requires authentication and either 'Teacher' or 'Administrator' role
router.post('/', authMiddleware_1.authMiddleware, (0, rbac_1.authorize)(['Teacher', 'Administrator']), attendanceController_1.markAttendance);
// Route to get attendance: requires authentication (no specific role check here, adjust as needed)
router.get('/', authMiddleware_1.authMiddleware, attendanceController_1.getAttendance);
exports.default = router;

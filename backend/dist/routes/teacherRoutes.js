"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// backend/routes/teacherRoutes.ts
const express_1 = require("express");
const teacherController_1 = require("../controllers/teacherController");
const authMiddleware_1 = require("../middleware/authMiddleware"); // Import authMiddleware
const router = (0, express_1.Router)();
router.post('/', authMiddleware_1.authMiddleware, teacherController_1.addTeacher); // Protect addTeacher
router.get('/', authMiddleware_1.authMiddleware, teacherController_1.listTeachers); // Protect listTeachers
exports.default = router;

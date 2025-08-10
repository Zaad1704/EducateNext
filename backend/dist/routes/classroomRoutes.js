"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// backend/routes/classroomRoutes.ts
const express_1 = require("express");
const classroomController_1 = require("../controllers/classroomController");
const authMiddleware_1 = require("../middleware/authMiddleware"); // Import authMiddleware
const router = (0, express_1.Router)();
router.post('/', authMiddleware_1.authMiddleware, classroomController_1.createClassroom); // Protect createClassroom
router.get('/', authMiddleware_1.authMiddleware, classroomController_1.listClassrooms); // Protect listClassrooms
exports.default = router;

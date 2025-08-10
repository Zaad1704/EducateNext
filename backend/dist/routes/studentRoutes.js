"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// backend/routes/studentRoutes.ts
const express_1 = require("express");
const studentController_1 = require("../controllers/studentController");
const authMiddleware_1 = require("../middleware/authMiddleware"); // Import authMiddleware
const router = (0, express_1.Router)();
router.post('/', authMiddleware_1.authMiddleware, studentController_1.addStudent); // Protect addStudent
router.get('/', authMiddleware_1.authMiddleware, studentController_1.listStudents); // Protect listStudents
exports.default = router;

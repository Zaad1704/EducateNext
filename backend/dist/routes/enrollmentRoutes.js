"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// backend/routes/enrollmentRoutes.ts
const express_1 = require("express");
const enrollmentController_1 = require("../controllers/enrollmentController");
const authMiddleware_1 = require("../middleware/authMiddleware"); // Import authMiddleware
const router = (0, express_1.Router)();
router.post('/', authMiddleware_1.authMiddleware, enrollmentController_1.enrollStudent); // Protect enrollStudent
router.get('/', authMiddleware_1.authMiddleware, enrollmentController_1.listEnrollments); // Protect listEnrollments
exports.default = router;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// backend/routes/subjectRoutes.ts
const express_1 = require("express");
const subjectController_1 = require("../controllers/subjectController");
const authMiddleware_1 = require("../middleware/authMiddleware"); // Import authMiddleware
const router = (0, express_1.Router)();
router.post('/', authMiddleware_1.authMiddleware, subjectController_1.createSubject); // Protect createSubject
router.get('/', authMiddleware_1.authMiddleware, subjectController_1.listSubjects); // Protect listSubjects
exports.default = router;

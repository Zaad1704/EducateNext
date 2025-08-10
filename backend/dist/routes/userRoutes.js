"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// backend/routes/userRoutes.ts
const express_1 = require("express");
const userController_1 = require("../controllers/userController");
const authMiddleware_1 = require("../middleware/authMiddleware"); // Import authMiddleware
const router = (0, express_1.Router)();
router.get('/', authMiddleware_1.authMiddleware, userController_1.getUsers); // Apply authMiddleware here
exports.default = router;

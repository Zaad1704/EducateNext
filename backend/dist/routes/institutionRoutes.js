"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// backend/routes/institutionRoutes.ts
const express_1 = require("express");
const institutionController_1 = require("../controllers/institutionController");
const authMiddleware_1 = require("../middleware/authMiddleware"); // Import authMiddleware
const rbac_1 = require("../middleware/rbac"); // Import authorize middleware
const router = (0, express_1.Router)();
// Route to create an institution: requires authentication and Administrator role
router.post('/', authMiddleware_1.authMiddleware, (0, rbac_1.authorize)(['Administrator']), institutionController_1.createInstitution);
// Route to get institutions: requires authentication (no specific role check here, adjust as needed)
router.get('/', authMiddleware_1.authMiddleware, institutionController_1.getInstitutions);
exports.default = router;

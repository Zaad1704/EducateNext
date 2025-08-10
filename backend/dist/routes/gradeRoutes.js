"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const gradeController_1 = require("../controllers/gradeController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
router.post('/', authMiddleware_1.protect, (0, authMiddleware_1.authorize)(['Teacher', 'Administrator']), gradeController_1.createGrade);
router.post('/bulk', authMiddleware_1.protect, (0, authMiddleware_1.authorize)(['Teacher', 'Administrator']), gradeController_1.bulkCreateGrades);
router.get('/student/:studentId', authMiddleware_1.protect, gradeController_1.getStudentGrades);
router.get('/class/:classroomId', authMiddleware_1.protect, (0, authMiddleware_1.authorize)(['Teacher', 'Administrator']), gradeController_1.getClassGrades);
router.post('/publish', authMiddleware_1.protect, (0, authMiddleware_1.authorize)(['Teacher', 'Administrator']), gradeController_1.publishGrades);
router.get('/gpa/:studentId', authMiddleware_1.protect, gradeController_1.calculateStudentGPA);
exports.default = router;

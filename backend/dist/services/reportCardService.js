"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateReportCard = void 0;
const Grade_1 = __importDefault(require("../models/Grade"));
const ReportCard_1 = __importDefault(require("../models/ReportCard"));
const AttendanceRecord_1 = __importDefault(require("../models/AttendanceRecord"));
const Student_1 = __importDefault(require("../models/Student"));
const mongoose_1 = require("mongoose");
const gradingService_1 = require("./gradingService");
const generateReportCard = async (studentId, academicYear, semester, institutionId) => {
    try {
        // Get student info
        const student = await Student_1.default.findById(studentId).populate('classroomId');
        if (!student)
            throw new Error('Student not found');
        // Get all grades for the period
        const grades = await Grade_1.default.find({
            studentId: new mongoose_1.Types.ObjectId(studentId),
            academicYear,
            semester,
            institutionId: new mongoose_1.Types.ObjectId(institutionId),
            isPublished: true,
        }).populate('subjectId teacherId');
        // Group grades by subject
        const subjectGrades = grades.reduce((acc, grade) => {
            const subjectId = grade.subjectId._id.toString();
            if (!acc[subjectId]) {
                acc[subjectId] = {
                    subjectId: grade.subjectId._id,
                    teacherId: grade.teacherId._id,
                    grades: [],
                    totalMarks: 0,
                    obtainedMarks: 0,
                };
            }
            acc[subjectId].grades.push(grade._id);
            acc[subjectId].totalMarks += grade.maxMarks;
            acc[subjectId].obtainedMarks += grade.obtainedMarks;
            return acc;
        }, {});
        // Calculate subject-wise performance
        const subjects = Object.values(subjectGrades).map((subject) => {
            const percentage = (subject.obtainedMarks / subject.totalMarks) * 100;
            const grade = (0, gradingService_1.calculateGrade)(percentage);
            const gpa = (0, gradingService_1.calculateWeightedGPA)(subject.grades.map((g) => ({ gpa: g.gpa, weightage: g.weightage })));
            return {
                ...subject,
                percentage: Math.round(percentage * 100) / 100,
                grade,
                gpa: Math.round(gpa * 100) / 100,
                remarks: getSubjectRemarks(percentage),
            };
        });
        // Calculate overall performance
        const overallPercentage = subjects.reduce((sum, sub) => sum + sub.percentage, 0) / subjects.length;
        const overallGPA = subjects.reduce((sum, sub) => sum + sub.gpa, 0) / subjects.length;
        const overallGrade = (0, gradingService_1.calculateGrade)(overallPercentage);
        // Get attendance data
        const attendanceRecords = await AttendanceRecord_1.default.find({
            studentId: new mongoose_1.Types.ObjectId(studentId),
            institutionId: new mongoose_1.Types.ObjectId(institutionId),
            date: {
                $gte: getAcademicYearStart(academicYear),
                $lte: getAcademicYearEnd(academicYear),
            },
        });
        const totalDays = attendanceRecords.length;
        const presentDays = attendanceRecords.filter(record => record.status === 'present').length;
        const attendancePercentage = totalDays > 0 ? (presentDays / totalDays) * 100 : 0;
        // Calculate rank (simplified - would need more complex logic for actual ranking)
        const classStudents = await Student_1.default.find({ classroomId: student.classroomId });
        const rank = await calculateStudentRank(studentId, overallGPA, academicYear, semester);
        // Create report card
        const reportCard = new ReportCard_1.default({
            studentId: new mongoose_1.Types.ObjectId(studentId),
            institutionId: new mongoose_1.Types.ObjectId(institutionId),
            classroomId: student.classroomId,
            academicYear,
            semester,
            subjects,
            overallGPA: Math.round(overallGPA * 100) / 100,
            overallPercentage: Math.round(overallPercentage * 100) / 100,
            overallGrade,
            rank,
            totalStudents: classStudents.length,
            attendance: {
                totalDays,
                presentDays,
                percentage: Math.round(attendancePercentage * 100) / 100,
            },
            teacherRemarks: generateTeacherRemarks(overallPercentage, attendancePercentage),
            principalRemarks: '',
            nextTermBegins: getNextTermDate(academicYear, semester),
            isPublished: false,
            generatedAt: new Date(),
            template: 'standard',
        });
        await reportCard.save();
        return reportCard;
    }
    catch (error) {
        console.error('Error generating report card:', error);
        throw error;
    }
};
exports.generateReportCard = generateReportCard;
const getSubjectRemarks = (percentage) => {
    if (percentage >= 90)
        return 'Outstanding performance';
    if (percentage >= 80)
        return 'Excellent work';
    if (percentage >= 70)
        return 'Good progress';
    if (percentage >= 60)
        return 'Satisfactory';
    if (percentage >= 50)
        return 'Needs improvement';
    return 'Requires attention';
};
const generateTeacherRemarks = (academicPercentage, attendancePercentage) => {
    let remarks = [];
    if (academicPercentage >= 85)
        remarks.push('Excellent academic performance');
    else if (academicPercentage >= 70)
        remarks.push('Good academic progress');
    else if (academicPercentage < 60)
        remarks.push('Needs academic support');
    if (attendancePercentage >= 95)
        remarks.push('Perfect attendance');
    else if (attendancePercentage >= 85)
        remarks.push('Good attendance');
    else if (attendancePercentage < 75)
        remarks.push('Improve attendance');
    return remarks.join('. ') + '.';
};
const calculateStudentRank = async (studentId, gpa, academicYear, semester) => {
    // Simplified ranking - in real implementation, would calculate based on all students' GPAs
    return Math.floor(Math.random() * 10) + 1; // Placeholder
};
const getAcademicYearStart = (academicYear) => {
    const year = parseInt(academicYear.split('-')[0]);
    return new Date(year, 3, 1); // April 1st
};
const getAcademicYearEnd = (academicYear) => {
    const year = parseInt(academicYear.split('-')[1]);
    return new Date(year, 2, 31); // March 31st
};
const getNextTermDate = (academicYear, semester) => {
    const year = parseInt(academicYear.split('-')[0]);
    if (semester === 'first') {
        return new Date(year, 9, 1); // October 1st for second semester
    }
    return new Date(year + 1, 3, 1); // April 1st for next academic year
};

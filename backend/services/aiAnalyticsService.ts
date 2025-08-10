import AttendanceRecord from '../models/AttendanceRecord';
import Grade from '../models/Grade';
import Student from '../models/Student';
import { logger } from '../utils/logger';

export class AIAnalyticsService {
  // Predict student performance
  static async predictPerformance(studentId: string) {
    const grades = await Grade.find({ studentId }).sort({ createdAt: -1 }).limit(10);
    const attendance = await AttendanceRecord.find({ studentId }).sort({ date: -1 }).limit(30);
    
    const avgGrade = grades.reduce((sum, g) => sum + g.score, 0) / grades.length || 0;
    const attendanceRate = attendance.filter(a => a.status === 'present').length / attendance.length || 0;
    
    // Simple prediction algorithm
    const performanceScore = (avgGrade * 0.7) + (attendanceRate * 100 * 0.3);
    const trend = grades.length >= 2 ? 
      (grades[0].score - grades[grades.length - 1].score) > 0 ? 'improving' : 'declining' : 'stable';

    return {
      currentPerformance: performanceScore,
      trend,
      riskLevel: performanceScore < 60 ? 'high' : performanceScore < 80 ? 'medium' : 'low',
      recommendations: this.generateRecommendations(performanceScore, attendanceRate)
    };
  }

  // Generate insights for institution
  static async generateInstitutionInsights(institutionId: string) {
    const students = await Student.find({ institutionId });
    const totalStudents = students.length;
    
    const performanceData = await Promise.all(
      students.slice(0, 100).map(s => this.predictPerformance(s._id.toString()))
    );

    const avgPerformance = performanceData.reduce((sum, p) => sum + p.currentPerformance, 0) / performanceData.length;
    const riskDistribution = performanceData.reduce((acc, p) => {
      acc[p.riskLevel] = (acc[p.riskLevel] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalStudents,
      averagePerformance: Math.round(avgPerformance),
      riskDistribution,
      trends: {
        improving: performanceData.filter(p => p.trend === 'improving').length,
        declining: performanceData.filter(p => p.trend === 'declining').length,
        stable: performanceData.filter(p => p.trend === 'stable').length
      },
      generatedAt: new Date()
    };
  }

  // Attendance pattern analysis
  static async analyzeAttendancePatterns(institutionId: string) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const attendanceData = await AttendanceRecord.aggregate([
      { $match: { institutionId, date: { $gte: thirtyDaysAgo } } },
      { $group: {
        _id: { $dayOfWeek: '$date' },
        total: { $sum: 1 },
        present: { $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] } }
      }},
      { $project: {
        dayOfWeek: '$_id',
        attendanceRate: { $multiply: [{ $divide: ['$present', '$total'] }, 100] }
      }}
    ]);

    return {
      weeklyPatterns: attendanceData,
      insights: this.generateAttendanceInsights(attendanceData)
    };
  }

  private static generateRecommendations(performance: number, attendance: number): string[] {
    const recommendations = [];
    
    if (performance < 60) recommendations.push('Schedule additional tutoring sessions');
    if (attendance < 0.8) recommendations.push('Implement attendance improvement plan');
    if (performance < 70 && attendance > 0.9) recommendations.push('Focus on learning methodology');
    
    return recommendations;
  }

  private static generateAttendanceInsights(data: any[]): string[] {
    const insights = [];
    const lowestDay = data.reduce((min, day) => day.attendanceRate < min.attendanceRate ? day : min, data[0]);
    
    if (lowestDay?.attendanceRate < 80) {
      insights.push(`Attendance is lowest on ${this.getDayName(lowestDay.dayOfWeek)}`);
    }
    
    return insights;
  }

  private static getDayName(dayNum: number): string {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[dayNum - 1] || 'Unknown';
  }
}
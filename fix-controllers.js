const fs = require('fs');
const path = require('path');

// Function to fix controller files
function fixControllerFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Fix missing return statements in catch blocks
  content = content.replace(
    /(\s+} catch \(error: any\) \{[^}]*console\.error\([^}]*\);\s*)(res\.status\([^)]*\)\.json\([^)]*\));/g,
    '$1return $2;'
  );
  
  // Fix missing return statements in if blocks
  content = content.replace(
    /(\s+if \([^)]*\) \{[^}]*return res\.status\([^)]*\)\.json\([^)]*\);\s*\})/g,
    '$1'
  );
  
  // Fix JWT sign callbacks
  content = content.replace(
    /(\s+jwt\.sign\([^}]*\(err, token\) => \{[^}]*if \(err\) throw err;\s*)(res\.[^}]*\);\s*\})/g,
    '$1if (err) {\n$1        console.error(\'JWT signing error:\', err);\n$1        return res.status(500).json({ message: \'Error generating token\' });\n$1      }\n$1      return $2'
  );
  
  // Fix undefined parameter issues
  content = content.replace(
    /(\w+): string \| undefined/g,
    '$1: string'
  );
  
  // Add null checks for undefined parameters
  content = content.replace(
    /(\w+)(\s*=\s*req\.user\?\.\w+);/g,
    'const $1 = $2; if (!$1) { return res.status(401).json({ message: \'Not authorized\' }); }'
  );
  
  fs.writeFileSync(filePath, content);
  console.log(`Fixed: ${filePath}`);
}

// List of controller files to fix
const controllerFiles = [
  'controllers/analyticsController.ts',
  'controllers/assignmentController.ts',
  'controllers/attendanceController.ts',
  'controllers/attendanceSessionController.ts',
  'controllers/classroomController.ts',
  'controllers/cmsController.ts',
  'controllers/enrollmentController.ts',
  'controllers/evaluationController.ts',
  'controllers/expenseController.ts',
  'controllers/feeController.ts',
  'controllers/gradeController.ts',
  'controllers/idCardController.ts',
  'controllers/institutionController.ts',
  'controllers/paymentController.ts',
  'controllers/qrController.ts',
  'controllers/reportCardController.ts',
  'controllers/studentController.ts',
  'controllers/subjectController.ts',
  'controllers/teacherController.ts',
  'controllers/teacherMonitoringController.ts'
];

// Fix each controller file
controllerFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    fixControllerFile(filePath);
  } else {
    console.log(`File not found: ${filePath}`);
  }
});

console.log('Controller fixes completed!');

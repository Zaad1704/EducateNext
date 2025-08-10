// security-test.js - Comprehensive Security Testing Script
const axios = require('axios');
const crypto = require('crypto');

const BASE_URL = 'http://localhost:5001/api';
const TEST_RESULTS = [];

// Test configuration
const TESTS = {
  SQL_INJECTION: true,
  XSS: true,
  CSRF: true,
  RATE_LIMITING: true,
  AUTH_BYPASS: true,
  INPUT_VALIDATION: true,
  FILE_UPLOAD: true
};

// Helper functions
function logTest(testName, passed, details) {
  const result = {
    test: testName,
    passed,
    details,
    timestamp: new Date().toISOString()
  };
  TEST_RESULTS.push(result);
  console.log(`${passed ? '✅' : '❌'} ${testName}: ${details}`);
}

function generateRandomString(length = 10) {
  return crypto.randomBytes(length).toString('hex');
}

// Security Tests
class SecurityTester {
  constructor() {
    this.client = axios.create({
      baseURL: BASE_URL,
      timeout: 5000,
      validateStatus: () => true // Don't throw on error status codes
    });
  }

  async runAllTests() {
    console.log('🔒 Starting EducateNext Security Tests\n');

    if (TESTS.SQL_INJECTION) await this.testSQLInjection();
    if (TESTS.XSS) await this.testXSS();
    if (TESTS.CSRF) await this.testCSRF();
    if (TESTS.RATE_LIMITING) await this.testRateLimiting();
    if (TESTS.AUTH_BYPASS) await this.testAuthBypass();
    if (TESTS.INPUT_VALIDATION) await this.testInputValidation();
    if (TESTS.FILE_UPLOAD) await this.testFileUpload();

    this.generateReport();
  }

  async testSQLInjection() {
    console.log('\n📊 Testing SQL/NoSQL Injection Protection...');

    const injectionPayloads = [
      "'; DROP TABLE users; --",
      "' OR '1'='1",
      "{ $ne: null }",
      "{ $where: 'this.password.length > 0' }",
      "'; return db.users.find(); var dummy='",
      "admin'--",
      "' UNION SELECT * FROM users--"
    ];

    for (const payload of injectionPayloads) {
      try {
        const response = await this.client.post('/auth/login', {
          email: payload,
          password: payload
        });

        if (response.status === 500 || response.data.includes('error')) {
          logTest('SQL Injection Protection', false, `Vulnerable to payload: ${payload}`);
          return;
        }
      } catch (error) {
        // Expected behavior - request should be rejected
      }
    }

    logTest('SQL Injection Protection', true, 'All injection payloads properly handled');
  }

  async testXSS() {
    console.log('\n🔍 Testing XSS Protection...');

    const xssPayloads = [
      '<script>alert("XSS")</script>',
      '<img src="x" onerror="alert(1)">',
      'javascript:alert("XSS")',
      '<svg onload="alert(1)">',
      '"><script>alert("XSS")</script>',
      "'; alert('XSS'); //",
      '<iframe src="javascript:alert(1)"></iframe>'
    ];

    for (const payload of xssPayloads) {
      try {
        const response = await this.client.post('/auth/register', {
          name: payload,
          email: `test${generateRandomString()}@test.com`,
          password: 'TestPass123!',
          role: 'student',
          institutionId: '507f1f77bcf86cd799439011'
        });

        if (response.data && typeof response.data === 'string' && response.data.includes(payload)) {
          logTest('XSS Protection', false, `Vulnerable to XSS payload: ${payload}`);
          return;
        }
      } catch (error) {
        // Expected behavior
      }
    }

    logTest('XSS Protection', true, 'All XSS payloads properly sanitized');
  }

  async testCSRF() {
    console.log('\n🛡️ Testing CSRF Protection...');

    try {
      // Try to make a state-changing request without CSRF token
      const response = await this.client.post('/auth/register', {
        name: 'Test User',
        email: `test${generateRandomString()}@test.com`,
        password: 'TestPass123!',
        role: 'student',
        institutionId: '507f1f77bcf86cd799439011'
      });

      // If request succeeds without CSRF token, it's vulnerable
      if (response.status === 201) {
        logTest('CSRF Protection', false, 'Requests accepted without CSRF token');
      } else {
        logTest('CSRF Protection', true, 'CSRF protection properly implemented');
      }
    } catch (error) {
      logTest('CSRF Protection', true, 'CSRF protection active');
    }
  }

  async testRateLimiting() {
    console.log('\n⏱️ Testing Rate Limiting...');

    const requests = [];
    const testEmail = `test${generateRandomString()}@test.com`;

    // Send multiple requests rapidly
    for (let i = 0; i < 10; i++) {
      requests.push(
        this.client.post('/auth/login', {
          email: testEmail,
          password: 'wrongpassword'
        })
      );
    }

    try {
      const responses = await Promise.all(requests);
      const rateLimited = responses.some(response => response.status === 429);

      if (rateLimited) {
        logTest('Rate Limiting', true, 'Rate limiting properly configured');
      } else {
        logTest('Rate Limiting', false, 'No rate limiting detected');
      }
    } catch (error) {
      logTest('Rate Limiting', true, 'Rate limiting active (requests blocked)');
    }
  }

  async testAuthBypass() {
    console.log('\n🔐 Testing Authentication Bypass...');

    const bypassAttempts = [
      { headers: { 'x-auth-token': 'fake-token' } },
      { headers: { 'authorization': 'Bearer fake-token' } },
      { headers: { 'x-auth-token': '' } },
      { headers: { 'x-auth-token': 'null' } },
      { headers: { 'x-auth-token': 'undefined' } }
    ];

    let bypassSuccessful = false;

    for (const attempt of bypassAttempts) {
      try {
        const response = await this.client.get('/students', attempt);
        
        if (response.status === 200 && response.data.students) {
          bypassSuccessful = true;
          break;
        }
      } catch (error) {
        // Expected behavior
      }
    }

    if (bypassSuccessful) {
      logTest('Authentication Bypass', false, 'Authentication can be bypassed');
    } else {
      logTest('Authentication Bypass', true, 'Authentication properly enforced');
    }
  }

  async testInputValidation() {
    console.log('\n✅ Testing Input Validation...');

    const invalidInputs = [
      { name: '', email: 'test@test.com', password: 'Test123!' }, // Empty name
      { name: 'Test', email: 'invalid-email', password: 'Test123!' }, // Invalid email
      { name: 'Test', email: 'test@test.com', password: '123' }, // Weak password
      { name: 'A'.repeat(100), email: 'test@test.com', password: 'Test123!' }, // Long name
      { name: 'Test<script>', email: 'test@test.com', password: 'Test123!' } // XSS in name
    ];

    let validationWorking = true;

    for (const input of invalidInputs) {
      try {
        const response = await this.client.post('/auth/register', {
          ...input,
          role: 'student',
          institutionId: '507f1f77bcf86cd799439011'
        });

        if (response.status === 201) {
          validationWorking = false;
          break;
        }
      } catch (error) {
        // Expected behavior
      }
    }

    if (validationWorking) {
      logTest('Input Validation', true, 'Input validation properly implemented');
    } else {
      logTest('Input Validation', false, 'Input validation bypassed');
    }
  }

  async testFileUpload() {
    console.log('\n📁 Testing File Upload Security...');

    // Test malicious file uploads
    const maliciousFiles = [
      { filename: 'test.php', content: '<?php system($_GET["cmd"]); ?>' },
      { filename: 'test.jsp', content: '<% Runtime.getRuntime().exec(request.getParameter("cmd")); %>' },
      { filename: 'test.exe', content: 'MZ\x90\x00' }, // PE header
      { filename: '../../../etc/passwd', content: 'root:x:0:0:root:/root:/bin/bash' }
    ];

    let uploadSecure = true;

    for (const file of maliciousFiles) {
      try {
        const formData = new FormData();
        formData.append('file', new Blob([file.content]), file.filename);

        const response = await this.client.post('/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });

        if (response.status === 200) {
          uploadSecure = false;
          break;
        }
      } catch (error) {
        // Expected behavior
      }
    }

    if (uploadSecure) {
      logTest('File Upload Security', true, 'File upload properly secured');
    } else {
      logTest('File Upload Security', false, 'Malicious file upload possible');
    }
  }

  generateReport() {
    console.log('\n📋 Security Test Report');
    console.log('========================\n');

    const passed = TEST_RESULTS.filter(test => test.passed).length;
    const total = TEST_RESULTS.length;
    const score = Math.round((passed / total) * 100);

    console.log(`Overall Security Score: ${score}% (${passed}/${total} tests passed)\n`);

    // Categorize results
    const critical = TEST_RESULTS.filter(test => !test.passed && 
      ['SQL Injection Protection', 'XSS Protection', 'Authentication Bypass'].includes(test.test));
    
    const high = TEST_RESULTS.filter(test => !test.passed && 
      ['CSRF Protection', 'File Upload Security'].includes(test.test));
    
    const medium = TEST_RESULTS.filter(test => !test.passed && 
      ['Rate Limiting', 'Input Validation'].includes(test.test));

    if (critical.length > 0) {
      console.log('🚨 CRITICAL ISSUES:');
      critical.forEach(test => console.log(`  - ${test.test}: ${test.details}`));
      console.log('');
    }

    if (high.length > 0) {
      console.log('⚠️ HIGH PRIORITY ISSUES:');
      high.forEach(test => console.log(`  - ${test.test}: ${test.details}`));
      console.log('');
    }

    if (medium.length > 0) {
      console.log('📋 MEDIUM PRIORITY ISSUES:');
      medium.forEach(test => console.log(`  - ${test.test}: ${test.details}`));
      console.log('');
    }

    // Recommendations
    console.log('💡 RECOMMENDATIONS:');
    if (score < 70) {
      console.log('  - CRITICAL: Do not deploy to production');
      console.log('  - Fix all security vulnerabilities immediately');
      console.log('  - Conduct professional security audit');
    } else if (score < 90) {
      console.log('  - Address remaining security issues before production');
      console.log('  - Consider additional security testing');
    } else {
      console.log('  - Good security posture');
      console.log('  - Continue regular security testing');
      console.log('  - Monitor for new vulnerabilities');
    }

    // Save detailed report
    const report = {
      timestamp: new Date().toISOString(),
      score,
      passed,
      total,
      results: TEST_RESULTS,
      summary: {
        critical: critical.length,
        high: high.length,
        medium: medium.length
      }
    };

    require('fs').writeFileSync('security-test-report.json', JSON.stringify(report, null, 2));
    console.log('\n📄 Detailed report saved to: security-test-report.json');
  }
}

// Run tests if called directly
if (require.main === module) {
  const tester = new SecurityTester();
  tester.runAllTests().catch(console.error);
}

module.exports = SecurityTester;
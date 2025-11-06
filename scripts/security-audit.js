#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class SecurityAuditor {
  constructor() {
    this.issues = [];
    this.warnings = [];
    this.recommendations = [];
  }

  // Resolve imported route/module file paths for recursive checking
  getImportedRouteFiles(filePath, content) {
    const baseDir = path.dirname(filePath);
    const files = new Set();

    const importRegex = /import\s+[\w\{\},\s\*]+?\s+from\s+['"](.+?)['"]/g;
    const requireRegex = /require\(\s*['"](.+?)['"]\s*\)/g;

    const modulePaths = [];
    let match;
    while ((match = importRegex.exec(content)) !== null) {
      modulePaths.push(match[1]);
    }
    while ((match = requireRegex.exec(content)) !== null) {
      modulePaths.push(match[1]);
    }

    modulePaths
      .filter(p => /\/routes\//.test(p) || /routes(\.|\/|$)/.test(p) || /router/.test(p))
      .forEach(modulePath => {
        const candidates = [];
        const resolved = path.resolve(baseDir, modulePath);
        candidates.push(resolved);
        candidates.push(resolved + '.ts');
        candidates.push(resolved + '.js');
        candidates.push(resolved + '.tsx');
        candidates.push(resolved + '.jsx');

        // If it's a directory, try index files
        if (fs.existsSync(resolved) && fs.statSync(resolved).isDirectory()) {
          candidates.push(path.join(resolved, 'index.ts'));
          candidates.push(path.join(resolved, 'index.js'));
        }

        candidates.forEach(candidate => {
          if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
            files.add(candidate);
          }
        });
      });

    return Array.from(files);
  }

  // Check for hardcoded secrets
  checkHardcodedSecrets(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const patterns = [
      /password\s*=\s*['"]\w+['"]/gi,
      /secret\s*=\s*['"]\w+['"]/gi,
      /api_key\s*=\s*['"]\w+['"]/gi,
      /jwt_secret\s*=\s*['"]\w+['"]/gi,
    ];

    patterns.forEach((pattern, index) => {
      const matches = content.match(pattern);
      if (matches) {
        matches.forEach(match => {
          const isPlaceholder = this.isPlaceholderValue(match);
          if (!isPlaceholder) {
            this.issues.push({
              type: 'HARDCODED_SECRET',
              file: filePath,
              line: this.getLineNumber(content, match),
              match: match,
              severity: 'HIGH',
              description: 'Hardcoded secret found in source code'
            });
          }
        });
      }
    });
  }

  // Check for weak secrets
  checkWeakSecrets(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const weakPatterns = [
      /password\s*=\s*['"]password['"]/gi,
      /password\s*=\s*['"]123456['"]/gi,
      /password\s*=\s*['"]admin['"]/gi,
      /secret\s*=\s*['"]secret['"]/gi,
      /key\s*=\s*['"]key['"]/gi,
      /jwt_secret\s*=\s*['"]your_super_secret_jwt_key_here_change_in_production['"]/gi,
    ];

    weakPatterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        matches.forEach(match => {
          this.warnings.push({
            type: 'WEAK_SECRET',
            file: filePath,
            line: this.getLineNumber(content, match),
            match: match,
            severity: 'MEDIUM',
            description: 'Weak or default secret found'
          });
        });
      }
    });
  }

  // Check for SQL injection vulnerabilities
  checkSQLInjection(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const sqlPatterns = [
      /query\s*\+\s*req\.(body|query|params)/gi,
      /SELECT.*\+\s*req\.(body|query|params)/gi,
      /INSERT.*\+\s*req\.(body|query|params)/gi,
      /UPDATE.*\+\s*req\.(body|query|params)/gi,
      /DELETE.*\+\s*req\.(body|query|params)/gi,
      /\.query\s*\(\s*['"].*\+\s*req\./gi,
    ];

    sqlPatterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        matches.forEach(match => {
          this.issues.push({
            type: 'SQL_INJECTION',
            file: filePath,
            line: this.getLineNumber(content, match),
            match: match,
            severity: 'HIGH',
            description: 'Potential SQL injection vulnerability'
          });
        });
      }
    });
  }

  // Check for XSS vulnerabilities
  checkXSS(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const xssPatterns = [
      /innerHTML\s*=\s*req\.(body|query|params)/gi,
      /document\.write\s*\(\s*req\./gi,
      /\.html\s*\(\s*req\./gi,
      /eval\s*\(\s*req\./gi,
    ];

    xssPatterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        matches.forEach(match => {
          this.issues.push({
            type: 'XSS_VULNERABILITY',
            file: filePath,
            line: this.getLineNumber(content, match),
            match: match,
            severity: 'HIGH',
            description: 'Potential XSS vulnerability'
          });
        });
      }
    });
  }

  // Check for path traversal
  checkPathTraversal(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const traversalPatterns = [
      /fs\.readFileSync\s*\(\s*req\./gi,
      /fs\.writeFileSync\s*\(\s*req\./gi,
      /path\.join\s*\(\s*req\./gi,
      /\.sendFile\s*\(\s*req\./gi,
      /\.download\s*\(\s*req\./gi,
    ];

    traversalPatterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        matches.forEach(match => {
          this.issues.push({
            type: 'PATH_TRAVERSAL',
            file: filePath,
            line: this.getLineNumber(content, match),
            match: match,
            severity: 'HIGH',
            description: 'Potential path traversal vulnerability'
          });
        });
      }
    });
  }

  // Check for missing input validation
  checkInputValidation(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const routePatterns = [
      /app\.(get|post|put|delete|patch)\s*\(/gi,
      /router\.(get|post|put|delete|patch)\s*\(/gi,
    ];

    let hasValidation = false;
    let hasRoute = false;

    // Follow imported route files and check them instead of flagging index files
    const importedRouteFiles = this.getImportedRouteFiles(filePath, content);
    if (importedRouteFiles.length > 0) {
      importedRouteFiles.forEach(rf => this.checkInputValidation(rf));
      return;
    }

    if (content.includes('app.use(routes)') || content.includes('router.use(routes)')) {
      const routesPath = path.join(path.dirname(filePath), 'routes.ts');
      if (fs.existsSync(routesPath)) {
        this.checkInputValidation(routesPath);
      }
      return;
    }

    routePatterns.forEach(pattern => {
      if (content.match(pattern)) {
        hasRoute = true;
      }
    });

    if (content.includes('validate') || content.includes('sanitize') || content.includes('validation') || content.includes('validators')) {
      hasValidation = true;
    }

    if (hasRoute && !hasValidation) {
      this.warnings.push({
        type: 'MISSING_VALIDATION',
        file: filePath,
        line: 1,
        severity: 'MEDIUM',
        description: 'Route handlers found without input validation'
      });
    }
  }

  // Check for missing authentication
  checkAuthentication(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    // Skip known public-only route files and helper modules
    const authPublicFiles = [
      path.join('services', 'identity-service', 'src', 'routes', 'authRoutes.ts'),
      path.join('services', 'identity-service', 'src', 'routes', 'auth.routes.ts'),
      path.join('services', 'shared', 'swagger-config', 'src', 'swagger.ts'),
    ];
    if (authPublicFiles.some(p => filePath.endsWith(p))) {
      return; // Do not require authentication for public auth endpoints or swagger setup
    }
    const routePatterns = [
      /app\.(get|post|put|delete|patch)\s*\(/gi,
      /router\.(get|post|put|delete|patch)\s*\(/gi,
    ];

    let hasAuth = false;
    let hasRoute = false;

    // Follow imported route files and check them instead of flagging index files
    const importedRouteFiles = this.getImportedRouteFiles(filePath, content);
    if (importedRouteFiles.length > 0) {
      importedRouteFiles.forEach(rf => this.checkAuthentication(rf));
      return;
    }

    if (content.includes('app.use(routes)') || content.includes('router.use(routes)')) {
      const routesPath = path.join(path.dirname(filePath), 'routes.ts');
      if (fs.existsSync(routesPath)) {
        this.checkAuthentication(routesPath);
      }
      return;
    }

    routePatterns.forEach(pattern => {
      if (content.match(pattern)) {
        hasRoute = true;
      }
    });

    if (content.includes('authenticate') || content.includes('requirePermission')) {
      hasAuth = true;
    }

    if (hasRoute && !hasAuth) {
      this.issues.push({
        type: 'MISSING_AUTHENTICATION',
        file: filePath,
        line: 1,
        severity: 'HIGH',
        description: 'Route handlers found without authentication'
      });
    }
  }

  // Check for insecure headers
  checkInsecureHeaders(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const insecurePatterns = [
      /res\.setHeader\s*\(\s*['"]x-powered-by['"]/gi,
      /app\.use\s*\(\s*helmet\s*\(\s*\{\s*hidePoweredBy:\s*false/gi,
      /res\.header\s*\(\s*['"]x-powered-by['"]/gi,
    ];

    insecurePatterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        matches.forEach(match => {
          this.warnings.push({
            type: 'INSECURE_HEADERS',
            file: filePath,
            line: this.getLineNumber(content, match),
            match: match,
            severity: 'LOW',
            description: 'Insecure headers configuration'
          });
        });
      }
    });
  }

  // Check for debug mode in production
  checkDebugMode(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const debugPatterns = [
      /process\.env\.NODE_ENV\s*=\s*['"]production['"].*debug\s*=\s*true/gi,
      /DEBUG\s*=\s*true.*NODE_ENV\s*=\s*['"]production['"]/gi,
      /app\.set\s*\(\s*['"]debug['"],\s*true\s*\)/gi,
    ];

    debugPatterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        matches.forEach(match => {
          this.issues.push({
            type: 'DEBUG_MODE_PRODUCTION',
            file: filePath,
            line: this.getLineNumber(content, match),
            match: match,
            severity: 'HIGH',
            description: 'Debug mode enabled in production'
          });
        });
      }
    });
  }

  // Check for CORS misconfiguration
  checkCORS(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const corsPatterns = [
      /cors\s*\(\s*\{\s*origin:\s*['"]\*['"]/gi,
      /cors\s*\(\s*\{\s*origin:\s*true/gi,
      /cors\s*\(\s*\{\s*credentials:\s*true.*origin:\s*['"]\*['"]/gi,
    ];

    corsPatterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        matches.forEach(match => {
          this.issues.push({
            type: 'CORS_MISCONFIGURATION',
            file: filePath,
            line: this.getLineNumber(content, match),
            match: match,
            severity: 'MEDIUM',
            description: 'CORS misconfiguration detected'
          });
        });
      }
    });
  }

  // Helper methods
  isPlaceholderValue(value) {
    const placeholders = [
      'your_jwt_secret_here',
      'your_secret_key',
      'your_api_key',
      'change_me',
      'placeholder',
      'example',
      'test',
      'dummy',
    ];

    return placeholders.some(placeholder => value.toLowerCase().includes(placeholder));
  }

  getLineNumber(content, match) {
    const lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes(match)) {
        return i + 1;
      }
    }
    return 1;
  }

  // Scan directory recursively
  scanDirectory(dirPath) {
    const items = fs.readdirSync(dirPath);

    items.forEach(item => {
      const fullPath = path.join(dirPath, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        // Skip node_modules and other common directories
        if (!['node_modules', '.git', 'dist', 'build'].includes(item)) {
          this.scanDirectory(fullPath);
        }
      } else if (stat.isFile() && this.isSourceFile(item)) {
        this.scanFile(fullPath);
      }
    });
  }

  isSourceFile(filename) {
    const extensions = ['.js', '.ts', '.jsx', '.tsx', '.env'];
    if (path.basename(filename) === 'security-audit-report.json') {
      return false;
    }
    return extensions.some(ext => filename.endsWith(ext));
  }

  scanFile(filePath) {
    console.log(`Scanning: ${filePath}`);

    try {
      this.checkHardcodedSecrets(filePath);
      this.checkWeakSecrets(filePath);
      this.checkSQLInjection(filePath);
      this.checkXSS(filePath);
      this.checkPathTraversal(filePath);
      this.checkInputValidation(filePath);
      this.checkAuthentication(filePath);
      this.checkInsecureHeaders(filePath);
      this.checkDebugMode(filePath);
      this.checkCORS(filePath);
    } catch (error) {
      console.error(`Error scanning ${filePath}:`, error.message);
    }
  }

  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalIssues: this.issues.length,
        totalWarnings: this.warnings.length,
        totalRecommendations: this.recommendations.length,
        criticalIssues: this.issues.filter(i => i.severity === 'HIGH').length,
        mediumIssues: this.issues.filter(i => i.severity === 'MEDIUM').length,
        lowIssues: this.issues.filter(i => i.severity === 'LOW').length,
      },
      issues: this.issues,
      warnings: this.warnings,
      recommendations: this.recommendations,
    };

    return report;
  }

  printReport() {
    const report = this.generateReport();

    console.log('\n' + '='.repeat(60));
    console.log('SECURITY AUDIT REPORT');
    console.log('='.repeat(60));
    console.log(`Timestamp: ${report.timestamp}`);
    console.log(`\nSUMMARY:`);
    console.log(`- Total Issues: ${report.summary.totalIssues}`);
    console.log(`- Total Warnings: ${report.summary.totalWarnings}`);
    console.log(`- Critical Issues: ${report.summary.criticalIssues}`);
    console.log(`- Medium Issues: ${report.summary.mediumIssues}`);
    console.log(`- Low Issues: ${report.summary.lowIssues}`);

    if (report.issues.length > 0) {
      console.log('\nHIGH PRIORITY ISSUES:');
      report.issues.forEach((issue, index) => {
        console.log(`\n${index + 1}. ${issue.type}`);
        console.log(`   File: ${issue.file}:${issue.line}`);
        console.log(`   Severity: ${issue.severity}`);
        console.log(`   Description: ${issue.description}`);
        if (issue.match) {
          console.log(`   Match: ${issue.match}`);
        }
      });
    }

    if (report.warnings.length > 0) {
      console.log('\nWARNINGS:');
      report.warnings.forEach((warning, index) => {
        console.log(`\n${index + 1}. ${warning.type}`);
        console.log(`   File: ${warning.file}:${warning.line || 'N/A'}`);
        console.log(`   Severity: ${warning.severity}`);
        console.log(`   Description: ${warning.description}`);
        if (warning.match) {
          console.log(`   Match: ${warning.match}`);
        }
      });
    }

    console.log('\n' + '='.repeat(60));
    console.log('END OF REPORT');
    console.log('='.repeat(60));

    return report;
  }
}

// Main execution
if (require.main === module) {
  const auditor = new SecurityAuditor();
  
  console.log('Starting security audit...');
  
  // Scan the project directory
  const projectRoot = path.join(__dirname, '..');
  auditor.scanDirectory(projectRoot);
  
  // Generate and print report
  const report = auditor.printReport();
  
  // Save report to file
  const reportPath = path.join(__dirname, '..', 'security-audit-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  console.log(`\nFull report saved to: ${reportPath}`);
  
  // Exit with error code if critical issues found
  if (report.summary.criticalIssues > 0) {
    console.log('\n⚠️  CRITICAL SECURITY ISSUES FOUND!');
    console.log('Please address these issues before deploying to production.');
    process.exit(1);
  } else {
    console.log('\n✅ No critical security issues found.');
    process.exit(0);
  }
}

module.exports = SecurityAuditor;
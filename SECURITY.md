# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 2.0.x   | :white_check_mark: |
| 1.x.x   | :x:                |

## Reporting a Vulnerability

We take the security of SuperNovaFit seriously. If you believe you have found a security vulnerability, please report it to us as described below.

### Please do NOT:
- Open a public GitHub issue
- Disclose the vulnerability publicly before it has been addressed

### Please DO:
- Email us at: security@supernovafit.com
- Include the following information:
  - Type of vulnerability (e.g., XSS, SQL Injection, Authentication Bypass)
  - Full paths of source file(s) related to the vulnerability
  - Step-by-step instructions to reproduce the issue
  - Proof-of-concept or exploit code (if possible)
  - Impact assessment

### What to Expect

- **Acknowledgment**: Within 48 hours
- **Initial Assessment**: Within 5 business days
- **Resolution Timeline**: 
  - Critical: 7 days
  - High: 14 days
  - Medium: 30 days
  - Low: 90 days

## Security Measures

### Authentication & Authorization
- Firebase Authentication with secure session management
- Role-based access control (Coach/Athlete)
- AuthGuard protection on all routes

### Data Protection
- HTTPS enforced on all connections
- Firestore security rules with user isolation
- Input validation using Zod schemas
- XSS protection through React's built-in escaping

### Infrastructure
- Firebase Hosting with DDoS protection
- Automated security updates via Dependabot
- Regular npm audit in CI/CD pipeline
- Sentry for error monitoring

### Client-Side Security
- Content Security Policy headers
- Secure cookie settings
- No sensitive data in localStorage
- Environment variables for configuration

## Security Checklist for Contributors

Before submitting a PR, ensure:

- [ ] No hardcoded secrets or API keys
- [ ] Input validation on all user inputs
- [ ] Proper error handling without exposing internals
- [ ] Authentication checks on protected routes
- [ ] No use of `dangerouslySetInnerHTML` without sanitization
- [ ] Dependencies updated and audited
- [ ] Security headers configured properly

## Security Headers

Our application implements the following security headers:

```
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' https://apis.google.com; style-src 'self' 'unsafe-inline';
```

## Dependencies Management

- Weekly automated dependency updates
- Security audit before each release
- No dependencies with known vulnerabilities in production

## Incident Response

In case of a security incident:

1. **Immediate Actions**
   - Isolate affected systems
   - Preserve evidence
   - Notify security team

2. **Investigation**
   - Determine scope and impact
   - Identify root cause
   - Document timeline

3. **Remediation**
   - Deploy fixes
   - Verify resolution
   - Update security measures

4. **Communication**
   - Notify affected users (if required)
   - Update security advisories
   - Post-mortem analysis

## Contact

Security Team: security@supernovafit.com  
Response Time: 24-48 hours

## Recognition

We appreciate the security research community's efforts in helping keep SuperNovaFit and our users safe. Responsible disclosure is greatly appreciated.

---

Last Updated: 2025-09-27  
Version: 2.0.0

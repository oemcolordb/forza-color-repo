# 🤖 Forza Color Universe - Development Agent Specification

## Agent Identity

**Name**: Forza DevOps Agent (FDA)  
**Version**: 1.0.0  
**Specialization**: Full-stack TypeScript/React development with security and performance focus  
**Primary Mission**: Complete all 25 tasks from TASK_LIST.md systematically and efficiently

---

## Agent Capabilities & Expertise

### Core Technical Skills
- **Frontend**: React 19, Next.js 15+, TypeScript 5.8+, Tailwind CSS
- **Backend**: Node.js, Serverless functions, API design
- **Database**: Turso (libSQL), SQLite, SQL optimization
- **Security**: OWASP Top 10, CSRF, XSS, input validation, rate limiting
- **Performance**: Algorithm optimization, caching, lazy loading, Web Workers
- **Testing**: Jest, React Testing Library, Playwright, E2E testing
- **DevOps**: Vercel deployment, CI/CD, environment management

### Specialized Knowledge
- **Data Structures**: KD-Trees, spatial indexing, hash maps
- **Color Science**: HSB/RGB conversion, color distance algorithms (Delta E)
- **Image Processing**: Canvas API, compression, progressive loading
- **Web Performance**: Virtual scrolling, code splitting, bundle optimization
- **Accessibility**: WCAG 2.1 AA, ARIA, keyboard navigation

### Development Principles
- **Security First**: All code must pass security validation
- **Performance Conscious**: O(n) or better complexity preferred
- **Type Safe**: Strict TypeScript with no `any` types
- **Test Driven**: Write tests alongside implementation
- **Clean Code**: Follow project guidelines from memory-bank
- **Documentation**: Inline comments for complex logic

---

## Agent Operating Procedures

### Task Execution Protocol

1. **Read & Understand**
   - Review task requirements from TASK_LIST.md
   - Check related files and dependencies
   - Identify potential conflicts or blockers

2. **Plan Implementation**
   - Design solution architecture
   - List files to create/modify
   - Identify testing requirements
   - Estimate completion time

3. **Implement Solution**
   - Write clean, typed code
   - Follow project patterns from guidelines.md
   - Add error handling and validation
   - Include inline documentation

4. **Test & Validate**
   - Write unit tests for new functions
   - Test edge cases and error scenarios
   - Verify TypeScript compilation
   - Check for memory leaks

5. **Document & Report**
   - Update relevant documentation
   - Create migration guides if needed
   - Report completion status
   - Note any deviations or improvements

### Code Quality Standards

```typescript
// ✅ GOOD: Type-safe, validated, error-handled
async function saveColorScan(data: ScanInput): Promise<ScanResult> {
  // Validate input
  const validated = scanSchema.parse(data);
  
  try {
    // Check rate limit
    if (!checkRateLimit(validated.userId)) {
      throw new RateLimitError('Too many requests');
    }
    
    // Save to database
    const result = await db.insert(validated);
    
    // Return typed result
    return { success: true, id: result.id };
  } catch (error) {
    logError(error, { context: 'saveColorScan' });
    throw new DatabaseError('Failed to save scan');
  }
}

// ❌ BAD: No types, no validation, no error handling
async function saveColorScan(data: any) {
  const result = await db.insert(data);
  return result;
}
```

### Security Checklist (Every Task)
- [ ] Input validation with Zod schemas
- [ ] SQL injection prevention (parameterized queries)
- [ ] XSS prevention (sanitize user input)
- [ ] CSRF token validation for state changes
- [ ] Rate limiting on API endpoints
- [ ] Proper error messages (no sensitive data leaks)
- [ ] Authentication/authorization checks

### Performance Checklist (Every Task)
- [ ] Memoization for expensive computations
- [ ] Lazy loading for non-critical code
- [ ] Debouncing/throttling for frequent events
- [ ] Cleanup in useEffect hooks
- [ ] Proper dependency arrays
- [ ] No memory leaks (revoke URLs, clear timers)
- [ ] Efficient algorithms (avoid O(n²) when possible)

---

## Sprint 1: Critical Security & Stability

### Task 1: Fix Memory Leaks in ImageColorExtractor ✅

**Status**: READY TO START  
**Priority**: CRITICAL  
**Estimated Time**: 1-2 hours

**Implementation Plan**:
1. Read `app/components/ImageColorExtractor.tsx`
2. Identify all canvas contexts and object URLs
3. Add cleanup functions in useEffect
4. Test with repeated image uploads
5. Verify no memory growth in DevTools

**Acceptance Criteria**:
- [ ] All canvas contexts cleared on unmount
- [ ] All object URLs revoked
- [ ] No memory leaks in Chrome DevTools profiler
- [ ] Component can be mounted/unmounted 100+ times without issues

---

### Task 2: Add API Input Validation & Sanitization ✅

**Status**: READY TO START  
**Priority**: CRITICAL  
**Estimated Time**: 3-4 hours

**Implementation Plan**:
1. Install Zod: `npm install zod`
2. Create `app/lib/validation.ts` with schemas
3. Update `app/api/scans/route.ts` to use validation
4. Add error responses for invalid input
5. Write unit tests for validation

**Files to Create**:
```typescript
// app/lib/validation.ts
import { z } from 'zod';

export const hsbColorSchema = z.object({
  h: z.number().min(0).max(360),
  s: z.number().min(0).max(1),
  b: z.number().min(0).max(1)
});

export const carColorSchema = z.object({
  make: z.string().min(1).max(100),
  model: z.string().min(1).max(100),
  year: z.number().int().min(1900).max(2100).nullable(),
  colorName: z.string().min(1).max(255),
  colorType: z.string().min(1).max(50),
  color1: hsbColorSchema,
  color2: hsbColorSchema
});

export const scanInputSchema = z.object({
  userId: z.string().min(1).max(100),
  imageName: z.string().min(1).max(255),
  extractedColors: z.array(hsbColorSchema).min(1).max(50),
  matches: z.array(carColorSchema).max(100),
  imageData: z.string().max(10485760) // 10MB base64 limit
});

export type ScanInput = z.infer<typeof scanInputSchema>;
```

**Acceptance Criteria**:
- [ ] All API inputs validated with Zod
- [ ] Proper error messages for invalid data
- [ ] SQL injection prevented
- [ ] Unit tests cover all validation rules
- [ ] TypeScript types generated from schemas

---

### Task 3: Implement Rate Limiting ✅

**Status**: READY TO START  
**Priority**: CRITICAL  
**Estimated Time**: 2-3 hours

**Implementation Plan**:
1. Create `app/lib/rateLimit.ts` with in-memory limiter
2. Create `middleware.ts` for global rate limiting
3. Add per-endpoint limits in API routes
4. Add rate limit headers (X-RateLimit-*)
5. Test with concurrent requests

**Files to Create**:
```typescript
// app/lib/rateLimit.ts
interface RateLimitRecord {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private limits = new Map<string, RateLimitRecord>();
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Cleanup expired records every minute
    this.cleanupInterval = setInterval(() => this.cleanup(), 60000);
  }

  check(
    identifier: string,
    limit: number = 10,
    windowMs: number = 60000
  ): { allowed: boolean; remaining: number; resetTime: number } {
    const now = Date.now();
    const record = this.limits.get(identifier);

    if (!record || now > record.resetTime) {
      const resetTime = now + windowMs;
      this.limits.set(identifier, { count: 1, resetTime });
      return { allowed: true, remaining: limit - 1, resetTime };
    }

    if (record.count >= limit) {
      return { allowed: false, remaining: 0, resetTime: record.resetTime };
    }

    record.count++;
    return { allowed: true, remaining: limit - record.count, resetTime: record.resetTime };
  }

  private cleanup() {
    const now = Date.now();
    for (const [key, record] of this.limits.entries()) {
      if (now > record.resetTime) {
        this.limits.delete(key);
      }
    }
  }

  destroy() {
    clearInterval(this.cleanupInterval);
  }
}

export const rateLimiter = new RateLimiter();
```

**Acceptance Criteria**:
- [ ] Rate limiting works per IP address
- [ ] Proper HTTP 429 responses when limit exceeded
- [ ] Rate limit headers included in responses
- [ ] Different limits for different endpoints
- [ ] Memory cleanup prevents leaks

---

### Task 4: Add CSRF Protection ✅

**Status**: READY TO START  
**Priority**: CRITICAL  
**Estimated Time**: 2-3 hours

**Implementation Plan**:
1. Install CSRF library: `npm install csrf`
2. Create `app/lib/csrf.ts` with token generation
3. Add token to forms and API calls
4. Validate tokens in API routes
5. Test with valid/invalid tokens

**Files to Create**:
```typescript
// app/lib/csrf.ts
import { Tokens } from 'csrf';

const tokens = new Tokens();
const secret = process.env.CSRF_SECRET || 'default-secret-change-in-production';

export function generateCsrfToken(): string {
  return tokens.create(secret);
}

export function validateCsrfToken(token: string): boolean {
  return tokens.verify(secret, token);
}

// Middleware for API routes
export function csrfProtection(handler: Function) {
  return async (req: Request) => {
    if (req.method === 'GET' || req.method === 'HEAD') {
      return handler(req);
    }

    const token = req.headers.get('x-csrf-token');
    
    if (!token || !validateCsrfToken(token)) {
      return new Response(
        JSON.stringify({ error: 'Invalid CSRF token' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return handler(req);
  };
}
```

**Acceptance Criteria**:
- [ ] CSRF tokens generated for all forms
- [ ] Tokens validated on POST/PUT/DELETE requests
- [ ] GET requests not affected
- [ ] Proper error messages for invalid tokens
- [ ] Token rotation on successful requests

---

### Task 5: Add Error Boundaries ✅

**Status**: READY TO START  
**Priority**: HIGH  
**Estimated Time**: 1-2 hours

**Implementation Plan**:
1. Create `app/components/ErrorBoundary.tsx`
2. Add error boundary to layout.tsx
3. Add specific boundaries for critical components
4. Create error fallback UI
5. Test with intentional errors

**Files to Create**:
```typescript
// app/components/ErrorBoundary.tsx
'use client';

import React from 'react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="max-w-md w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
            <h2 className="text-2xl font-bold text-red-600 mb-4">
              Something went wrong
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <button
              onClick={() => this.setState({ hasError: false })}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition"
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
```

**Acceptance Criteria**:
- [ ] Error boundaries wrap critical components
- [ ] Errors don't crash entire app
- [ ] User-friendly error messages
- [ ] Errors logged for debugging
- [ ] Recovery mechanism (try again button)

---

### Task 6: Input Sanitization ✅

**Status**: READY TO START  
**Priority**: HIGH  
**Estimated Time**: 1-2 hours

**Implementation Plan**:
1. Install DOMPurify: `npm install dompurify @types/dompurify`
2. Create `app/lib/sanitize.ts`
3. Sanitize all user inputs before display
4. Add to form handlers
5. Test with XSS payloads

**Files to Create**:
```typescript
// app/lib/sanitize.ts
import DOMPurify from 'dompurify';

export function sanitizeHtml(dirty: string): string {
  if (typeof window === 'undefined') {
    // Server-side: strip all HTML
    return dirty.replace(/<[^>]*>/g, '');
  }
  
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a'],
    ALLOWED_ATTR: ['href']
  });
}

export function sanitizeText(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: []
  });
}

export function sanitizeFileName(fileName: string): string {
  // Remove path traversal attempts and dangerous characters
  return fileName
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/\.{2,}/g, '.')
    .substring(0, 255);
}
```

**Acceptance Criteria**:
- [ ] All user inputs sanitized
- [ ] XSS attacks prevented
- [ ] File names sanitized
- [ ] No path traversal vulnerabilities
- [ ] Tests with common XSS payloads pass

---

## Agent Execution Commands

### Start Sprint 1
```bash
# Agent will execute these tasks in order
FDA_START_SPRINT=1
FDA_AUTO_COMMIT=true
FDA_RUN_TESTS=true
```

### Task Execution
```bash
# Execute specific task
FDA_EXECUTE_TASK=1  # Fix Memory Leaks
FDA_EXECUTE_TASK=2  # Add Input Validation
# ... etc
```

### Validation
```bash
# After each task
npm run type-check
npm run lint
npm run test
```

---

## Agent Success Metrics

### Per Task
- ✅ All acceptance criteria met
- ✅ TypeScript compilation passes
- ✅ ESLint passes with no errors
- ✅ Tests written and passing
- ✅ No new security vulnerabilities
- ✅ Performance not degraded

### Per Sprint
- ✅ All sprint tasks completed
- ✅ Integration tests pass
- ✅ Documentation updated
- ✅ Code reviewed and approved
- ✅ Deployed to staging successfully

### Overall Project
- ✅ All 25 tasks completed
- ✅ 90%+ test coverage
- ✅ Zero critical security issues
- ✅ Performance improved by 50%+
- ✅ Production deployment successful

---

## Agent Communication Protocol

### Status Updates
```
[FDA] Starting Task 1: Fix Memory Leaks
[FDA] Reading ImageColorExtractor.tsx...
[FDA] Found 3 memory leak sources
[FDA] Implementing cleanup functions...
[FDA] Testing with 100 mount/unmount cycles...
[FDA] ✅ Task 1 Complete - No memory leaks detected
```

### Blocker Reports
```
[FDA] ⚠️ BLOCKER: Task 3 requires environment variable CSRF_SECRET
[FDA] Action Required: Add CSRF_SECRET to .env.local
[FDA] Pausing until resolved...
```

### Completion Reports
```
[FDA] 📊 Sprint 1 Summary:
- Tasks Completed: 6/6
- Tests Added: 24
- Security Issues Fixed: 6
- Performance Improvement: 15%
- Time Taken: 12 hours
- Status: ✅ READY FOR REVIEW
```

---

## Agent Self-Improvement

After each sprint, the agent will:
1. Analyze what went well
2. Identify bottlenecks
3. Update procedures if needed
4. Optimize for next sprint
5. Report learnings

---

## Emergency Protocols

### If Task Fails
1. Document the failure
2. Identify root cause
3. Propose alternative solution
4. Request human review if needed
5. Do not proceed to next task

### If Tests Fail
1. Analyze test failures
2. Fix implementation
3. Re-run tests
4. Do not commit broken code

### If Security Issue Found
1. Stop current task
2. Report issue immediately
3. Propose fix
4. Get approval before proceeding

---

## Agent Activation

**Status**: READY TO DEPLOY  
**Awaiting Command**: START_SPRINT_1

Once activated, the agent will systematically complete all tasks following the procedures above, ensuring the Forza Color Universe project becomes secure, performant, and production-ready.

---

**Agent Signature**: Forza DevOps Agent v1.0.0  
**Created**: 2024  
**Mission**: Excellence in Code, Security, and Performance

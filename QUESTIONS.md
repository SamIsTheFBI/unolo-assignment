# Technical Questions & Answers

## Technical Questions

### 1. If this app had 10,000 employees checking in simultaneously, what would break first? How would you fix it?

**What would break first:**
- **Database connections** - SQLite has limited concurrent write capabilities
- **Memory usage** - All concurrent requests would consume server memory
- **Single server bottleneck** - One Node.js process handling all requests

**How to fix it:**
- **Database scaling**: Switch to PostgreSQL/MySQL with connection pooling
- **Horizontal scaling**: Deploy multiple server instances behind a load balancer
- **Caching**: Implement Redis for session management and frequently accessed data
- **Queue system**: Use message queues (Redis/RabbitMQ) for non-critical operations
- **Database optimization**: Add proper indexes, implement read replicas

### 2. The current JWT implementation has a security issue. What is it and how would you improve it?

**Security issues:**
- **No token expiration** - Tokens never expire, creating security risk if compromised
- **No refresh token mechanism** - Users stay logged in indefinitely
- **Weak secret** - Using simple string instead of strong secret

**Improvements:**
- **Add expiration**: Set short-lived access tokens (15-30 minutes)
- **Implement refresh tokens**: Long-lived tokens for getting new access tokens
- **Stronger secrets**: Use cryptographically secure random secrets
- **Token blacklisting**: Maintain blacklist for revoked tokens
- **HTTPS only**: Ensure tokens only transmitted over secure connections

### 3. How would you implement offline check-in support? (Employee has no internet, checks in, syncs later)

**Implementation approach:**
- **Local storage**: Store check-ins in browser's IndexedDB when offline
- **Service worker**: Detect online/offline status and queue requests
- **Sync mechanism**: When online, sync queued check-ins to server
- **Conflict resolution**: Handle cases where data conflicts during sync
- **UI feedback**: Show offline status and pending sync indicators

**Technical details:**
```javascript
// Store offline check-ins
const offlineCheckins = JSON.parse(localStorage.getItem('offlineCheckins') || '[]');
offlineCheckins.push({...checkinData, timestamp: Date.now(), synced: false});

// Sync when online
window.addEventListener('online', syncOfflineData);
```

## Theory/Research Questions

### 4. Explain the difference between SQL and NoSQL databases. For this Field Force Tracker application, which would you recommend and why?

**SQL Databases:**
- **Structure**: Fixed schema with tables, rows, columns
- **ACID compliance**: Strong consistency and transactions
- **Relationships**: Foreign keys and complex joins
- **Examples**: PostgreSQL, MySQL, SQLite

**NoSQL Databases:**
- **Structure**: Flexible schema (document, key-value, graph)
- **Scalability**: Horizontal scaling, eventual consistency
- **Performance**: Optimized for specific use cases
- **Examples**: MongoDB, Redis, Cassandra

**Recommendation for Field Force Tracker: SQL (PostgreSQL)**

**Reasons:**
- **Structured data**: Employee-client relationships are well-defined
- **ACID transactions**: Critical for attendance/payroll accuracy
- **Complex queries**: Need joins for reports and analytics
- **Data integrity**: Foreign key constraints prevent orphaned records
- **Mature ecosystem**: Better tooling and developer familiarity

### 5. What is the difference between authentication and authorization? Identify where each is implemented in this codebase.

**Authentication**: Verifying who the user is (login process)
**Authorization**: Determining what the authenticated user can access

**In this codebase:**

**Authentication:**
- `POST /api/auth/login` - Verifies email/password and issues JWT
- `authenticateToken` middleware - Validates JWT tokens
- Frontend login form and token storage

**Authorization:**
- Role-based access in dashboard routes (manager vs employee views)
- Employee-client assignment checks in check-in routes
- Manager-only access to reports endpoint
- Frontend route protection based on user role

### 6. Explain what a race condition is. Can you identify any potential race conditions in this codebase? How would you prevent them?

**Race condition**: When multiple operations access shared resources simultaneously, leading to unpredictable results.

**Potential race conditions in this codebase:**

1. **Concurrent check-ins**: Multiple requests trying to create check-ins simultaneously
2. **Check-out timing**: User checking out while system is processing check-in
3. **Database writes**: Multiple employees updating same client data

**Prevention methods:**
- **Database transactions**: Wrap related operations in transactions
- **Optimistic locking**: Use version numbers to detect concurrent modifications
- **Unique constraints**: Database-level constraints to prevent duplicates
- **Atomic operations**: Use database-level atomic operations where possible
- **Request debouncing**: Prevent rapid successive API calls from frontend

**Example fix:**
```sql
BEGIN TRANSACTION;
SELECT * FROM checkins WHERE employee_id = ? AND status = 'checked_in' FOR UPDATE;
-- Check if active check-in exists, then insert
COMMIT;
```

# Bug Fixes Documentation

## Bug 1: Login password comparison Issue
**Location:** `backend/routes/auth.js` line 28
**What was wrong:** `bcrypt.compare()` was not awaited, causing it to return a Promise instead of a boolean value
**How I fixed it:** Added `await` keyword before `bcrypt.compare(password, user.password)`
**Why this fix is correct:** Here, bcrypt.compare() is an async function that returns a Promise. Without await, the comparison always evaluates to truthy (Promise object), causing every login attempt to succeed (as long as the email is correct because email check is done before password comparison).

## Bug 2: Form Submission Handler Missing preventDefault
**Location:** `frontend/src/pages/CheckIn.jsx` line 85
**What was wrong:** Form submission handler didn't prevent default browser behavior, causing page refresh and thus the api call never completed
**How I fixed it:** Added `e.preventDefault()` at the start of the handleCheckIn function to prevent page refresh
**Why this fix is correct:** Form submissions trigger page refresh by default. preventDefault() stops this behavior, allowing the api to be called properly. But this issue is tied with a backend issue as discussed just after this bug (Bug 6)

### Bug 3: Dashboard shows incorrect data for some users (or rather fails to show anything at all)
**Location**: `backend/routes/dashboard.js` line 76
**What was wrong**: The syntax here doesn't match with sqlite3 and that returns an Internal Server Error message to the frontend.
**How I fixed it**: Changed it from:
```js
 const [weekStats] = await pool.execute(
            `SELECT COUNT(*) as total_checkins,
                    COUNT(DISTINCT client_id) as unique_clients
             FROM checkins
             WHERE employee_id = ? AND checkin_time >= DATE_SUB(NOW(), INTERVAL 7 DAY)`,
            [req.user.id]
        );

```

to:

```js
    const [weekStats] = await pool.execute(
      `SELECT COUNT(*) as total_checkins,
                    COUNT(DISTINCT client_id) as unique_clients
             FROM checkins
             WHERE employee_id = ? AND checkin_time >= datetime('now', '-7 days')`,
      [req.user.id]
    );
```

**Why this fix is correct**: This change uses the correct syntax for sqlite3.  

## Bug 4: Null Reference Error in History Page
**Location:** `frontend/src/pages/History.jsx` 
**What was wrong:** `totalHours` calculation tried to call reduce() on null checkins array before data was loaded
**How I fixed it:** Added null check: `checkins ? checkins.reduce(...) : 0`
**Why this fix is correct:** React components render before async data loads. The null check prevents crashes when checkins is still null during initial render.

## Bug 5: Wrong HTTP Status Codes
**What was wrong:**

 1. checkin.js
`return res.status(200).json({ success: false, message: 'Client ID is required' });`

Current: 200 OK
Should be: 400 Bad Request
Reason: Missing required parameter is a client error, not success

2. auth.js 
`const isValidPassword = bcrypt.compare(password, user.password);`

Issue: Missing await keyword
Current: This will always be truthy (returns a Promise)
Should be: const isValidPassword = await bcrypt.compare(password, user.password);

3. middleware/auth.js
`return res.status(403).json({ success: false, message: 'Invalid or expired token' });`

Current: 403 Forbidden
Should be: 401 Unauthorized
Reason: Invalid/expired tokens should return 401, not 403. 403 is for valid authentication but insufficient permissions.

## Bug 6: Location data is not being saved correctly
**Location:** `backend/routes/checkin.js` line 45
**What was wrong:** INSERT query used column names `lat, lng` but database schema defines `latitude, longitude`
**How I fixed it:** Changed column names in INSERT query to match schema: `latitude, longitude`
**Why this fix is correct:** Column names must match the database schema exactly. The mismatch caused check-in submissions to fail silently.


## Bug: JWT Token Security Vulnerability
**Location:** `backend/routes/auth.js` line 31
**What was wrong:** JWT token payload included the user's password hash, creating a major security vulnerability
**How I fixed it:** Removed `password: user.password` from the JWT payload
**Why this fix is correct:** JWT tokens should never contain sensitive information like passwords. The token is decoded on the client side and could expose password hashes.


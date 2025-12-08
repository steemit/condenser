# API Endpoint Testing Guide

This document explains how to test Steem API endpoints.

## Prerequisites

1. Ensure the development server is running:
   ```bash
   pnpm dev
   ```

2. Server should be running on `http://localhost:3000`

3. Optional: Configure environment variables (`.env.local`):
   ```bash
   # Unified API URL
   STEEM_API_URL=https://api.steemit.com
   
   STEEMD_USE_APPBASE=false
   CHAIN_ID=0000000000000000000000000000000000000000000000000000000000000000
   ADDRESS_PREFIX=STM
   ```

## Testing Methods

### Method 1: Using Test Scripts (Recommended)

Run TypeScript test script:
```bash
pnpm test:api
```

Or use simple bash script:
```bash
./scripts/test-api-simple.sh
```

### Method 2: Using curl

#### 1. Get Account Information
```bash
curl "http://localhost:3000/api/steem/account?username=steemit"
```

#### 2. Get Trending Posts
```bash
curl "http://localhost:3000/api/steem/posts?sort=trending&limit=5"
```

#### 3. Get Hot Posts
```bash
curl "http://localhost:3000/api/steem/posts?sort=hot&limit=5"
```

#### 4. Get Account Posts
```bash
curl "http://localhost:3000/api/steem/posts?sort=blog&account=steemit&limit=5"
```

#### 5. Get Single Post
```bash
# First get author and permlink from trending posts
curl "http://localhost:3000/api/steem/post?author=steemit&permlink=firstpost"
```

#### 6. Get Comments
```bash
curl "http://localhost:3000/api/steem/comments?author=steemit&permlink=firstpost"
```

#### 7. Get Notifications
```bash
curl "http://localhost:3000/api/steem/notifications?account=steemit&limit=10"
```

#### 8. Get Unread Notifications
```bash
curl "http://localhost:3000/api/steem/unread-notifications?account=steemit"
```

#### 9. Check Authority (POST)
```bash
curl -X POST "http://localhost:3000/api/auth/check-authority" \
  -H "Content-Type: application/json" \
  -d '{"username":"steemit","password":"test"}'
```

### Method 3: Using Browser

Visit in browser:
- `http://localhost:3000/api/steem/account?username=steemit`
- `http://localhost:3000/api/steem/posts?sort=trending&limit=5`

## API Endpoints List

### Steem API Endpoints

| Endpoint | Method | Description | Parameters |
|----------|--------|-------------|------------|
| `/api/steem/account` | GET | Get account information | `username` (required) |
| `/api/steem/posts` | GET | Get ranked posts or account posts | `sort`, `tag`, `account`, `start_author`, `start_permlink`, `limit`, `observer` |
| `/api/steem/post` | GET | Get single post | `author` (required), `permlink` (required) |
| `/api/steem/comments` | GET | Get post comments | `author` (required), `permlink` (required) |
| `/api/steem/notifications` | GET | Get account notifications | `account` (required), `last_id`, `limit` |
| `/api/steem/unread-notifications` | GET | Get unread notification count | `account` (required) |

### Authentication API Endpoints

| Endpoint | Method | Description | Parameters |
|----------|--------|-------------|------------|
| `/api/auth/check-authority` | POST | Check account authority | `username` (required), `password` (required), `role` (optional) |
| `/api/auth/login` | POST | Server-side login | `username` (required), `signatures` (required) |

## Expected Response Format

### Success Response
```json
{
  "author": "steemit",
  "permlink": "firstpost",
  "title": "Post Title",
  "body": "Post content...",
  ...
}
```

### Error Response
```json
{
  "error": "Error message"
}
```

## Common Issues

### 1. Connection Refused
- Ensure development server is running: `pnpm dev`
- Check if port is correct (default 3000)

### 2. API Call Timeout
- Check if Steem RPC node is accessible
- Check network connection
- Try using different RPC node

### 3. Account Not Found Error
- Ensure using valid Steem account name
- Check account name spelling

### 4. Authority Check Failed
- This is normal if using invalid password/WIF
- Use valid account credentials for testing

## Testing Checklist

- [ ] Development server is running
- [ ] Can access `/api/steem/account` endpoint
- [ ] Can get trending posts (trending, hot)
- [ ] Can get account posts
- [ ] Can get single post
- [ ] Can get comments
- [ ] Can get notifications
- [ ] Authority check endpoint works properly
- [ ] Error handling is correct (404, 500, etc.)

## Performance Testing

Use `time` command to test response time:
```bash
time curl "http://localhost:3000/api/steem/posts?sort=trending&limit=20"
```

## Debugging

If you encounter issues, check:
1. Server logs (terminal output)
2. Browser developer tools (Network tab)
3. API route logs (console.log in `app/api/**/route.ts`)


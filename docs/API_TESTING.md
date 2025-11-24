# API 端点测试指南

本文档说明如何测试 Steem API 端点。

## 前置条件

1. 确保开发服务器正在运行：
   ```bash
   pnpm dev
   ```

2. 服务器应该在 `http://localhost:3000` 上运行

3. 可选：配置环境变量（`.env.local`）：
   ```bash
   STEEMD_CONNECTION_SERVER=https://api.steemit.com
   STEEMD_CONNECTION_CLIENT=https://api.steemit.com
   STEEMD_USE_APPBASE=false
   CHAIN_ID=0000000000000000000000000000000000000000000000000000000000000000
   ADDRESS_PREFIX=STM
   ```

## 测试方法

### 方法 1: 使用测试脚本（推荐）

运行 TypeScript 测试脚本：
```bash
pnpm test:api
```

或使用简单的 bash 脚本：
```bash
./scripts/test-api-simple.sh
```

### 方法 2: 使用 curl

#### 1. 获取账户信息
```bash
curl "http://localhost:3000/api/steem/account?username=steemit"
```

#### 2. 获取排名文章（Trending）
```bash
curl "http://localhost:3000/api/steem/posts?sort=trending&limit=5"
```

#### 3. 获取排名文章（Hot）
```bash
curl "http://localhost:3000/api/steem/posts?sort=hot&limit=5"
```

#### 4. 获取账户文章
```bash
curl "http://localhost:3000/api/steem/posts?sort=blog&account=steemit&limit=5"
```

#### 5. 获取单篇文章
```bash
# 首先从 trending 获取一个文章的 author 和 permlink
curl "http://localhost:3000/api/steem/post?author=steemit&permlink=firstpost"
```

#### 6. 获取评论
```bash
curl "http://localhost:3000/api/steem/comments?author=steemit&permlink=firstpost"
```

#### 7. 获取通知
```bash
curl "http://localhost:3000/api/steem/notifications?account=steemit&limit=10"
```

#### 8. 获取未读通知
```bash
curl "http://localhost:3000/api/steem/unread-notifications?account=steemit"
```

#### 9. 检查权限（POST）
```bash
curl -X POST "http://localhost:3000/api/auth/check-authority" \
  -H "Content-Type: application/json" \
  -d '{"username":"steemit","password":"test"}'
```

### 方法 3: 使用浏览器

在浏览器中访问：
- `http://localhost:3000/api/steem/account?username=steemit`
- `http://localhost:3000/api/steem/posts?sort=trending&limit=5`

## API 端点列表

### Steem API 端点

| 端点 | 方法 | 描述 | 参数 |
|------|------|------|------|
| `/api/steem/account` | GET | 获取账户信息 | `username` (必需) |
| `/api/steem/posts` | GET | 获取排名文章或账户文章 | `sort`, `tag`, `account`, `start_author`, `start_permlink`, `limit`, `observer` |
| `/api/steem/post` | GET | 获取单篇文章 | `author` (必需), `permlink` (必需) |
| `/api/steem/comments` | GET | 获取文章评论 | `author` (必需), `permlink` (必需) |
| `/api/steem/notifications` | GET | 获取账户通知 | `account` (必需), `last_id`, `limit` |
| `/api/steem/unread-notifications` | GET | 获取未读通知数量 | `account` (必需) |

### 认证 API 端点

| 端点 | 方法 | 描述 | 参数 |
|------|------|------|------|
| `/api/auth/check-authority` | POST | 检查账户权限 | `username` (必需), `password` (必需), `role` (可选) |
| `/api/auth/login` | POST | 服务器端登录 | `username` (必需), `signatures` (必需) |

## 预期响应格式

### 成功响应
```json
{
  "author": "steemit",
  "permlink": "firstpost",
  "title": "Post Title",
  "body": "Post content...",
  ...
}
```

### 错误响应
```json
{
  "error": "Error message"
}
```

## 常见问题

### 1. 连接被拒绝
- 确保开发服务器正在运行：`pnpm dev`
- 检查端口是否正确（默认 3000）

### 2. API 调用超时
- 检查 Steem RPC 节点是否可访问
- 检查网络连接
- 尝试使用不同的 RPC 节点

### 3. 账户不存在错误
- 确保使用有效的 Steem 账户名
- 检查账户名拼写

### 4. 权限检查失败
- 这是正常的，如果使用无效的密码/WIF
- 使用有效的账户凭据进行测试

## 测试检查清单

- [ ] 开发服务器正在运行
- [ ] 可以访问 `/api/steem/account` 端点
- [ ] 可以获取排名文章（trending, hot）
- [ ] 可以获取账户文章
- [ ] 可以获取单篇文章
- [ ] 可以获取评论
- [ ] 可以获取通知
- [ ] 权限检查端点正常工作
- [ ] 错误处理正确（404, 500 等）

## 性能测试

使用 `time` 命令测试响应时间：
```bash
time curl "http://localhost:3000/api/steem/posts?sort=trending&limit=20"
```

## 调试

如果遇到问题，检查：
1. 服务器日志（终端输出）
2. 浏览器开发者工具（Network 标签）
3. API 路由日志（`app/api/**/route.ts` 中的 console.log）


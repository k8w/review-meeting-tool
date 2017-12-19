回顾会议工具
===============

### 特性介绍
1. 多人手机匿名提交提案和投票
1. 会议环境安全检查
1. 匿名提案
1. 匿名投票

### 环境准备

```
npm i -g typescript
cd frontend
npm i
cd backend
npm i
```

### 环境准备

```
npm install typescript http-server -g
cd backend
tsc -p .
```

### 编译
```
cd backend
tsc
```

### 运行
**前端**
```
cd frontend
http-server -c-1 -p 80
```

**后台**
```
cd backend
node dist
```

# 配置
扫码开会的二维码，IP固定死了，实际使用的时候要改一下。
直接替换 `frontend/admin/qrcode.png` 即可
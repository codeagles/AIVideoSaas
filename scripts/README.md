# Scripts

积分系统管理脚本，用于开发和测试。

## 快速开始：设置管理员

**最简单的方法 - 使用环境变量：**

1. 在 `.env.local` 中添加：
```env
ADMIN_EMAIL="your-email@example.com"
```

2. 使用该邮箱登录 - 系统会自动设置为管理员！

3. 完成！现在可以使用下面的脚本添加测试积分了。

---

## 快捷命令

所有脚本都配置了快捷命令：

```bash
# 给用户增加积分
pnpm script:add-credits <email> <credits> [reason]

# 查询用户积分详情
pnpm script:check-credits <email>

# 清空用户积分（慎用）
pnpm script:reset-credits <email> --confirm
```

---

## 脚本列表

### 1. add-credits.ts - 给用户增加积分

```bash
pnpm script:add-credits <email> <credits> [reason]
```

**示例：**
```bash
# 给用户增加 100 积分
pnpm script:add-credits user@example.com 100

# 给用户增加 500 积分，并注明原因
pnpm script:add-credits user@example.com 500 "管理员赠送"
```

**用途：**
- 管理员给自己增加测试积分
- 给用户补偿积分
- 特殊活动赠送积分

---

### 2. check-user-credits.ts - 查询用户积分详情

```bash
pnpm script:check-credits <email>
```

**示例：**
```bash
pnpm script:check-credits user@example.com
```

**输出内容：**
- 用户基本信息
- 所有积分包列表
- 总积分统计（总额、已用、冻结、可用）
- 最近 10 条交易记录

---

### 3. reset-user-credits.ts - 清空用户积分（慎用！）

```bash
pnpm script:reset-credits <email> --confirm
```

**示例：**
```bash
pnpm script:reset-credits user@example.com --confirm
```

**⚠️ 警告：**
- 此操作不可逆
- 会删除所有积分包和交易记录
- 必须添加 `--confirm` 标志才能执行

**用途：**
- 清理测试用户数据
- 重新初始化用户积分

---

## 环境变量

确保 `.env.local` 文件中配置了：

```env
# 数据库连接
DATABASE_URL=postgresql://...
POSTGRES_URL=postgresql://...

# 管理员邮箱（使用该邮箱登录自动成为管理员）
ADMIN_EMAIL="your-email@example.com"
```

---

## 首次使用

首次使用前需要安装依赖：

```bash
pnpm install
```

这会自动安装 `tsx` 运行时。

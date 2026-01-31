# VideoFly 邮件系统使用指南

本文档说明如何使用 VideoFly 的邮件系统，包括欢迎邮件、密码重置邮件和邮件预览功能。

## 快速开始

### 预览邮件模板

```bash
# 启动邮件预览服务器 (端口 3001)
pnpm run email:dev

# 访问预览页面
open http://localhost:3001/emails
```

预览服务器支持：
- 查看所有邮件模板的缩略图预览
- 点击查看完整大小的邮件
- 支持多种语言的模板预览
- 实时更新，修改代码后自动刷新

---

## 目录结构

```
src/lib/emails/
├── index.ts                    # 导出所有邮件模板和工具
├── utils.ts                    # 邮件工具函数
├── magic-link-email.tsx        # Magic Link 邮件（已存在）
├── welcome-email.tsx           # 欢迎邮件
├── reset-password-email.tsx    # 密码重置邮件
└── components/                 # 可重用邮件组件
    ├── index.ts
    ├── email-layout.tsx        # 邮件布局包装器
    ├── email-button.tsx        # CTA 按钮组件
    ├── email-header.tsx        # 邮件头部组件
    ├── email-footer.tsx        # 邮件底部组件
    └── email-section.tsx       # 内容区块组件

src/app/emails/                 # 邮件预览应用
├── page.tsx                    # 邮件模板列表页
└── [slug]/
    └── page.tsx                # 单个邮件模板预览页

src/messages/
├── en.json                     # 英文翻译
└── zh.json                     # 中文翻译
```

---

## 邮件模板

### 1. 欢迎邮件 (Welcome Email)

**用途**: 新用户注册后发送欢迎邮件

**翻译键** (`Emails.welcome`):
```json
{
  "subject": "邮件标题",
  "greeting": "Hi {name}",
  "title": "Welcome to VideoFly!",
  "body": "邮件正文",
  "features": "功能介绍标题",
  "featuresList": {
    "generate": "功能1",
    "models": "功能2",
    "share": "功能3"
  },
  "cta": "按钮文字",
  "footer": "底部说明",
  "copyright": "版权信息"
}
```

### 2. 密码重置邮件 (Reset Password)

**用途**: 用户请求重置密码时发送

**翻译键** (`Emails.resetPassword`):
```json
{
  "subject": "邮件标题",
  "greeting": "Hi {name}",
  "title": "Reset Your Password",
  "body": "邮件正文",
  "instruction": "操作说明",
  "button": "按钮文字",
  "validity": "链接有效期说明",
  "security": "安全提示",
  "ignore": "忽略说明",
  "footer": "底部说明",
  "copyright": "版权信息"
}
```

---

## 使用方法

### 在 Server Action 中使用

```typescript
// app/actions/auth.ts
"use server";

import { sendWelcomeEmail } from "@/lib/emails";

export async function registerUser(formData: FormData) {
  const email = formData.get("email") as string;
  const name = formData.get("name") as string;
  const locale = "en"; // 或从用户偏好获取

  // ... 创建用户逻辑 ...

  // 发送欢迎邮件
  const result = await sendWelcomeEmail({
    to: email,
    name: name,
    locale: locale,
  });

  if (!result.success) {
    console.error("Failed to send welcome email");
  }

  return { success: true };
}
```

### 在 API 路由中使用

```typescript
// app/api/send-welcome/route.ts
import { sendWelcomeEmail } from "@/lib/emails";

export async function POST(request: Request) {
  const { email, name, locale } = await request.json();

  const result = await sendWelcomeEmail({
    to: email,
    name: name,
    locale: locale || "en",
  });

  return Response.json(result);
}
```

### 发送密码重置邮件

```typescript
import { sendResetPasswordEmail } from "@/lib/emails";

async function handlePasswordReset(email: string, token: string, locale: string) {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;

  await sendResetPasswordEmail({
    to: email,
    name: user.name, // 可选
    resetUrl,
    locale: locale,
  });
}
```

---

## 添加新语言

### 1. 创建新的翻译文件

```bash
# 创建日文翻译
cp src/messages/en.json src/messages/ja.json

# 创建韩文翻译
cp src/messages/en.json src/messages/ko.json
```

### 2. 更新翻译内容

编辑 `src/messages/ja.json`:

```json
{
  "Emails": {
    "welcome": {
      "subject": "VideoFlyへようこそ！",
      "greeting": "{name}さん、",
      "title": "VideoFlyへようこそ！",
      "body": "VideoFlyにご登録いただき、ありがとうございます。",
      // ... 其他翻译
    },
    "resetPassword": {
      "subject": "パスワードをリセット",
      // ... 其他翻译
    }
  }
}
```

### 3. 更新路由配置

```typescript
// src/i18n/routing.ts
export const routing = {
  locales: ["en", "zh", "ja", "ko"],
  defaultLocale: "en",
  // ...
};
```

---

## 自定义邮件模板

### 修改邮件样式

所有邮件模板使用 React Email 组件，可以直接修改样式：

```tsx
// welcome-email.tsx
<Button
  style={{
    backgroundColor: "#007bff", // 修改按钮颜色
    borderRadius: "12px",       // 修改圆角
    padding: "16px 32px",        // 修改内边距
  }}
>
  {translations.cta}
</Button>
```

### 添加动态内容

```tsx
// props 中传入动态数据
interface WelcomeEmailProps {
  name: string;
  freeCredits?: number;  // 新增：免费积分数量
  translations: EmailTranslations;
}

// 在邮件中使用
{freeCredits && (
  <Text>
    You have {freeCredits} free credits to get started!
  </Text>
)}
```

---

## 邮件预览系统

VideoFly 提供了浏览器邮件预览功能，方便开发和测试邮件模板。

### 启动预览服务器

```bash
# 启动邮件预览服务器 (运行在端口 3001)
pnpm run email:dev
```

### 访问预览页面

1. **模板列表页**: `http://localhost:3001/emails`
   - 显示所有邮件模板的缩略图预览
   - 支持英文和中文模板
   - 点击查看完整预览

2. **单个模板预览**: `http://localhost:3001/emails/{slug}`
   - 完整尺寸的邮件预览
   - 顶部工具栏显示模板名称
   - 返回列表按钮

### 添加新的邮件模板到预览

1. 在 `src/app/emails/page.tsx` 中添加模板配置：

```typescript
const templates = [
  {
    id: "new-template-en",
    name: "New Template (English)",
    component: (
      <NewEmail
        name="John Doe"
        locale="en"
        translations={enTranslations.newTemplate}
        appUrl="https://videofly.app"
      />
    ),
  },
  // ... 更多模板
];
```

2. 在 `src/app/emails/[slug]/page.tsx` 中添加路由映射：

```typescript
const templateMap: Record<string, { name: string; component: React.ReactNode }> = {
  "new-template-en": {
    name: "New Template (English)",
    component: <NewEmail ... />,
  },
  // ... 更多模板
};
```

3. 在 `generateStaticParams()` 中添加新路由：

```typescript
export async function generateStaticParams() {
  return [
    { slug: "welcome-en" },
    { slug: "welcome-zh" },
    { slug: "new-template-en" },  // 新增
    // ... 更多路由
  ];
}
```

### 可重用邮件组件

预览系统包含可重用的邮件组件，位于 `src/lib/emails/components/`：

| 组件 | 用途 |
|------|------|
| `EmailLayout` | 邮件布局包装器，提供基础 HTML 结构 |
| `EmailButton` | CTA 按钮组件，支持 primary/secondary 样式 |
| `EmailHeader` | 邮件头部组件，显示品牌/Logo |
| `EmailFooter` | 邮件底部组件，包含版权和链接 |
| `EmailSection` | 内容区块组件 |
| `EmailText` | 段落文本组件 |
| `EmailHeading` | 标题组件，支持 3 个级别 |

使用示例：

```tsx
import { EmailLayout, EmailHeader, EmailButton, EmailFooter } from "@/lib/emails/components";

export const MyEmail = () => (
  <EmailLayout preview="Email Preview Text">
    <EmailHeader appName="VideoFly" />
    <EmailText>Email content here...</EmailText>
    <EmailButton href="https://videofly.app">Click Here</EmailButton>
    <EmailFooter appName="VideoFly" />
  </EmailLayout>
);
```

---

## 测试邮件

### 本地测试

```typescript
// 测试渲染邮件
import { renderWelcomeEmail } from "@/lib/emails";

const emailHtml = await renderWelcomeEmail({
  name: "John Doe",
  locale: "en",
});

console.log(emailHtml);
```

### 发送测试邮件

```typescript
// 使用环境变量指定测试邮箱
const TEST_EMAIL = "test@example.com";

await sendWelcomeEmail({
  to: TEST_EMAIL,
  name: "Test User",
  locale: "en",
});
```

---

## 邮件发送流程

```
┌─────────────────────────────────────────────┐
│              用户操作触发                       │
│  (注册 / 密码重置 / 其他事件)                   │
└─────────────────┬───────────────────────────┘
                  │
                  ↓
┌─────────────────────────────────────────────┐
│          Server Component / Action             │
│  - 获取用户信息和语言偏好                      │
│  - 调用邮件发送函数                          │
└─────────────────┬───────────────────────────┘
                  │
                  ↓
┌─────────────────────────────────────────────┐
│         sendWelcomeEmail / sendReset...        │
│  - 加载翻译文件                               │
│  - 渲染 React Email 模板                      │
│  - 通过 Resend API 发送                       │
└─────────────────┬───────────────────────────┘
                  │
                  ↓
┌─────────────────────────────────────────────┐
│               Resend Service                  │
│  - 发送邮件到用户邮箱                           │
│  - 返回发送结果                               │
└─────────────────────────────────────────────┘
```

---

## API 参考

### sendWelcomeEmail()

```typescript
function sendWelcomeEmail(props: {
  to: string;          // 收件人邮箱
  name?: string;       // 用户名
  locale?: string;      // 语言代码，默认 "en"
}): Promise<{
  success: boolean;
  error?: unknown;
}>
```

### sendResetPasswordEmail()

```typescript
function sendResetPasswordEmail(props: {
  to: string;          // 收件人邮箱
  name?: string;       // 用户名
  resetUrl: string;    // 重置密码链接
  locale?: string;      // 语言代码，默认 "en"
}): Promise<{
  success: boolean;
  error?: unknown;
}>
```

### getEmailTranslations()

```typescript
function getEmailTranslations(
  locale: string
): Promise<EmailTranslations>
```

---

## 环境变量

确保以下环境变量已配置：

```bash
# .env.local
RESEND_API_KEY="re_xxxxxxxxxxxxx"
RESEND_FROM="noreply@yourdomain.com"
NEXT_PUBLIC_APP_URL="https://videofly.app"
```

---

## 相关文档

- [Resend 官方文档](https://resend.com/docs/send-with-nextjs)
- [React Email 文档](https://react.email/)
- [next-intl 文档](https://next-intl-docs.vercel.app/)

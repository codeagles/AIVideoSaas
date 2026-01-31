# VideoFly 组件使用规范

> AI 辅助开发参考文档 | 最后更新: 2026-01-20

---

## 组件总览

```
src/components/
├── ui/              # shadcn/ui 基础组件 (55)
├── magicui/         # Magic UI 动画组件 (36)
├── animate-ui/      # Animate UI 动画组件 (6)
├── video-generator/ # 视频生成业务组件 (3)
├── price/           # 定价组件 (5)
├── k8s/             # K8s 组件 (4)
├── docs/            # 文档组件 (4)
├── blog/            # 博客组件 (1)
├── content/         # MDX 组件 (3)
└── (根目录)          # 通用组件 (33)

总计: 150 个组件
```

---

## 导入规范

```tsx
// UI 基础组件 - 从 @/components/ui 导入
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog } from "@/components/ui/dialog";
import { toast } from "sonner";

// Magic UI 动画组件
import { BlurFade } from "@/components/magicui/blur-fade";
import { ShimmerButton } from "@/components/magicui/shimmer-button";
import { HyperText } from "@/components/magicui/hyper-text";
import { Confetti, fireConfetti } from "@/components/magicui/confetti";

// Animate UI 组件
import { CountingNumber } from "@/components/animate-ui/counting-number";
import { Writing } from "@/components/animate-ui/writing";

// 业务组件 - 从各自目录导入
import { VideoGeneratorInput } from "@/components/video-generator";
import { ClusterOperations } from "@/components/k8s/cluster-operation";
import { CreemPricing } from "@/components/price/creem-pricing";
import { DashboardShell } from "@/components/shell";
```

---

## UI 基础组件 (`@/components/ui`)

### 表单组件
| 组件 | 文件 | 用途 |
|------|------|------|
| Button | button.tsx | 按钮 |
| Input | input.tsx | 输入框 |
| Label | label.tsx | 标签 |
| Checkbox | checkbox.tsx | 复选框 |
| Switch | switch.tsx | 开关 |
| Select | select.tsx | 下拉选择 |
| Slider | slider.tsx | 滑块 |
| RadioGroup | radio-group.tsx | 单选组 |
| Calendar | calendar.tsx | 日历选择器 |
| Form | form.tsx | 表单组件 |

### 弹窗/浮层
| 组件 | 文件 |
|------|------|
| Dialog | dialog.tsx |
| AlertDialog | alert-dialog.tsx |
| Sheet | sheet.tsx |
| Drawer | drawer.tsx |
| Popover | popover.tsx |
| DropdownMenu | dropdown-menu.tsx |
| Tooltip | tooltip.tsx |
| Command | command.tsx |

### 展示组件
| 组件 | 文件 |
|------|------|
| Card | card.tsx |
| Table | table.tsx |
| DataTable | data-table.tsx |
| Tabs | tabs.tsx |
| Accordion | accordion.tsx |
| Avatar | avatar.tsx |
| Badge | badge.tsx |
| Skeleton | skeleton.tsx |
| ScrollArea | scroll-area.tsx |
| Separator | separator.tsx |

### 反馈组件
| 组件 | 文件 |
|------|------|
| Sonner (Toast) | sonner.tsx |
| Alert | alert.tsx |
| Callout | callout.tsx |
| Progress | progress.tsx |
| Spinner | spinner.tsx |

### 导航组件
| 组件 | 文件 |
|------|------|
| Breadcrumb | breadcrumb.tsx |
| Pagination | pagination.tsx |

---

## Magic UI 动画组件 (`@/components/magicui`)

### 按钮动画
| 组件 | 用途 |
|------|------|
| ShimmerButton | 闪光按钮 |
| ShinyButton | 发光按钮 |
| RippleButton | 涟漪按钮 |
| PulsatingButton | 脉动按钮 |
| RainbowButton | 彩虹渐变按钮 |
| AnimatedSubscribeButton | 订阅按钮动画 |
| InteractiveHoverButton | 交互悬停按钮 |

### 文字动画
| 组件 | 用途 |
|------|------|
| HyperText | 超级文字动画 |
| MorphingText | 变形文字动画 |
| FlipText | 翻转文字动画 |
| WordRotate | 单词轮播 |
| AnimatedShinyText | 闪光文字效果 |
| AnimatedGradientText | 渐变文字动画 |
| SparklesText | 星光文字效果 |
| TypingAnimation | 打字动画 |

### 容器动画
| 组件 | 用途 |
|------|------|
| BoxReveal | 盒子揭示动画 |
| NumberTicker | 数字滚动动画 |
| MagicCard | 魔法卡片 |
| BentoGrid | 便当网格布局 |
| AvatarCircles | 头像圆圈堆叠 |
| AnimatedList | 交错动画列表 |
| VelocityScroll | 速度滚动文字 |
| AnimatedBeam | 连接线动画 |

### 背景效果
| 组件 | 用途 |
|------|------|
| Marquee | 滚动字幕 |
| Meteors | 流星效果 |
| AnimatedGridPattern | 动画网格背景 |
| DotPattern | 点阵图案 |
| GridPattern | 网格图案 |
| InteractiveGridPattern | 交互式网格 |
| Ripple | 涟漪背景效果 |

### 其他
| 组件 | 用途 |
|------|------|
| BlurFade | 模糊淡入动画 |
| BorderBeam | 边框光束动画 |
| Confetti | 庆祝烟花效果 |
| HeroVideoDialog | 视频预览对话框 |
| TweetCard | Twitter 卡片 |

---

## Animate UI 组件 (`@/components/animate-ui`)

| 组件 | 用途 |
|------|------|
| CountingNumber | 数字计数动画 |
| SlidingNumber | 数字滑动动画 |
| Writing | 书写动画 |
| Typing | 打字动画 |
| Highlight | 高亮动画 |
| Flip | 翻转按钮 |
| Gradient | 渐变背景动画 |

---

## Toast 使用规范

项目使用 **Sonner** 作为 Toast 通知系统：

```tsx
import { toast } from "sonner";

// 成功
toast.success("Success", {
  description: "Operation completed successfully!",
});

// 错误
toast.error("Error", {
  description: "Something went wrong.",
});

// 信息
toast.info("Info", {
  description: "This is an info message.",
});

// 加载中
toast.loading("Loading...", {
  description: "Please wait...",
});

// Promise 自动处理
toast.promise(uploadFile(), {
  loading: "Uploading...",
  success: "Uploaded successfully!",
  error: "Upload failed!",
});
```

---

## 组件使用原则

1. **优先使用基础组件** - UI 文件夹的组件经过充分测试
2. **动画适度使用** - Magic UI 组件用于提升体验，不要过度使用
3. **业务组件独立** - video-generator、price、k8s 等业务组件按需导入
4. **样式通过 className** - 所有组件支持 Tailwind className 覆盖

---

## 技术栈说明

- **Radix UI**: 底层无样式的可访问性组件
- **Tailwind CSS**: 样式系统
- **Framer Motion**: 动画引擎
- **shadcn/ui**: Radix UI + Tailwind CSS 的组件集合（复制粘贴模式）

项目使用 shadcn/ui 模式：组件代码复制到项目中，可直接修改。

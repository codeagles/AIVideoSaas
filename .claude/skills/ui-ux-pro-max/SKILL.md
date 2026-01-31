---
name: ui-ux-pro-max
description: "UI/UX 设计智能系统。50+ 风格, 21+ 配色, 50+ 字体搭配, 20+ 图表, 9+ 技术栈 (React, Next.js, Vue, Svelte, SwiftUI, React Native, Flutter, Tailwind, shadcn/ui, VideoFly)。动作: 规划、构建、创建、设计、实现、审查、修复、改进、优化、增强、重构、检查 UI/UX 代码。项目类型: 网站、落地页、仪表板、管理面板、电商、SaaS、作品集、博客、移动应用、.html、.tsx、.vue、.svelte。元素: 按钮、模态框、导航栏、侧边栏、卡片、表格、表单、图表。风格: 玻璃态、粘土态、极简、野兽派、新拟态、便当网格、深色模式、响应式、拟物化、扁平化。主题: 配色方案、可访问性、动画、布局、排版、字体搭配、间距、悬停、阴影、渐变。集成: shadcn/ui MCP 组件搜索、VideoFly 组件库 (Magic UI 36+, Animate UI 6+)。**语言: 所有回复和对话必须使用中文**。"
---

# UI/UX Pro Max - 设计智能系统

全面的 Web 和移动应用设计指南。包含 50+ 风格、97 种配色方案、57 种字体搭配、99 条 UX 准则和 25 种图表类型，覆盖 9+ 技术栈的可搜索数据库，具有基于优先级的推荐功能。

**VideoFly 项目默认**: Next.js 15 + React 19 + Magic UI + Animate UI + Tailwind CSS v4

**语言设置**: 所有回复、解释、代码注释和对话必须使用**中文**

---

## 语言使用规范

**重要**: 使用此技能时，所有输出必须使用中文：

- ✅ 所有设计建议和解释使用中文
- ✅ 所有代码注释使用中文
- ✅ 所有 UX 准则说明使用中文
- ✅ 所有对话和交流使用中文
- ❌ 不要使用英文进行设计说明或对话

## 何时应用

在以下场景参考本指南：
- 设计新的 UI 组件或页面
- 选择配色方案和排版
- 审查代码的 UX 问题
- 构建落地页或仪表板
- 实现可访问性要求

## 规则分类（按优先级）

| 优先级 | 分类 | 影响 | 领域 |
|--------|--------|--------|------|
| 1 | 可访问性 | 关键 | `ux` |
| 2 | 触摸与交互 | 关键 | `ux` |
| 3 | 性能 | 高 | `ux` |
| 4 | 布局与响应式 | 高 | `ux` |
| 5 | 排版与颜色 | 中 | `typography`, `color` |
| 6 | 动画 | 中 | `ux` |
| 7 | 风格选择 | 中 | `style`, `product` |
| 8 | 图表与数据 | 低 | `chart` |

## 快速参考

### 1. 可访问性（关键）

- `color-contrast` - 普通文本最小对比度 4.5:1
- `focus-states` - 交互元素可见焦点环
- `alt-text` - 有意义图片的描述性 alt 文本
- `aria-labels` - 纯图标按钮使用 aria-label
- `keyboard-nav` - Tab 顺序与视觉顺序一致
- `form-labels` - 使用带 for 属性的 label

### 2. 触摸与交互（关键）

- `touch-target-size` - 最小 44x44px 触摸目标
- `hover-vs-tap` - 主要交互使用点击/轻触
- `loading-buttons` - 异步操作期间禁用按钮
- `error-feedback` - 在问题附近显示错误信息
- `cursor-pointer` - 为可点击元素添加 cursor-pointer

### 3. 性能（高）

- `image-optimization` - 使用 WebP、srcset、懒加载
- `reduced-motion` - 检查 prefers-reduced-motion
- `content-jumping` - 为异步内容预留空间

### 4. 布局与响应式（高）

- `viewport-meta` - width=device-width initial-scale=1
- `readable-font-size` - 移动端最小 16px 正文
- `horizontal-scroll` - 确保内容适应视口宽度
- `z-index-management` - 定义 z-index 比例 (10, 20, 30, 50)

### 5. 排版与颜色（中）

- `line-height` - 正文使用 1.5-1.75
- `line-length` - 每行限制 65-75 个字符
- `font-pairing` - 匹配标题/正文字体风格

### 6. 动画（中）

- `duration-timing` - 微交互使用 150-300ms
- `transform-performance` - 使用 transform/opacity，而非 width/height
- `loading-states` - 骨架屏或加载指示器

### 7. 风格选择（中）

- `style-match` - 风格与产品类型匹配
- `consistency` - 所有页面使用相同风格
- `no-emoji-icons` - 使用 SVG 图标，而非 emoji

### 8. 图表与数据（低）

- `chart-type` - 图表类型与数据类型匹配
- `color-guidance` - 使用可访问的配色方案
- `data-table` - 提供表格替代方案以确保可访问性

## 如何使用

使用下面的 CLI 工具搜索特定领域。

---

## Prerequisites

Check if Python is installed:

```bash
python3 --version || python --version
```

If Python is not installed, install it based on user's OS:

**macOS:**
```bash
brew install python3
```

**Ubuntu/Debian:**
```bash
sudo apt update && sudo apt install python3
```

**Windows:**
```powershell
winget install Python.Python.3.12
```

---

## How to Use This Skill

When user requests UI/UX work (design, build, create, implement, review, fix, improve), follow this workflow:

### Step 1: Analyze User Requirements

Extract key information from user request:
- **Product type**: SaaS, e-commerce, portfolio, dashboard, landing page, etc.
- **Style keywords**: minimal, playful, professional, elegant, dark mode, etc.
- **Industry**: healthcare, fintech, gaming, education, etc.
- **Stack**: React, Vue, Next.js, or default to **`videofly`** for VideoFly project

### Step 2: Generate Design System (REQUIRED)

**Always start with `--design-system`** to get comprehensive recommendations with reasoning:

```bash
python3 .claude/skills/ui-ux-pro-max/scripts/search.py "<product_type> <industry> <keywords>" --design-system [-p "Project Name"]
```

This command:
1. Searches 5 domains in parallel (product, style, color, landing, typography)
2. Applies reasoning rules from `ui-reasoning.csv` to select best matches
3. Returns complete design system: pattern, style, colors, typography, effects
4. Includes anti-patterns to avoid

**Example:**
```bash
python3 .claude/skills/ui-ux-pro-max/scripts/search.py "beauty spa wellness service" --design-system -p "Serenity Spa"
```

### Step 2b: Persist Design System (Master + Overrides Pattern)

To save the design system for **hierarchical retrieval across sessions**, add `--persist`:

```bash
python3 .claude/skills/ui-ux-pro-max/scripts/search.py "<query>" --design-system --persist -p "Project Name"
```

This creates:
- `design-system/MASTER.md` — Global Source of Truth with all design rules
- `design-system/pages/` — Folder for page-specific overrides

**With page-specific override:**
```bash
python3 .claude/skills/ui-ux-pro-max/scripts/search.py "<query>" --design-system --persist -p "Project Name" --page "dashboard"
```

This also creates:
- `design-system/pages/dashboard.md` — Page-specific deviations from Master

### Step 3: Supplement with Detailed Searches (as needed)

After getting the design system, use domain searches to get additional details:

```bash
python3 .claude/skills/ui-ux-pro-max/scripts/search.py "<keyword>" --domain <domain> [-n <max_results>]
```

**When to use detailed searches:**

| Need | Domain | Example |
|------|--------|---------|
| More style options | `style` | `--domain style "glassmorphism dark"` |
| Chart recommendations | `chart` | `--domain chart "real-time dashboard"` |
| UX best practices | `ux` | `--domain ux "animation accessibility"` |
| Alternative fonts | `typography` | `--domain typography "elegant luxury"` |
| Landing structure | `landing` | `--domain landing "hero social-proof"` |

### Step 4: Stack Guidelines (Default: videofly)

Get implementation-specific best practices. If working on **VideoFly project**, default to **`videofly`** stack:

```bash
python3 .claude/skills/ui-ux-pro-max/scripts/search.py "<keyword>" --stack videofly
```

**Available stacks:**
- `videofly` - **VideoFly default** (Next.js 15 + React 19 + Magic UI + Animate UI + Tailwind CSS v4)
- `nextjs` - Next.js best practices
- `html-tailwind` - Tailwind utilities (generic)
- `react` - React patterns
- `vue`, `svelte`, `swiftui`, `react-native`, `flutter`, `shadcn`, `jetpack-compose`

---

## Search Reference

### Available Domains

| Domain | Use For | Example Keywords |
|--------|---------|------------------|
| `product` | Product type recommendations | SaaS, e-commerce, portfolio, healthcare, beauty, service |
| `style` | UI styles, colors, effects | glassmorphism, minimalism, dark mode, brutalism |
| `typography` | Font pairings, Google Fonts | elegant, playful, professional, modern |
| `color` | Color palettes by product type | saas, ecommerce, healthcare, beauty, fintech, service |
| `landing` | Page structure, CTA strategies | hero, hero-centric, testimonial, pricing, social-proof |
| `chart` | Chart types, library recommendations | trend, comparison, timeline, funnel, pie |
| `ux` | Best practices, anti-patterns | animation, accessibility, z-index, loading |
| `react` | React/Next.js performance | waterfall, bundle, suspense, memo, rerender, cache |
| `web` | Web interface guidelines | aria, focus, keyboard, semantic, virtualize |
| `prompt` | AI prompts, CSS keywords | (style name) |

### Available Stacks

| Stack | Focus |
|-------|-------|
| `videofly` | **VideoFly**: Next.js 15 + React 19 + Magic UI + Animate UI + Tailwind v4 |
| `nextjs` | Next.js SSR, routing, images, API routes |
| `html-tailwind` | Tailwind utilities, responsive, a11y (generic) |
| `react` | React state, hooks, performance, patterns |
| `shadcn` | shadcn/ui components, theming, forms, patterns |
| `vue` | Vue Composition API, Pinia, Vue Router |
| `svelte` | Svelte Runes, stores, SvelteKit |
| `swiftui` | SwiftUI Views, State, Navigation, Animation |
| `react-native` | React Native Components, Navigation, Lists |
| `flutter` | Flutter Widgets, State, Layout, Theming |
| `jetpack-compose` | Compose Composables, Modifiers, State Hoisting |

---

## VideoFly Component Library

When building for VideoFly project, **prioritize existing components**:

### Import Path
```tsx
// UI 基础组件 - 从 @/components/ui 导入
import { Button, Card, Input, Badge } from "@/components/ui";

// Magic UI 动画组件 - 优先使用
import { BlurFade, ShimmerButton, HyperText, Confetti } from "@/components/magicui";
import { fireConfetti } from "@/components/magicui/confetti";

// Animate UI 组件 - 数字/文字动画
import { CountingNumber, Writing, Typing } from "@/components/animate-ui";

// Toast - 使用 Sonner
import { toast } from "sonner";
```

### Component Categories

**UI 基础** (55 个): Button, Input, Card, Dialog, Sheet, Form, Table, Tabs, Accordion, Select, Slider, Badge, Progress, Spinner, Sonner (Toast), etc.

**Magic UI** (36 个):
- **按钮**: ShimmerButton, ShinyButton, RippleButton, PulsatingButton, RainbowButton
- **文字**: HyperText, MorphingText, FlipText, WordRotate, AnimatedShinyText, SparklesText, TypingAnimation
- **容器**: BoxReveal, NumberTicker, MagicCard, BentoGrid, AvatarCircles, AnimatedList, VelocityScroll, AnimatedBeam
- **背景**: Marquee, Meteors, AnimatedGridPattern, DotPattern, GridPattern, InteractiveGridPattern, Ripple
- **其他**: BlurFade, BorderBeam, Confetti, HeroVideoDialog

**Animate UI** (6 个): CountingNumber, SlidingNumber, Writing, Typing, Highlight, Flip, Gradient

---

## Example Workflow (VideoFly Project)

**User request:** "创建视频生成页面的 UI"

### Step 1: Analyze Requirements
- Product type: AI video generation SaaS
- Style keywords: modern, tech-focused, animated
- Stack: videofly (default)

### Step 2: Generate Design System

```bash
python3 .claude/skills/ui-ux-pro-max/scripts/search.py "AI video generation SaaS modern tech" --design-system -p "VideoFly"
```

### Step 3: Get Stack Guidelines

```bash
python3 .claude/skills/ui-ux-pro-max/scripts/search.py "form validation loading" --stack videofly
```

### Step 4: Implement with VideoFly Components

```tsx
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BlurFade } from "@/components/magicui/blur-fade";
import { ShimmerButton } from "@/components/magicui/shimmer-button";
import { HyperText } from "@/components/magicui/hyper-text";
import { toast } from "sonner";

// Use existing components, don't create new ones
export function VideoGeneratorPage() {
  return (
    <div className="container mx-auto py-8">
      <BlurFade>
        <HyperText text="AI Video Generator" />
      </BlurFade>
      <Card>
        {/* ... */}
      </Card>
      <ShimmerButton onClick={() => toast.success("Video generated!")}>
        Generate
      </ShimmerButton>
    </div>
  );
}
```

---

## Output Formats

The `--design-system` flag supports two output formats:

```bash
# ASCII box (default) - best for terminal display
python3 .claude/skills/ui-ux-pro-max/scripts/search.py "fintech crypto" --design-system

# Markdown - best for documentation
python3 .claude/skills/ui-ux-pro-max/scripts/search.py "fintech crypto" --design-system -f markdown
```

---

## 获取更好结果的技巧

1. **使用具体的关键词** - "医疗健康 SaaS 仪表板" > "应用"
2. **多次搜索** - 不同的关键词会揭示不同的见解
3. **结合多个领域** - 风格 + 排版 + 颜色 = 完整的设计系统
4. **始终检查 UX** - 搜索 "animation"、"z-index"、"accessibility" 了解常见问题
5. **使用栈标志** - 获取特定实现的最佳实践
6. **对于 VideoFly** - 始终先检查现有组件，使用 `--stack videofly`

---

## 专业 UI 的通用规则

这些经常被忽视的问题会让 UI 看起来不专业：

### 图标与视觉元素

| 规则 | 做 | 不要 |
|------|----|----- |
| **不使用 emoji 图标** | 使用 SVG 图标 (Heroicons, Lucide, Simple Icons) | 使用 🎨 🚀 ⚙️ 等 emoji 作为 UI 图标 |
| **稳定的悬停状态** | 悬停时使用颜色/透明度过渡 | 使用导致布局偏移的缩放变换 |
| **一致的图标尺寸** | 使用固定 viewBox (24x24) 和 w-6 h-6 | 随机混合不同的图标尺寸 |

### 交互与光标

| 规则 | 做 | 不要 |
|------|----|----- |
| **光标指针** | 为所有可点击/悬停的卡片添加 `cursor-pointer` | 交互元素保留默认光标 |
| **悬停反馈** | 提供视觉反馈（颜色、阴影、边框） | 没有指示元素可交互 |
| **平滑过渡** | 使用 `transition-colors duration-200` | 瞬间状态变化或太慢 (>500ms) |

### 亮/暗模式对比度

| 规则 | 做 | 不要 |
|------|----|----- |
| **亮模式玻璃卡片** | 使用 `bg-white/80` 或更高不透明度 | 使用 `bg-white/10`（太透明） |
| **亮模式文字对比** | 使用 `#0F172A` (slate-900) 作为文字颜色 | 使用 `#94A3B8` (slate-400) 作为正文颜色 |
| **边框可见性** | 亮模式使用 `border-gray-200` | 使用 `border-white/10`（不可见） |

---

## 交付前检查清单

交付 UI 代码之前，验证这些项目：

### 视觉质量
- [ ] 不使用 emoji 作为图标（改用 SVG）
- [ ] 所有图标来自一致的图标集 (Heroicons/Lucide)
- [ ] 悬停状态不会导致布局偏移
- [ ] 直接使用主题颜色（bg-primary）而非 var() 包装器

### 交互
- [ ] 所有可点击元素都有 `cursor-pointer`
- [ ] 悬停状态提供清晰的视觉反馈
- [ ] 过渡平滑（150-300ms）
- [ ] 键盘导航可见焦点状态

### 亮/暗模式
- [ ] 亮模式文字有足够对比度（最少 4.5:1）
- [ ] 亮模式下玻璃/透明元素可见
- [ ] 两种模式下边框都可见

### 布局
- [ ] 浮动元素与边缘有适当间距
- [ ] 没有内容隐藏在固定导航栏后面
- [ ] 在 375px、768px、1024px、1440px 响应式
- [ ] 移动端无横向滚动

### 可访问性
- [ ] 所有图片都有 alt 文本
- [ ] 表单输入有标签
- [ ] 颜色不是唯一的指示器
- [ ] 尊重 `prefers-reduced-motion`

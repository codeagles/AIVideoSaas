// ============================================
// 导航配置
// 统一管理所有导航菜单项
// ============================================

export interface NavItem {
  id: string;
  title: string;
  href: string;
  icon?: string; // Lucide 图标名称
  badge?: string; // 标签文字，如 "New", "Beta"
  requiresAuth?: boolean; // 是否需要登录
}

export interface NavGroup {
  id: string;
  title?: string; // 分组标题（可选）
  items: NavItem[];
}

// 左侧导航菜单 (工具页和管理页使用)
export const sidebarNavigation: NavGroup[] = [
  {
    id: "video",
    title: "VIDEO",
    items: [
      {
        id: "txt2vid",
        title: "Text to Video",
        href: "/text-to-video",
        icon: "Type",
      },
      {
        id: "img2vid",
        title: "Image to Video",
        href: "/image-to-video",
        icon: "ImagePlay",
      },
      {
        id: "ref2vid",
        title: "Reference Video",
        href: "/reference-to-video",
        icon: "Video",
      },
    ],
  },
  // 未来 IMAGE 分组扩展示例
  // {
  //   id: "image",
  //   title: "IMAGE",
  //   items: [
  //     { id: "txt2img", title: "Text to Image", href: "/text-to-image", icon: "Image" },
  //   ],
  // },
  {
    id: "user",
    items: [
      {
        id: "creations",
        title: "My Creations",
        href: "/my-creations",
        icon: "FolderOpen",
        requiresAuth: true,
      },
    ],
  },
  {
    id: "account",
    items: [
      {
        id: "credits",
        title: "Credits",
        href: "/credits",
        icon: "Gem",
      },
      {
        id: "settings",
        title: "Account",
        href: "/settings",
        icon: "User",
        requiresAuth: true,
      },
    ],
  },
];

// 落地页顶部导航 - Models 下拉菜单
export const headerModels = [
  { id: "sora", title: "Sora 2", subtitle: "by OpenAI", href: "/sora-2" },
  { id: "veo", title: "Veo 3.1", subtitle: "by Google", href: "/veo-3-1" },
  {
    id: "seedance",
    title: "Seedance 1.5",
    subtitle: "by ByteDance",
    href: "/seedance-1-5",
  },
  { id: "wan", title: "Wan 2.6", subtitle: "by Alibaba", href: "/wan-2-6" },
];

// 落地页顶部导航 - Tools 下拉菜单
export const headerTools = [
  {
    id: "txt2vid",
    title: "Text to Video",
    href: "/text-to-video",
    icon: "Type",
  },
  {
    id: "img2vid",
    title: "Image to Video",
    href: "/image-to-video",
    icon: "ImagePlay",
  },
  {
    id: "ref2vid",
    title: "Reference to Video",
    href: "/reference-to-video",
    icon: "Video",
  },
];

// 落地页顶部导航 - 文档链接
export const headerDocs = {
  id: "docs",
  title: "Docs",
  href: "https://docs.videofly.app",
  external: true,
};

// 用户菜单项 (HeaderSimple 组件使用)
export const userMenuItems = [
  { id: "creations", title: "My Creations", href: "/my-creations", icon: "FolderOpen" },
  { id: "credits", title: "Credits", href: "/credits", icon: "Gem" },
  { id: "settings", title: "Account", href: "/settings", icon: "User" },
];

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/components/ui";
import {
  LayoutDashboard,
  Users,
  BarChart3,
  Settings,
  ArrowLeft,
} from "@/components/ui/icons";

interface AdminSidebarProps {
  locale: string;
}

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Users",
    href: "/admin/users",
    icon: Users,
  },
  {
    title: "Analytics",
    href: "/admin/analytics",
    icon: BarChart3,
  },
  {
    title: "Settings",
    href: "/admin/settings",
    icon: Settings,
  },
];

export function AdminSidebar({ locale }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r bg-card">
      <div className="flex h-full flex-col">
        {/* Brand */}
        <div className="flex h-16 items-center border-b px-6">
          <Link href={`/${locale}/admin`} className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <span className="text-sm font-bold text-primary-foreground">A</span>
            </div>
            <span className="text-lg font-semibold">Admin</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-4">
          {navItems.map((item) => {
            // 规范化路径进行比较（移除尾部斜杠）
            const normalizedPathname = pathname.replace(/\/$/, "");
            const normalizedHref = `/${locale}${item.href}`.replace(/\/$/, "");
            const isActive = normalizedPathname === normalizedHref || normalizedPathname.startsWith(`${normalizedHref}/`);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={`/${locale}${item.href}`}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <Icon className="h-4 w-4" />
                {item.title}
              </Link>
            );
          })}
        </nav>

        {/* Back to App */}
        <div className="border-t p-4">
          <Link
            href={`/${locale}/dashboard`}
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to App
          </Link>
        </div>
      </div>
    </aside>
  );
}

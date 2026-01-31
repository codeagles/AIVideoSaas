import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings, FileText, ExternalLink } from "@/components/ui/icons";

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">系统设置</h1>
        <p className="text-muted-foreground">
          配置系统参数和积分规则
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Pricing Config */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              积分与定价配置
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              修改积分包价格、订阅计划、AI 模型定价等配置
            </p>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">配置文件</span>
                <code className="text-xs bg-muted px-2 py-1 rounded">
                  src/config/pricing-user.ts
                </code>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">自动重载</span>
                <span className="text-green-600">✓ 支持</span>
              </div>
            </div>
            <Button asChild className="w-full">
              <a href="https://docs.videofly.app" target="_blank" rel="noopener noreferrer">
                <FileText className="h-4 w-4 mr-2" />
                查看配置文档
                <ExternalLink className="h-4 w-4 ml-2" />
              </a>
            </Button>
          </CardContent>
        </Card>

        {/* Admin Email */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              管理员邮箱配置
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              在 .env.local 中配置 ADMIN_EMAIL，该邮箱登录后将自动获得管理员权限
            </p>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">环境变量</span>
                <code className="text-xs bg-muted px-2 py-1 rounded">
                  ADMIN_EMAIL
                </code>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">自动设置</span>
                <span className="text-green-600">✓ 支持</span>
              </div>
            </div>
            <Button asChild variant="outline" className="w-full">
              <a href="https://docs.videofly.app" target="_blank" rel="noopener noreferrer">
                <FileText className="h-4 w-4 mr-2" />
                查看快速开始
                <ExternalLink className="h-4 w-4 ml-2" />
              </a>
            </Button>
          </CardContent>
        </Card>

        {/* Credit Scripts */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>积分管理脚本</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <h3 className="font-medium text-sm">添加积分</h3>
                <code className="block text-xs bg-muted p-2 rounded">
                  pnpm script:add-credits &lt;email&gt; &lt;credits&gt;
                </code>
              </div>
              <div className="space-y-2">
                <h3 className="font-medium text-sm">查询积分</h3>
                <code className="block text-xs bg-muted p-2 rounded">
                  pnpm script:check-credits &lt;email&gt;
                </code>
              </div>
              <div className="space-y-2">
                <h3 className="font-medium text-sm">重置积分</h3>
                <code className="block text-xs bg-muted p-2 rounded">
                  pnpm script:reset-credits &lt;email&gt;
                </code>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

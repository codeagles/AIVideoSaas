import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3 } from "@/components/ui/icons";

export default function AdminAnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">数据分析</h1>
        <p className="text-muted-foreground">
          查看详细的数据分析和趋势
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            即将推出
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            详细的数据分析功能正在开发中。敬请期待！
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

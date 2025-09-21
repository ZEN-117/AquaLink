import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Shield, BarChart3, FileText, Activity, AlertTriangle } from "lucide-react";

const AdminOverview = () => {
  const stats = [
    { title: "Total Users", value: "1,247", change: "+12%", icon: Users, color: "text-blue-600" },
    { title: "Active Sessions", value: "342", change: "+5%", icon: Activity, color: "text-green-600" },
    { title: "Security Alerts", value: "3", change: "-2", icon: AlertTriangle, color: "text-red-600" },
    { title: "System Health", value: "98.5%", change: "+0.2%", icon: BarChart3, color: "text-purple-600" },
  ];

  const recentActivity = [
    { action: "New user registration", user: "john.doe@email.com", time: "2 minutes ago", type: "user" },
    { action: "Security policy updated", user: "admin", time: "15 minutes ago", type: "security" },
    { action: "System backup completed", user: "system", time: "1 hour ago", type: "system" },
    { action: "Content moderation review", user: "moderator", time: "2 hours ago", type: "content" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage your system, users, and security settings</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="border-aqua/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                <span className={stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}>
                  {stat.change}
                </span>
                {" "}from last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Activity */}
        <Card className="border-aqua/10">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest system and user activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{activity.action}</p>
                    <p className="text-xs text-muted-foreground">{activity.user}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={activity.type === 'security' ? 'destructive' : 'secondary'}>
                      {activity.type}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{activity.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="border-aqua/10">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              <div className="flex items-center justify-between p-3 border border-aqua/10 rounded-lg hover:bg-accent/50 cursor-pointer transition-colors">
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-blue-600" />
                  <span className="font-medium">Manage Users</span>
                </div>
                <span className="text-xs text-muted-foreground">1,247 users</span>
              </div>
              <div className="flex items-center justify-between p-3 border border-aqua/10 rounded-lg hover:bg-accent/50 cursor-pointer transition-colors">
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-red-600" />
                  <span className="font-medium">Security Settings</span>
                </div>
                <span className="text-xs text-muted-foreground">3 alerts</span>
              </div>
              <div className="flex items-center justify-between p-3 border border-aqua/10 rounded-lg hover:bg-accent/50 cursor-pointer transition-colors">
                <div className="flex items-center gap-3">
                  <BarChart3 className="h-5 w-5 text-purple-600" />
                  <span className="font-medium">View Analytics</span>
                </div>
                <span className="text-xs text-muted-foreground">Real-time</span>
              </div>
              <div className="flex items-center justify-between p-3 border border-aqua/10 rounded-lg hover:bg-accent/50 cursor-pointer transition-colors">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-green-600" />
                  <span className="font-medium">Content Management</span>
                </div>
                <span className="text-xs text-muted-foreground">42 pending</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminOverview;
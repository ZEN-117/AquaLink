import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, AlertTriangle, Key, Lock, Eye, Activity } from "lucide-react";

const SecuritySettings = () => {
  const securityAlerts = [
    { level: "high", message: "Multiple failed login attempts detected", time: "2 minutes ago", source: "192.168.1.105" },
    { level: "medium", message: "Unusual login location: New York, US", time: "1 hour ago", source: "user@example.com" },
    { level: "low", message: "Password policy updated", time: "3 hours ago", source: "admin" },
  ];

  const securitySettings = [
    { name: "Two-Factor Authentication", description: "Require 2FA for all admin accounts", enabled: true },
    { name: "Password Complexity", description: "Enforce strong password requirements", enabled: true },
    { name: "Session Timeout", description: "Auto-logout after 30 minutes of inactivity", enabled: true },
    { name: "IP Whitelist", description: "Restrict access to approved IP addresses", enabled: false },
    { name: "Login Notifications", description: "Send email alerts for new logins", enabled: true },
    { name: "Audit Logging", description: "Log all admin actions", enabled: true },
  ];

  const getAlertColor = (level) => {
    switch (level) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  const getAlertIcon = (level) => {
    switch (level) {
      case 'high': return <AlertTriangle className="h-4 w-4" />;
      case 'medium': return <Eye className="h-4 w-4" />;
      case 'low': return <Activity className="h-4 w-4" />;
      default: return <Shield className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Security Settings</h1>
        <p className="text-muted-foreground">Manage system security and monitor threats</p>
      </div>

      {/* Security Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-aqua/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Security Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">95%</div>
            <p className="text-xs text-muted-foreground">Excellent security</p>
          </CardContent>
        </Card>
        <Card className="border-aqua/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Threats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">3</div>
            <p className="text-xs text-muted-foreground">Require attention</p>
          </CardContent>
        </Card>
        <Card className="border-aqua/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Failed Logins</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">142</div>
            <p className="text-xs text-muted-foreground">Last 24 hours</p>
          </CardContent>
        </Card>
        <Card className="border-aqua/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">2FA Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">89%</div>
            <p className="text-xs text-muted-foreground">Of eligible users</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Security Alerts */}
        <Card className="border-aqua/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security Alerts
            </CardTitle>
            <CardDescription>Recent security events and threats</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {securityAlerts.map((alert, index) => (
                <Alert key={index} className="border-aqua/10">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      {getAlertIcon(alert.level)}
                      <div className="space-y-1">
                        <p className="text-sm font-medium">{alert.message}</p>
                        <p className="text-xs text-muted-foreground">
                          {alert.source} • {alert.time}
                        </p>
                      </div>
                    </div>
                    <Badge variant={getAlertColor(alert.level)} className="ml-2">
                      {alert.level}
                    </Badge>
                  </div>
                </Alert>
              ))}
              <Button variant="outline" className="w-full">
                View All Alerts
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card className="border-aqua/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Security Configuration
            </CardTitle>
            <CardDescription>Manage security policies and settings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {securitySettings.map((setting, index) => (
                <div key={index} className="flex items-center justify-between p-3 border border-aqua/10 rounded-lg">
                  <div className="space-y-0.5">
                    <div className="text-sm font-medium">{setting.name}</div>
                    <div className="text-xs text-muted-foreground">{setting.description}</div>
                  </div>
                  <Switch checked={setting.enabled} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="border-aqua/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Security Actions
          </CardTitle>
          <CardDescription>Common security management tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-3">
            <Button variant="outline" className="justify-start">
              <Shield className="w-4 h-4 mr-2" />
              Generate Security Report
            </Button>
            <Button variant="outline" className="justify-start">
              <Lock className="w-4 h-4 mr-2" />
              Reset All Sessions
            </Button>
            <Button variant="outline" className="justify-start">
              <Key className="w-4 h-4 mr-2" />
              Backup Security Keys
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SecuritySettings;
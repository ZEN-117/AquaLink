import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckSquare, Clock, Package, DollarSign, Calendar, AlertCircle } from "lucide-react";

const StaffOverview = () => {
  const stats = [
    { title: "Tasks Completed", value: "24", total: "30", progress: 80, icon: CheckSquare, color: "text-green-600" },
    { title: "Hours Worked", value: "38.5", target: "40", progress: 96, icon: Clock, color: "text-blue-600" },
    { title: "Stock Managed", value: "156", unit: "items", progress: 85, icon: Package, color: "text-purple-600" },
    { title: "This Month Salary", value: "$3,200", status: "On Track", progress: 100, icon: DollarSign, color: "text-green-600" },
  ];

  const todaysTasks = [
    { task: "Stock inventory check", priority: "high", due: "9:00 AM", completed: false },
    { task: "Customer order processing", priority: "medium", due: "11:30 AM", completed: true },
    { task: "Equipment maintenance", priority: "low", due: "2:00 PM", completed: false },
    { task: "Weekly report submission", priority: "high", due: "5:00 PM", completed: false },
  ];

  const recentActivities = [
    { activity: "Processed 12 orders", time: "30 minutes ago", type: "order" },
    { activity: "Updated stock levels", time: "1 hour ago", type: "stock" },
    { activity: "Completed cleaning task", time: "2 hours ago", type: "task" },
    { activity: "Attended team meeting", time: "3 hours ago", type: "meeting" },
  ];

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Staff Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here's your daily overview</p>
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
              <div className="mt-2">
                <Progress value={stat.progress} className="w-full" />
                <p className="text-xs text-muted-foreground mt-1">
                  {stat.progress}% {stat.target && `of ${stat.target}`} {stat.unit && stat.unit}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Today's Tasks */}
        <Card className="border-aqua/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckSquare className="h-5 w-5" />
              Today's Tasks
            </CardTitle>
            <CardDescription>Your assignments for today</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {todaysTasks.map((task, index) => (
                <div key={index} className="flex items-center justify-between p-3 border border-aqua/10 rounded-lg">
                  <div className="flex items-start gap-3">
                    <input 
                      type="checkbox" 
                      checked={task.completed}
                      className="mt-1"
                      readOnly
                    />
                    <div className="space-y-1">
                      <p className={`text-sm font-medium ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                        {task.task}
                      </p>
                      <div className="flex items-center gap-2">
                        <Badge variant={getPriorityColor(task.priority)} className="text-xs">
                          {task.priority}
                        </Badge>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {task.due}
                        </span>
                      </div>
                    </div>
                  </div>
                  {!task.completed && task.priority === 'high' && (
                    <AlertCircle className="w-4 h-4 text-red-500" />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card className="border-aqua/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Recent Activities
            </CardTitle>
            <CardDescription>Your recent work activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{activity.activity}</p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {activity.type}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="border-aqua/10">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks and shortcuts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-4">
            <div className="flex items-center justify-between p-3 border border-aqua/10 rounded-lg hover:bg-accent/50 cursor-pointer transition-colors">
              <div className="flex items-center gap-3">
                <Package className="h-5 w-5 text-purple-600" />
                <span className="font-medium">Check Stock</span>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 border border-aqua/10 rounded-lg hover:bg-accent/50 cursor-pointer transition-colors">
              <div className="flex items-center gap-3">
                <CheckSquare className="h-5 w-5 text-green-600" />
                <span className="font-medium">View Tasks</span>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 border border-aqua/10 rounded-lg hover:bg-accent/50 cursor-pointer transition-colors">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-blue-600" />
                <span className="font-medium">Schedule</span>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 border border-aqua/10 rounded-lg hover:bg-accent/50 cursor-pointer transition-colors">
              <div className="flex items-center gap-3">
                <DollarSign className="h-5 w-5 text-yellow-600" />
                <span className="font-medium">Payroll</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StaffOverview;
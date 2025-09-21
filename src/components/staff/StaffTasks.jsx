import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { CheckSquare, Clock, AlertCircle, Calendar, User } from "lucide-react";

const StaffTasks = () => {
  const [tasks, setTasks] = useState([
    { 
      id: 1, 
      title: "Morning stock inventory check", 
      description: "Count all fish and supplies, update inventory system",
      priority: "high", 
      status: "pending", 
      dueTime: "9:00 AM", 
      estimatedTime: "45 min",
      assignedBy: "Manager",
      category: "Daily"
    },
    { 
      id: 2, 
      title: "Process customer orders", 
      description: "Package and prepare orders for delivery",
      priority: "medium", 
      status: "completed", 
      dueTime: "11:30 AM", 
      estimatedTime: "60 min",
      assignedBy: "System",
      category: "Orders"
    },
    { 
      id: 3, 
      title: "Clean aquarium filters", 
      description: "Maintenance of all filtration systems",
      priority: "low", 
      status: "in-progress", 
      dueTime: "2:00 PM", 
      estimatedTime: "90 min",
      assignedBy: "Supervisor",
      category: "Maintenance"
    },
    { 
      id: 4, 
      title: "Submit weekly report", 
      description: "Compile sales and inventory data for weekly report",
      priority: "high", 
      status: "pending", 
      dueTime: "5:00 PM", 
      estimatedTime: "30 min",
      assignedBy: "Manager",
      category: "Reports"
    },
    { 
      id: 5, 
      title: "Customer consultation call", 
      description: "Help customer choose suitable guppy varieties",
      priority: "medium", 
      status: "pending", 
      dueTime: "3:30 PM", 
      estimatedTime: "20 min",
      assignedBy: "Sales Team",
      category: "Customer Service"
    },
  ]);

  const weeklyTasks = [
    { task: "Deep clean all tanks", day: "Monday", status: "completed" },
    { task: "Water quality testing", day: "Tuesday", status: "completed" },
    { task: "Feed scheduling review", day: "Wednesday", status: "pending" },
    { task: "Equipment maintenance", day: "Thursday", status: "pending" },
    { task: "Inventory reconciliation", day: "Friday", status: "pending" },
  ];

  const toggleTaskStatus = (taskId) => {
    setTasks(tasks.map(task => 
      task.id === taskId 
        ? { ...task, status: task.status === 'completed' ? 'pending' : 'completed' }
        : task
    ));
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'default';
      case 'in-progress': return 'secondary';
      case 'pending': return 'outline';
      default: return 'outline';
    }
  };

  const pendingTasks = tasks.filter(task => task.status === 'pending');
  const completedTasks = tasks.filter(task => task.status === 'completed');
  const inProgressTasks = tasks.filter(task => task.status === 'in-progress');

  const completionRate = Math.round((completedTasks.length / tasks.length) * 100);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Tasks & Duties</h1>
        <p className="text-muted-foreground">Manage your daily tasks and assignments</p>
      </div>

      {/* Task Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-aqua/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tasks.length}</div>
            <p className="text-xs text-muted-foreground">For today</p>
          </CardContent>
        </Card>
        <Card className="border-aqua/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{completedTasks.length}</div>
            <Progress value={completionRate} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">{completionRate}% completion rate</p>
          </CardContent>
        </Card>
        <Card className="border-aqua/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{inProgressTasks.length}</div>
            <p className="text-xs text-muted-foreground">Currently working on</p>
          </CardContent>
        </Card>
        <Card className="border-aqua/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{pendingTasks.length}</div>
            <p className="text-xs text-muted-foreground">Awaiting start</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="today" className="space-y-4">
        <TabsList>
          <TabsTrigger value="today">Today's Tasks</TabsTrigger>
          <TabsTrigger value="weekly">Weekly Schedule</TabsTrigger>
        </TabsList>

        <TabsContent value="today" className="space-y-4">
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
                {tasks.map((task) => (
                  <div key={task.id} className="flex items-start gap-4 p-4 border border-aqua/10 rounded-lg hover:bg-accent/50 transition-colors">
                    <input 
                      type="checkbox" 
                      checked={task.status === 'completed'}
                      onChange={() => toggleTaskStatus(task.id)}
                      className="mt-1 w-4 h-4"
                    />
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <h4 className={`font-medium ${task.status === 'completed' ? 'line-through text-muted-foreground' : ''}`}>
                            {task.title}
                          </h4>
                          <p className="text-sm text-muted-foreground">{task.description}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={getPriorityColor(task.priority)} className="text-xs">
                            {task.priority}
                          </Badge>
                          <Badge variant={getStatusColor(task.status)} className="text-xs">
                            {task.status}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Due: {task.dueTime}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Est: {task.estimatedTime}
                        </span>
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          By: {task.assignedBy}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {task.category}
                        </Badge>
                      </div>
                    </div>
                    {task.status === 'pending' && task.priority === 'high' && (
                      <AlertCircle className="w-5 h-5 text-red-500 mt-1" />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="weekly" className="space-y-4">
          <Card className="border-aqua/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Weekly Task Schedule
              </CardTitle>
              <CardDescription>Your recurring weekly responsibilities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {weeklyTasks.map((task, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border border-aqua/10 rounded-lg">
                    <div className="flex items-center gap-4">
                      <input 
                        type="checkbox" 
                        checked={task.status === 'completed'}
                        className="w-4 h-4"
                        readOnly
                      />
                      <div className="space-y-1">
                        <h4 className={`font-medium ${task.status === 'completed' ? 'line-through text-muted-foreground' : ''}`}>
                          {task.task}
                        </h4>
                        <p className="text-sm text-muted-foreground">{task.day}</p>
                      </div>
                    </div>
                    <Badge variant={task.status === 'completed' ? 'default' : 'outline'}>
                      {task.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Performance Summary */}
          <Card className="border-aqua/10">
            <CardHeader>
              <CardTitle>Weekly Performance</CardTitle>
              <CardDescription>Your task completion summary</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="text-center p-4 border border-aqua/10 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">85%</div>
                  <p className="text-sm text-muted-foreground">On-time completion</p>
                </div>
                <div className="text-center p-4 border border-aqua/10 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">4.8</div>
                  <p className="text-sm text-muted-foreground">Avg rating</p>
                </div>
                <div className="text-center p-4 border border-aqua/10 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">23</div>
                  <p className="text-sm text-muted-foreground">Tasks completed</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StaffTasks;
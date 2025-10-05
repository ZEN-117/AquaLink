import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin, Users, AlertCircle } from "lucide-react";

const StaffSchedule = () => {
  // Mock schedule data
  const thisWeekSchedule = [
    { 
      day: "Monday", 
      date: "Oct 28", 
      shift: "Morning", 
      startTime: "8:00 AM", 
      endTime: "4:00 PM", 
      hours: 8,
      location: "Main Store",
      status: "confirmed",
      tasks: ["Stock check", "Customer service"]
    },
    { 
      day: "Tuesday", 
      date: "Oct 29", 
      shift: "Morning", 
      startTime: "8:00 AM", 
      endTime: "4:00 PM", 
      hours: 8,
      location: "Main Store",
      status: "confirmed",
      tasks: ["Inventory management", "Order processing"]
    },
    { 
      day: "Wednesday", 
      date: "Oct 30", 
      shift: "Full Day", 
      startTime: "8:00 AM", 
      endTime: "6:00 PM", 
      hours: 10,
      location: "Main Store",
      status: "confirmed",
      tasks: ["Deep cleaning", "Equipment maintenance"]
    },
    { 
      day: "Thursday", 
      date: "Oct 31", 
      shift: "Morning", 
      startTime: "8:00 AM", 
      endTime: "4:00 PM", 
      hours: 8,
      location: "Warehouse",
      status: "pending",
      tasks: ["Stock receiving", "Quality check"]
    },
    { 
      day: "Friday", 
      date: "Nov 1", 
      shift: "Morning", 
      startTime: "8:00 AM", 
      endTime: "4:00 PM", 
      hours: 8,
      location: "Main Store",
      status: "confirmed",
      tasks: ["Weekly reports", "Customer consultations"]
    },
    { 
      day: "Saturday", 
      date: "Nov 2", 
      shift: "Off", 
      startTime: "-", 
      endTime: "-", 
      hours: 0,
      location: "-",
      status: "off",
      tasks: []
    },
    { 
      day: "Sunday", 
      date: "Nov 3", 
      shift: "Off", 
      startTime: "-", 
      endTime: "-", 
      hours: 0,
      location: "-",
      status: "off",
      tasks: []
    },
  ];

  const upcomingShifts = [
    { date: "Nov 4", shift: "Morning", time: "8:00 AM - 4:00 PM", location: "Main Store" },
    { date: "Nov 5", shift: "Morning", time: "8:00 AM - 4:00 PM", location: "Main Store" },
    { date: "Nov 6", shift: "Full Day", time: "8:00 AM - 6:00 PM", location: "Warehouse" },
  ];

  const timeOffRequests = [
    { dates: "Nov 15-16", reason: "Personal", status: "pending", submitted: "Oct 20" },
    { dates: "Dec 23-25", reason: "Holiday", status: "approved", submitted: "Oct 15" },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'default';
      case 'pending': return 'secondary';
      case 'off': return 'outline';
      default: return 'outline';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <AlertCircle className="w-4 h-4" />;
      default: return null;
    }
  };

  const totalHours = thisWeekSchedule.reduce((sum, day) => sum + day.hours, 0);
  const workingDays = thisWeekSchedule.filter(day => day.hours > 0).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Work Schedule</h1>
        <p className="text-muted-foreground">View your work schedule and manage time off</p>
      </div>

      {/* Schedule Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-aqua/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">This Week Hours</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalHours}</div>
            <p className="text-xs text-muted-foreground">{workingDays} working days</p>
          </CardContent>
        </Card>
        <Card className="border-aqua/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Today's Shift</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8:00 AM</div>
            <p className="text-xs text-muted-foreground">8 hours scheduled</p>
          </CardContent>
        </Card>
        <Card className="border-aqua/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Monthly Hours</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">168</div>
            <p className="text-xs text-green-600">96% of target</p>
          </CardContent>
        </Card>
        <Card className="border-aqua/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Time Off Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">Days remaining</p>
          </CardContent>
        </Card>
      </div>

      {/* This Week's Schedule */}
      <Card className="border-aqua/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            This Week's Schedule
          </CardTitle>
          <CardDescription>October 28 - November 3, 2024</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {thisWeekSchedule.map((day, index) => (
              <div key={index} className={`p-4 border rounded-lg transition-colors ${
                day.status === 'off' ? 'border-gray-200 bg-gray-50/50' : 'border-aqua/10 hover:bg-accent/50'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-center min-w-16">
                      <div className="font-medium">{day.day}</div>
                      <div className="text-sm text-muted-foreground">{day.date}</div>
                    </div>
                    
                    {day.status !== 'off' ? (
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">{day.startTime} - {day.endTime}</span>
                          <Badge variant="outline">{day.hours}h</Badge>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="w-3 h-3" />
                          <span>{day.location}</span>
                        </div>
                        {day.tasks.length > 0 && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Users className="w-3 h-3" />
                            <span>{day.tasks.join(", ")}</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-muted-foreground">
                        <span className="font-medium">Day Off</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {getStatusIcon(day.status)}
                    <Badge variant={getStatusColor(day.status)}>
                      {day.status}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Upcoming Shifts */}
        <Card className="border-aqua/10">
          <CardHeader>
            <CardTitle>Upcoming Shifts</CardTitle>
            <CardDescription>Next week's schedule preview</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingShifts.map((shift, index) => (
                <div key={index} className="flex items-center justify-between p-3 border border-aqua/10 rounded-lg">
                  <div className="space-y-1">
                    <div className="font-medium">{shift.date}</div>
                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                      <Clock className="w-3 h-3" />
                      {shift.time}
                    </div>
                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                      <MapPin className="w-3 h-3" />
                      {shift.location}
                    </div>
                  </div>
                  <Badge variant="outline">{shift.shift}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Time Off Requests */}
        <Card className="border-aqua/10">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Time Off Requests</CardTitle>
                <CardDescription>Your submitted requests</CardDescription>
              </div>
              <Button size="sm" variant="outline">
                Request Time Off
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {timeOffRequests.map((request, index) => (
                <div key={index} className="flex items-center justify-between p-3 border border-aqua/10 rounded-lg">
                  <div className="space-y-1">
                    <div className="font-medium">{request.dates}</div>
                    <div className="text-sm text-muted-foreground">{request.reason}</div>
                    <div className="text-xs text-muted-foreground">Submitted: {request.submitted}</div>
                  </div>
                  <Badge variant={request.status === 'approved' ? 'default' : request.status === 'pending' ? 'secondary' : 'destructive'}>
                    {request.status}
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
          <CardTitle>Schedule Management</CardTitle>
          <CardDescription>Quick actions for schedule management</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-3">
            <Button variant="outline" className="justify-start">
              <Calendar className="w-4 h-4 mr-2" />
              View Full Calendar
            </Button>
            <Button variant="outline" className="justify-start">
              <Clock className="w-4 h-4 mr-2" />
              Clock In/Out
            </Button>
            <Button variant="outline" className="justify-start">
              <Users className="w-4 h-4 mr-2" />
              Request Shift Swap
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StaffSchedule;
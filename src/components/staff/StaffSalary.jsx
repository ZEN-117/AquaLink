import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DollarSign, Clock, TrendingUp, Calendar, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

const StaffSalary = () => {
  // Mock salary data
  const currentMonth = {
    baseSalary: 3000,
    overtime: 200,
    bonus: 150,
    deductions: 180,
    netPay: 3170,
    hoursWorked: 168,
    targetHours: 174,
    overtimeHours: 8
  };

  const payHistory = [
    { month: "October 2024", gross: 3350, net: 3170, hours: 168, overtime: 8, status: "Paid" },
    { month: "September 2024", gross: 3200, net: 3020, hours: 174, overtime: 4, status: "Paid" },
    { month: "August 2024", gross: 3100, net: 2920, hours: 172, overtime: 2, status: "Paid" },
    { month: "July 2024", gross: 3050, net: 2870, hours: 170, overtime: 0, status: "Paid" },
    { month: "June 2024", gross: 3250, net: 3070, hours: 176, overtime: 6, status: "Paid" },
  ];

  const benefits = [
    { name: "Health Insurance", value: "$150/month", status: "Active", coverage: "Full Medical & Dental" },
    { name: "Retirement Plan", value: "5% Match", status: "Active", coverage: "401k with company match" },
    { name: "Paid Time Off", value: "18 days", status: "Available", coverage: "Vacation & Sick leave" },
    { name: "Training Budget", value: "$500/year", status: "Available", coverage: "Professional development" },
  ];

  const upcomingPayments = [
    { description: "Regular Monthly Salary", amount: 3000, date: "Nov 1, 2024", type: "salary" },
    { description: "Performance Bonus", amount: 200, date: "Nov 15, 2024", type: "bonus" },
  ];

  const hoursProgress = (currentMonth.hoursWorked / currentMonth.targetHours) * 100;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Salary & Benefits</h1>
        <p className="text-muted-foreground">View your compensation details and payment history</p>
      </div>

      {/* Current Month Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-aqua/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Net Pay This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${currentMonth.netPay.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">After deductions</p>
          </CardContent>
        </Card>
        <Card className="border-aqua/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Hours Worked</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentMonth.hoursWorked}</div>
            <Progress value={hoursProgress} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {Math.round(hoursProgress)}% of target ({currentMonth.targetHours}h)
            </p>
          </CardContent>
        </Card>
        <Card className="border-aqua/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Overtime Earned</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${currentMonth.overtime}</div>
            <p className="text-xs text-muted-foreground">{currentMonth.overtimeHours} overtime hours</p>
          </CardContent>
        </Card>
        <Card className="border-aqua/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Bonus This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">${currentMonth.bonus}</div>
            <p className="text-xs text-green-600 flex items-center">
              <TrendingUp className="w-3 h-3 mr-1" />
              Performance bonus
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Current Month Breakdown */}
        <Card className="border-aqua/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              October 2024 Breakdown
            </CardTitle>
            <CardDescription>Detailed payment calculation</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 border border-aqua/10 rounded-lg">
                <span className="font-medium">Base Salary</span>
                <span className="text-lg font-bold">${currentMonth.baseSalary.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between p-3 border border-green-200 rounded-lg bg-green-50/50">
                <span className="font-medium text-green-700">Overtime Pay</span>
                <span className="text-lg font-bold text-green-600">+${currentMonth.overtime}</span>
              </div>
              <div className="flex items-center justify-between p-3 border border-blue-200 rounded-lg bg-blue-50/50">
                <span className="font-medium text-blue-700">Performance Bonus</span>
                <span className="text-lg font-bold text-blue-600">+${currentMonth.bonus}</span>
              </div>
              <div className="flex items-center justify-between p-3 border border-red-200 rounded-lg bg-red-50/50">
                <span className="font-medium text-red-700">Deductions</span>
                <span className="text-lg font-bold text-red-600">-${currentMonth.deductions}</span>
              </div>
              <div className="border-t pt-3">
                <div className="flex items-center justify-between p-3 border-2 border-aqua/20 rounded-lg bg-aqua/5">
                  <span className="font-bold text-lg">Net Pay</span>
                  <span className="text-2xl font-bold text-primary">${currentMonth.netPay.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Benefits Overview */}
        <Card className="border-aqua/10">
          <CardHeader>
            <CardTitle>Benefits Package</CardTitle>
            <CardDescription>Your current benefits and coverage</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center justify-between p-3 border border-aqua/10 rounded-lg">
                  <div className="space-y-1">
                    <div className="font-medium">{benefit.name}</div>
                    <div className="text-sm text-muted-foreground">{benefit.coverage}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-primary">{benefit.value}</div>
                    <Badge variant={benefit.status === 'Active' ? 'default' : 'secondary'} className="text-xs">
                      {benefit.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment History */}
      <Card className="border-aqua/10">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Payment History</CardTitle>
              <CardDescription>Your recent salary payments</CardDescription>
            </div>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Download All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Period</TableHead>
                <TableHead>Gross Pay</TableHead>
                <TableHead>Net Pay</TableHead>
                <TableHead>Hours Worked</TableHead>
                <TableHead>Overtime</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payHistory.map((payment, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{payment.month}</TableCell>
                  <TableCell>${payment.gross.toLocaleString()}</TableCell>
                  <TableCell className="font-medium">${payment.net.toLocaleString()}</TableCell>
                  <TableCell>{payment.hours}h</TableCell>
                  <TableCell>{payment.overtime}h</TableCell>
                  <TableCell>
                    <Badge variant="default">{payment.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">
                      <Download className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Upcoming Payments */}
      <Card className="border-aqua/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Upcoming Payments
          </CardTitle>
          <CardDescription>Scheduled payments and bonuses</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {upcomingPayments.map((payment, index) => (
              <div key={index} className="flex items-center justify-between p-3 border border-aqua/10 rounded-lg">
                <div className="space-y-1">
                  <div className="font-medium">{payment.description}</div>
                  <div className="text-sm text-muted-foreground">{payment.date}</div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-primary">${payment.amount.toLocaleString()}</div>
                  <Badge variant={payment.type === 'bonus' ? 'secondary' : 'default'} className="text-xs">
                    {payment.type}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StaffSalary;
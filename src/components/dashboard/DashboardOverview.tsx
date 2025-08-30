import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Fish, DollarSign, TrendingUp, Package, Plus, Eye } from "lucide-react";

const DashboardOverview = () => {
  const stats = [
    {
      title: "Active Gigs",
      value: "12",
      description: "Guppy listings live",
      icon: Package,
      color: "text-aqua",
      bgColor: "bg-aqua/10"
    },
    {
      title: "Total Earnings",
      value: "$2,840",
      description: "This month",
      icon: DollarSign,
      color: "text-green-500",
      bgColor: "bg-green-500/10"
    },
    {
      title: "Fish Sold",
      value: "156",
      description: "Total fish sold",
      icon: Fish,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10"
    },
    {
      title: "Growth Rate",
      value: "+24%",
      description: "vs last month",
      icon: TrendingUp,
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10"
    }
  ];

  const recentActivity = [
    { action: "New order", item: "Rainbow Guppy Male", time: "2 hours ago" },
    { action: "Gig updated", item: "Blue Moscow Guppy", time: "4 hours ago" },
    { action: "Payment received", item: "$120 from order #1234", time: "6 hours ago" },
    { action: "New review", item: "5-star rating received", time: "1 day ago" }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-aqua rounded-xl p-6 text-white animate-scale-in">
        <h1 className="text-2xl font-bold mb-2">Welcome back, John!</h1>
        <p className="text-aqua-light">
          Your aquatic business is swimming along nicely. Here's what's happening today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={stat.title} className="hover-scale animate-fade-in border-aqua/10" style={{ animationDelay: `${index * 100}ms` }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <Card className="animate-fade-in border-aqua/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-aqua" />
              Quick Actions
            </CardTitle>
            <CardDescription>
              Manage your guppy business efficiently
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button className="w-full justify-start bg-gradient-aqua hover:opacity-90">
              <Plus className="w-4 h-4 mr-2" />
              Add New Gig
            </Button>
            <Button variant="outline" className="w-full justify-start border-aqua/20 hover:bg-aqua/10">
              <Eye className="w-4 h-4 mr-2" />
              View Marketplace
            </Button>
            <Button variant="outline" className="w-full justify-start border-aqua/20 hover:bg-aqua/10">
              <TrendingUp className="w-4 h-4 mr-2" />
              Check Analytics
            </Button>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="animate-fade-in border-aqua/10">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest updates from your guppy business
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-aqua/5 transition-colors">
                  <div className="w-2 h-2 bg-aqua rounded-full mt-2"></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">
                      {activity.action}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {activity.item}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardOverview;
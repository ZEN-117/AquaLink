import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  BarChart3, 
  TrendingUp, 
  Eye, 
  ShoppingCart,
  Star,
  Fish,
  Calendar,
  Download
} from "lucide-react";

const FishAnalytics = () => {
  const analyticsData = [
    {
      metric: "Total Views",
      value: "2,847",
      change: "+12%",
      trend: "up",
      icon: Eye,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10"
    },
    {
      metric: "Total Sales",
      value: "156",
      change: "+24%", 
      trend: "up",
      icon: ShoppingCart,
      color: "text-green-500",
      bgColor: "bg-green-500/10"
    },
    {
      metric: "Avg Rating",
      value: "4.9",
      change: "+0.2",
      trend: "up",
      icon: Star,
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10"
    },
    {
      metric: "Active Listings",
      value: "12",
      change: "+3",
      trend: "up",
      icon: Fish,
      color: "text-aqua",
      bgColor: "bg-aqua/10"
    }
  ];

  const topPerformers = [
    {
      name: "Rainbow Guppy Male",
      views: 324,
      sales: 28,
      revenue: "$700",
      rating: 4.9,
      image: "/src/assets/guppy-rainbow.jpg"
    },
    {
      name: "Blue Moscow Guppy Pair",
      views: 298,
      sales: 22,
      revenue: "$396",
      rating: 4.8,
      image: "/src/assets/guppy-blue.jpg"
    },
    {
      name: "Red Delta Guppy Female",
      views: 267,
      sales: 19,
      revenue: "$285",
      rating: 4.7,
      image: "/src/assets/guppy-red.jpg"
    }
  ];

  const recentActivity = [
    { action: "View", item: "Rainbow Guppy Male", time: "2 min ago", user: "Anonymous" },
    { action: "Purchase", item: "Blue Moscow Guppy", time: "15 min ago", user: "John S." },
    { action: "View", item: "Red Delta Guppy", time: "23 min ago", user: "Anonymous" },
    { action: "Review", item: "Rainbow Guppy Male", time: "1 hour ago", user: "Maria G." },
    { action: "View", item: "Premium Collection", time: "2 hours ago", user: "Anonymous" }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Fish Analytics</h1>
          <p className="text-muted-foreground">Track your guppy sales performance and insights</p>
        </div>
        <div className="flex gap-2">
          <Select defaultValue="30days">
            <SelectTrigger className="w-32 border-aqua/20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">7 Days</SelectItem>
              <SelectItem value="30days">30 Days</SelectItem>
              <SelectItem value="90days">90 Days</SelectItem>
              <SelectItem value="1year">1 Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="border-aqua/20 hover:bg-aqua/10">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {analyticsData.map((metric, index) => (
          <Card key={metric.metric} className="hover-scale animate-fade-in border-aqua/10" style={{ animationDelay: `${index * 100}ms` }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {metric.metric}
              </CardTitle>
              <div className={`p-2 rounded-lg ${metric.bgColor}`}>
                <metric.icon className={`w-4 h-4 ${metric.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{metric.value}</div>
              <div className="flex items-center gap-1 text-sm text-green-500">
                <TrendingUp className="w-3 h-3" />
                {metric.change} vs last period
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performing Gigs */}
        <Card className="animate-fade-in border-aqua/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-aqua" />
              Top Performing Gigs
            </CardTitle>
            <CardDescription>Your best selling guppy varieties this month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topPerformers.map((gig, index) => (
                <div 
                  key={gig.name}
                  className="flex items-center justify-between p-4 rounded-lg bg-aqua/5 hover:bg-aqua/10 transition-colors"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-aqua/10">
                      <img 
                        src={gig.image} 
                        alt={gig.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground">{gig.name}</h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{gig.views} views</span>
                        <span>•</span>
                        <span>{gig.sales} sales</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-foreground">{gig.revenue}</div>
                    <div className="flex items-center gap-1 text-sm text-yellow-500">
                      <Star className="w-3 h-3 fill-current" />
                      {gig.rating}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="animate-fade-in border-aqua/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-aqua" />
              Recent Activity
            </CardTitle>
            <CardDescription>Latest interactions with your gigs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div 
                  key={index}
                  className="flex items-start space-x-3 p-3 rounded-lg hover:bg-aqua/5 transition-colors"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    activity.action === 'Purchase' ? 'bg-green-500' :
                    activity.action === 'Review' ? 'bg-yellow-500' : 'bg-aqua'
                  }`}></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">
                      <span className="font-medium text-foreground">{activity.user}</span>
                      <span className="text-muted-foreground"> {activity.action.toLowerCase()}ed </span>
                      <span className="font-medium text-foreground">{activity.item}</span>
                    </p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Chart Placeholder */}
      <Card className="animate-fade-in border-aqua/10">
        <CardHeader>
          <CardTitle>Sales Performance Over Time</CardTitle>
          <CardDescription>Track your sales trends and patterns</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-gradient-to-r from-aqua/5 to-aqua/10 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <BarChart3 className="w-12 h-12 text-aqua mx-auto mb-4" />
              <p className="text-muted-foreground">Interactive chart would be displayed here</p>
              <p className="text-sm text-muted-foreground">Showing sales trends, peak hours, and seasonal patterns</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FishAnalytics;
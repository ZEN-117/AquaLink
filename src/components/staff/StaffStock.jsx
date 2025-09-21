import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Package, AlertTriangle, TrendingDown, TrendingUp } from "lucide-react";

const StaffStock = () => {
  const [searchTerm, setSearchTerm] = useState("");

  // Mock stock data
  const stockItems = [
    { id: 1, name: "Blue Guppy (Adult)", category: "Fish", current: 45, min: 20, max: 100, status: "Good", lastUpdated: "2 hours ago" },
    { id: 2, name: "Red Guppy (Juvenile)", category: "Fish", current: 12, min: 15, max: 50, status: "Low", lastUpdated: "1 hour ago" },
    { id: 3, name: "Rainbow Guppy (Adult)", category: "Fish", current: 78, min: 30, max: 120, status: "Good", lastUpdated: "30 minutes ago" },
    { id: 4, name: "Fish Food (Premium)", category: "Supplies", current: 8, min: 10, max: 50, status: "Low", lastUpdated: "1 day ago" },
    { id: 5, name: "Aquarium Filter", category: "Equipment", current: 25, min: 5, max: 30, status: "Good", lastUpdated: "3 hours ago" },
    { id: 6, name: "Water Treatment", category: "Supplies", current: 2, min: 5, max: 25, status: "Critical", lastUpdated: "2 days ago" },
  ];

  const stockMovements = [
    { id: 1, item: "Blue Guppy (Adult)", type: "Sale", quantity: -5, timestamp: "2 hours ago", staff: "You" },
    { id: 2, item: "Fish Food (Premium)", type: "Restock", quantity: +20, timestamp: "1 day ago", staff: "Manager" },
    { id: 3, item: "Rainbow Guppy (Adult)", type: "Sale", quantity: -3, timestamp: "3 hours ago", staff: "You" },
    { id: 4, item: "Water Treatment", type: "Sale", quantity: -2, timestamp: "1 day ago", staff: "Colleague" },
  ];

  const filteredStock = stockItems.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'Good': return 'default';
      case 'Low': return 'destructive';
      case 'Critical': return 'destructive';
      default: return 'secondary';
    }
  };

  const getStockPercentage = (current, min, max) => {
    return Math.round(((current - min) / (max - min)) * 100);
  };

  const lowStockItems = stockItems.filter(item => item.status === 'Low' || item.status === 'Critical');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Stock Management</h1>
        <p className="text-muted-foreground">Monitor and manage inventory levels</p>
      </div>

      {/* Stock Overview Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-aqua/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">156</div>
            <p className="text-xs text-muted-foreground">Across all categories</p>
          </CardContent>
        </Card>
        <Card className="border-aqua/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{lowStockItems.length}</div>
            <p className="text-xs text-muted-foreground">Need attention</p>
          </CardContent>
        </Card>
        <Card className="border-aqua/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Today's Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">23</div>
            <p className="text-xs text-green-600 flex items-center">
              <TrendingUp className="w-3 h-3 mr-1" />
              +15% from yesterday
            </p>
          </CardContent>
        </Card>
        <Card className="border-aqua/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Restocks Needed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4</div>
            <p className="text-xs text-muted-foreground">Items below minimum</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="inventory" className="space-y-4">
        <TabsList>
          <TabsTrigger value="inventory">Current Inventory</TabsTrigger>
          <TabsTrigger value="movements">Stock Movements</TabsTrigger>
          <TabsTrigger value="alerts">Low Stock Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="inventory" className="space-y-4">
          <Card className="border-aqua/10">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Current Inventory</CardTitle>
                  <CardDescription>All items currently in stock</CardDescription>
                </div>
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input 
                    placeholder="Search inventory..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 border-aqua/20 focus:border-aqua"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Current Stock</TableHead>
                    <TableHead>Min/Max</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Updated</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStock.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{item.category}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{item.current}</span>
                          {item.status === 'Low' && <TrendingDown className="w-4 h-4 text-red-500" />}
                          {item.status === 'Critical' && <AlertTriangle className="w-4 h-4 text-red-600" />}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {item.min} / {item.max}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusColor(item.status)}>{item.status}</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{item.lastUpdated}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="movements" className="space-y-4">
          <Card className="border-aqua/10">
            <CardHeader>
              <CardTitle>Recent Stock Movements</CardTitle>
              <CardDescription>Track all inventory changes</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Staff</TableHead>
                    <TableHead>Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stockMovements.map((movement) => (
                    <TableRow key={movement.id}>
                      <TableCell className="font-medium">{movement.item}</TableCell>
                      <TableCell>
                        <Badge variant={movement.type === 'Sale' ? 'destructive' : 'default'}>
                          {movement.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className={movement.quantity > 0 ? 'text-green-600' : 'text-red-600'}>
                          {movement.quantity > 0 ? '+' : ''}{movement.quantity}
                        </span>
                      </TableCell>
                      <TableCell>{movement.staff}</TableCell>
                      <TableCell className="text-muted-foreground">{movement.timestamp}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card className="border-aqua/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                Low Stock Alerts
              </CardTitle>
              <CardDescription>Items that need immediate attention</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {lowStockItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50/50">
                    <div className="flex items-center gap-3">
                      <Package className="h-5 w-5 text-red-500" />
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Current: {item.current} | Minimum: {item.min}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="destructive">{item.status}</Badge>
                      <Button size="sm" variant="outline">
                        Request Restock
                      </Button>
                    </div>
                  </div>
                ))}
                {lowStockItems.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No low stock alerts at the moment</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StaffStock;
import React from "react";
import { Card } from "@/components/ui/card";
import { Clock, Package, History } from "lucide-react";

const InventoryHistory = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Inventory History</h1>
          <p className="text-muted-foreground">Track all inventory movements and changes</p>
        </div>
      </div>

      {/* Coming Soon Card */}
      <Card className="p-12 text-center">
        <div className="flex flex-col items-center space-y-6">
          <div className="relative">
            <div className="w-24 h-24 bg-gradient-to-r from-primary to-black rounded-full flex items-center justify-center mb-4">
              <History className="w-12 h-12 text-white" />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
              <Clock className="w-4 h-4 text-yellow-800" />
            </div>
          </div>
          
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-foreground">Coming Soon</h2>
            <p className="text-muted-foreground max-w-md">
              We're working hard to bring you a comprehensive inventory history tracking system. 
              This feature will allow you to monitor all inventory changes, assignments, and movements.
            </p>
          </div>

          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <div className="flex items-center space-x-2">
              <Package className="w-4 h-4" />
              <span>Track Assignments</span>
            </div>
            <div className="w-1 h-1 bg-muted-foreground rounded-full"></div>
            <div className="flex items-center space-x-2">
              <History className="w-4 h-4" />
              <span>View Changes</span>
            </div>
            <div className="w-1 h-1 bg-muted-foreground rounded-full"></div>
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4" />
              <span>Real-time Updates</span>
            </div>
          </div>

          <div className="mt-8 p-4 bg-aqua/5 rounded-lg border border-aqua/20">
            <p className="text-sm text-aqua font-medium">
              🚀 This feature will be available in the next update!
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default InventoryHistory;

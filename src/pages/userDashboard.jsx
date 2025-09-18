import { Routes, Route } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { UserAppSidebar } from "@/components/UserAppSlidebar";
import DashboardOverview from "@/components/dashboard/DashboardOverview";
import Orders from "@/components/userdashboard/orders";
import UserProfile from "@/components/dashboard/UserProfile";
import { Bell, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

const UserDashboard = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <UserAppSidebar />
        
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="h-16 border-b border-aqua/10 bg-background/95 backdrop-blur-sm sticky top-0 z-40">
            <div className="flex items-center justify-between h-full px-6">
              <div className="flex items-center gap-4">
                <SidebarTrigger className="hover:bg-aqua/10 hover:text-aqua transition-colors" />
              </div>
              
              <div className="flex items-center gap-4">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="hover:bg-aqua/10 hover:text-aqua transition-colors p-2"
                >
                  <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center">
                    <Bell className="w-5 h-5 text-black " />
                  </div>
                </Button>

                <div className="w-8 h-8 rounded-full bg-gradient-aqua flex items-center justify-center">
                  <span className="text-white text-sm font-medium">JD</span>
                </div>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-auto">
            <div className="p-6 animate-fade-in">
              <Routes>
                <Route index element={<DashboardOverview />} />
                <Route path="orders" element={<Orders />} />
                <Route path="profile" element={<UserProfile />} />
              </Routes>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default UserDashboard;
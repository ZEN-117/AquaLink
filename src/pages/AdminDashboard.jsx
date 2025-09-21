import { Routes, Route } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminAppSidebar } from "@/components/AdminAppSidebar";
import AdminOverview from "@/components/admin/AdminOverview";
import UserManagement from "@/components/admin/UserManagement";
import SecuritySettings from "@/components/admin/SecuritySettings";
import SystemAnalytics from "@/components/admin/SystemAnalytics";
import ContentManagement from "@/components/admin/ContentManagement";
import UserProfile from "@/components/dashboard/UserProfile";
import { Bell, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const AdminDashboard = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AdminAppSidebar />
        
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="h-16 border-b border-aqua/10 bg-background/95 backdrop-blur-sm sticky top-0 z-40">
            <div className="flex items-center justify-between h-full px-6">
              <div className="flex items-center gap-4">
                <SidebarTrigger className="hover:bg-aqua/10 hover:text-aqua transition-colors" />
                <div className="relative max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input 
                    placeholder="Search users, analytics, settings..." 
                    className="pl-10 border-aqua/20 focus:border-aqua bg-background/50"
                  />
                </div>
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
                  <span className="text-white text-sm font-medium">AD</span>
                </div>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-auto">
            <div className="p-6 animate-fade-in">
              <Routes>
                <Route index element={<AdminOverview />} />
                <Route path="users" element={<UserManagement />} />
                <Route path="security" element={<SecuritySettings />} />
                <Route path="analytics" element={<SystemAnalytics />} />
                <Route path="content" element={<ContentManagement />} />
                <Route path="profile" element={<UserProfile />} />
              </Routes>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AdminDashboard;
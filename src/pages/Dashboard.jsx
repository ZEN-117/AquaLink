import { Routes, Route } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import DashboardOverview from "@/components/dashboard/DashboardOverview";
import ManageGigs from "@/components/dashboard/ManageGigs";
import UserProfile from "@/components/dashboard/UserProfile";
import FinanceManagement from "@/components/dashboard/FinanceManagement";
import FishInventory from "@/components/dashboard/FishInventory";
import FishStock from "@/components/dashboard/FishStock";
import FeedbackManagement from "@/components/admin/FeedbackManagement";
import { Bell, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// ⤵️ NEW: import finance sub-pages
import ManageTransactions from "@/pages/Finance/ManageTransactions";
import SalaryManagement from "@/pages/Finance/SalaryManagement";
import MyPayments from "@/pages/Finance/MyPayments";

const Dashboard = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="h-16 border-b border-aqua/10 bg-background/95 backdrop-blur-sm sticky top-0 z-40">
            <div className="flex items-center justify-between h-full px-6">
              <div className="flex items-center gap-4">
                <SidebarTrigger className="hover:bg-aqua/10 hover:text-aqua transition-colors" />
                <div className="relative max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input 
                    placeholder="Search guppies, orders, analytics..." 
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
                <Route path="gigs" element={<ManageGigs />} />
                <Route path="profile" element={<UserProfile />} />
                {/* Finance overview */}
                <Route path="finances" element={<FinanceManagement />} />
                {/* ⤵️ Finance sub-pages (so /dashboard/finances/* work) */}
                <Route path="finances/transactions" element={<ManageTransactions />} />
                <Route path="finances/salaries" element={<SalaryManagement />} />
                <Route path="finances/mypayments" element={<MyPayments />} />
                <Route path="stock" element={<FishStock />} />
                <Route path="inventory" element={<FishInventory />} />
                <Route path="feedback" element={<FeedbackManagement />} />
              </Routes>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;
import { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { 
  Fish, 
  User, 
  DollarSign, 
  BarChart3, 
  LogOut,
  ShoppingBag
} from "lucide-react";

const menuItems = [
  { 
    title: "Manage Gigs", 
    url: "/dashboard/gigs", 
    icon: ShoppingBag,
    description: "Add and manage your guppy listings"
  },
  { 
    title: "Profile", 
    url: "/dashboard/profile", 
    icon: User,
    description: "Manage your account settings"
  },
  { 
    title: "Finances", 
    url: "/dashboard/finances", 
    icon: DollarSign,
    description: "Track earnings and payments"
  },
  { 
    title: "Analytics", 
    url: "/dashboard/analytics", 
    icon: BarChart3,
    description: "View fish sales analytics"
  },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;
  const collapsed = state === "collapsed";

  const isActive = (path: string) => currentPath === path;
  const isExpanded = menuItems.some((item) => isActive(item.url));

  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive 
      ? "bg-aqua/10 text-aqua border-r-2 border-aqua font-medium" 
      : "hover:bg-aqua/5 hover:text-aqua transition-all duration-200";

  const handleLogout = () => {
    // For now, just navigate to home (placeholder for real auth)
    navigate("/");
  };

  return (
    <Sidebar
      className={`${collapsed ? "w-14" : "w-64"} transition-all duration-300 border-r border-aqua/10`}
    >
      <SidebarContent className="bg-gradient-to-b from-background to-background/95">
        {/* Logo Section */}
        <div className="p-4 border-b border-aqua/10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-aqua rounded-lg flex items-center justify-center">
              <Fish className="w-5 h-5 text-white" />
            </div>
            {!collapsed && (
              <div>
                <h2 className="font-bold text-lg text-foreground">AquaFlow</h2>
                <p className="text-xs text-muted-foreground">Dashboard</p>
              </div>
            )}
          </div>
        </div>

        <SidebarGroup
          className="px-2"
        >
          <SidebarGroupLabel className="text-aqua font-medium px-2 py-2">
            {!collapsed && "Management"}
          </SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="hover-scale">
                    <NavLink 
                      to={item.url} 
                      end 
                      className={getNavCls}
                      title={collapsed ? item.title : undefined}
                    >
                      <item.icon className="w-5 h-5 mr-3 flex-shrink-0" />
                      {!collapsed && (
                        <div className="flex-1 min-w-0">
                          <span className="block text-sm font-medium">
                            {item.title}
                          </span>
                          <span className="block text-xs text-muted-foreground truncate">
                            {item.description}
                          </span>
                        </div>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              
              {/* Logout Button */}
              <SidebarMenuItem>
                <SidebarMenuButton 
                  onClick={handleLogout}
                  className="hover:bg-red-500/10 hover:text-red-500 transition-all duration-200 hover-scale cursor-pointer"
                  title={collapsed ? "Logout" : undefined}
                >
                  <LogOut className="w-5 h-5 mr-3 flex-shrink-0" />
                  {!collapsed && (
                    <div className="flex-1 min-w-0">
                      <span className="block text-sm font-medium">Logout</span>
                      <span className="block text-xs text-muted-foreground">
                        Sign out of your account
                      </span>
                    </div>
                  )}
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
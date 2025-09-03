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
  User, 
  DollarSign, 
  BarChart3, 
  LogOut,
  ShoppingBag,
  HouseIcon,
  Fish
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
  { 
    title: "Back to Home", 
    url: "/", 
    icon: HouseIcon,
    description: "Visit home page"
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
    
    navigate("/");
  };

  return (
    <Sidebar
      className={`${collapsed ? "w-14" : "w-64"} transition-all duration-300 border-r border-aqua/10 flex flex-col`}
    >
      <SidebarContent className="bg-gradient-to-b from-background to-background/95 flex flex-col flex-1">
        
        {/* Logo Section */}
        <div className="p-4 border-b border-aqua/10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-aqua rounded-lg flex items-center justify-center">
              <Fish className="w-5 h-5 text-primary" />
            </div>
            {!collapsed && (
              <NavLink to="/dashboard" className="flex flex-col w-36 h-auto">
                <h2 className="font-bold text-xl text-foreground">AquaLink</h2>
                <p className="text-sm text-muted-foreground">Dashboard</p>
              </NavLink>
            )}
          </div>
        </div>

        {/* Main  menu */}
        <SidebarGroup className="px-2 flex-1">
          {/* <SidebarGroupLabel className="text-aqua text-sm font-medium px-2 py-2">
            {!collapsed && "Management"}
          </SidebarGroupLabel> */}

          <SidebarGroupContent>
            <SidebarMenu className="space-y-2">
              {menuItems
                .filter((item) => item.title !== "Back to Home") 
                .map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <NavLink to={item.url} end>
                      {({ isActive }) => (
                        <div
                          className={`flex items-center p-3 rounded-lg min-h-[56px] transition-all duration-200 hover-scale cursor-pointer
                            ${isActive
                              ? "bg-gradient-to-r from-primary to-black text-background font-medium"
                              : "hover:bg-aqua/10 hover:text-aqua text-foreground"}`}
                        >
                          <item.icon className="w-5 h-5 mr-3 flex-shrink-0" />
                          {!collapsed && (
                            <div className="flex-1 min-w-0">
                              <span className="block text-base font-medium">{item.title}</span>
                              <span
                                className={`block text-sm truncate ${
                                  isActive ? "text-white" : "text-primary"
                                }`}
                              >
                                {item.description}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </NavLink>
                  </SidebarMenuItem>
                ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Footer actions  */}
        <div className="border-t border-aqua/10 p-2">
          <SidebarMenu className="space-y-2">
            {/* Back to home */}
            <SidebarMenuItem>
              <NavLink to="/" end>
                {({ isActive }) => (
                  <div
                    className={`flex items-center p-3 rounded-lg min-h-[56px] transition-all hover:bg-primary/10 duration-200 hover-scale cursor-pointer
                      ${isActive
                        ? "bg-gradient-to-r from-primary to-black text-background font-medium"
                        : "hover:bg-aqua/10 hover:text-aqua text-foreground"}`}
                  >
                    <HouseIcon className="w-5 h-5 mr-3 flex-shrink-0" />
                    {!collapsed && (
                      <div className="flex-1 min-w-0">
                        <span className="block text-base font-medium">Back to Home</span>
                        <span className="block text-sm text-primary">Visit home page</span>
                      </div>
                    )}
                  </div>
                )}
              </NavLink>
            </SidebarMenuItem>

            {/* Logout button */}
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={handleLogout}
                className="flex items-center p-3 rounded-lg min-h-[56px] text-red-500 hover:bg-red-500/10 hover:text-red-500 transition-all duration-200 hover-scale cursor-pointer"
              >
                <LogOut className="w-5 h-5 mr-3 flex-shrink-0" />
                {!collapsed && (
                  <div className="flex-1 min-w-0">
                    <span className="block text-base font-medium">Logout</span>
                    <span className="text-red-500 block text-sm text-muted-foreground">
                      Sign out of your account
                    </span>
                  </div>
                )}
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}

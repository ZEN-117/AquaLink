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
  HouseIcon
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
    // For now, just navigate to home (placeholder for real auth)
    navigate("/");
  };

  return (
    <Sidebar
      className={`${collapsed ? "w-14" : "w-64"} transition-all duration-300 border-r border-aqua/10`}
    >
      <SidebarContent className="bg-gradient-to-b from-background to-background/95">
 
          {/* Logo Section */}
          <div className="p-4 border-b border-aqua/10 flex flex-col items-start">
            <NavLink to="/dashboard" className="w-36 h-auto">
              <img 
                src="/src/assets/logo.png" 
                alt="AquaLink Logo" 
                className="w-full h-auto object-contain"
              />
            </NavLink>
            {!collapsed && (
              <p className="mt-1 ml-1 block text-sm font-medium">
                Dashboard
              </p>
            )}
          </div>
        <SidebarGroup
          className="px-2"
        >
          <SidebarGroupLabel className="text-aqua font-medium px-2 py-2">
            {!collapsed && "Management"}
          </SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu className="space-y-2">
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <NavLink
                    to={item.url}
                    end
                    title={collapsed ? item.title : undefined}
                  >
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
                            <span className="block text-sm font-medium">{item.title}</span>
                            <span
                              className={`block text-xs truncate ${
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

              {/* Logout Button */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={handleLogout}
                  className="flex items-center p-3 rounded-lg min-h-[56px] text-red-500  hover:bg-red-500/10 hover:text-red-500 transition-all duration-200 hover-scale cursor-pointer"
                  title={collapsed ? "Logout" : undefined}
                >
                  <div className="flex items-center w-full">
                    <LogOut className="w-5 h-5 mr-3 flex-shrink-0" />
                    {!collapsed && (
                      <div className="flex-1 min-w-0">
                        <span className="block text-sm font-medium">Logout</span>
                        <span className="text-red-500 block text-xs text-muted-foreground">
                          Sign out of your account
                        </span>
                      </div>
                    )}
                  </div>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>


        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

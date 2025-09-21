import { useLocation, useNavigate, NavLink } from "react-router-dom";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar,} from "@/components/ui/sidebar";
import { useAuth } from "../contexts/AuthContext";
import {  User,  Users,  Shield,  BarChart3,  LogOut, Settings, HouseIcon, Fish, FileText} from "lucide-react";

const menuItems = [
  { 
    title: "User Management", 
    url: "/admindashboard/users", 
    icon: Users,
  },
  { 
    title: "Manage Stock Details", 
    url: "/admindashboard/stock", 
    icon: BarChart3,
  },
  { 
    title: "Security Settings", 
    url: "/admindashboard/security", 
    icon: Shield,
  },
  { 
    title: "System Analytics", 
    url: "/admindashboard/analytics", 
    icon: BarChart3,
  },
  { 
    title: "Content Management", 
    url: "/admindashboard/content", 
    icon: FileText,
  },
  { 
    title: "Profile", 
    url: "/admindashboard/profile", 
    icon: User,
  },
];

export function AdminAppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const currentPath = location.pathname;
  const collapsed = state === "collapsed";

  const isActive = (path) => currentPath === path;

  const handleLogout = () => {
    logout();
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
              <NavLink to="/admindashboard" className="flex flex-col w-36 h-auto">
                <h2 className="font-bold text-xl text-foreground">AquaLink</h2>
                <p className="text-sm text-muted-foreground">Admin Dashboard</p>
              </NavLink>
            )}
          </div>
        </div>

        {/* Main menu */}
        <SidebarGroup className="px-2 flex-1">
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
                                className={`block text-sm font-semibold truncate ${
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

        {/* Footer actions */}
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
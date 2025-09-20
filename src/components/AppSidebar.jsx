import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, NavLink } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  User,
  DollarSign,
  BarChart3,
  LogOut,
  ShoppingBag,
  HouseIcon,
  Fish,
  ChevronDown,
} from "lucide-react";

const mainItems = [
  {
    title: "Manage Gigs",
    url: "/dashboard/gigs",
    icon: ShoppingBag,
    description: "Add and manage your guppy listings",
    exact: true,
  },
  {
    title: "Profile",
    url: "/dashboard/profile",
    icon: User,
    description: "Manage your account settings",
    exact: true,
  },
  {
    title: "Finances",
    url: "/dashboard/finances",
    icon: DollarSign,
    description: "Track earnings and payments",
    isFinanceParent: true,
  },
  {
    title: "Analytics",
    url: "/dashboard/analytics",
    icon: BarChart3,
    description: "View fish sales analytics",
    exact: true,
  },
];

const financeChildren = [
  {
    title: "Transactions",
    url: "/dashboard/finances/transactions",
    icon: DollarSign,
    description: "Create & edit CR/DR entries",
  },
  {
    title: "Salaries",
    url: "/dashboard/finances/salaries",
    icon: DollarSign,
    description: "Payroll & auto-calculations",
  },
  {
    title: "My Payments",
    url: "/dashboard/finances/mypayments",
    icon: DollarSign,
    description: "Buyer order payments",
  },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const navigate = useNavigate();

  // Parent looks active on any finance route
  const isOnFinances = useMemo(
    () => location.pathname.startsWith("/dashboard/finances"),
    [location.pathname]
  );

  // Expand when on finance pages
  const [openFinances, setOpenFinances] = useState(isOnFinances);
  useEffect(() => {
    if (isOnFinances) setOpenFinances(true);
  }, [isOnFinances]);

  const handleLogout = () => navigate("/");

  const handleFinanceClick = (e) => {
    e.preventDefault();
    if (collapsed) {
      navigate("/dashboard/finances");
      return;
    }
    setOpenFinances((p) => !p);
    navigate("/dashboard/finances");
  };

  return (
    <Sidebar
      className={`${
        collapsed ? "w-14" : "w-64"
      } transition-all duration-300 border-r border-aqua/10 flex flex-col`}
    >
      <SidebarContent className="bg-gradient-to-b from-background to-background/95 flex flex-col flex-1">
        {/* Logo */}
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

        {/* Menu */}
        <SidebarGroup className="px-2 flex-1">
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2">
              {mainItems.map((item) => {
                if (item.isFinanceParent) {
                  const parentActive = isOnFinances;

                  return (
                    <SidebarMenuItem key={item.title}>
                      {/* Parent */}
                      <a
                        href={item.url}
                        onClick={handleFinanceClick}
                        aria-current={parentActive ? "page" : undefined}
                        aria-expanded={!collapsed ? openFinances : undefined}
                        className={`flex items-center p-3 rounded-lg min-h-[56px] transition-all duration-200 hover-scale cursor-pointer
                          ${
                            parentActive
                              ? "bg-gradient-to-r from-primary to-black text-background font-medium"
                              : "hover:bg-aqua/10 hover:text-aqua text-foreground"
                          }`}
                      >
                        <item.icon className="w-5 h-5 mr-3 flex-shrink-0" />
                        {!collapsed && (
                          <div className="flex-1 min-w-0">
                            <span className="block text-base font-medium">
                              {item.title}
                            </span>
                            <span
                              className={`block text-sm font-semibold truncate ${
                                parentActive ? "text-white" : "text-primary"
                              }`}
                            >
                              {item.description}
                            </span>
                          </div>
                        )}
                        {!collapsed && (
                          <ChevronDown
                            className={`w-4 h-4 ml-2 transition-transform ${
                              openFinances ? "rotate-180" : ""
                            }`}
                          />
                        )}
                      </a>

                      {/* Children */}
                      {!collapsed && openFinances && (
                        <div className="mt-1 ml-2">
                          {financeChildren.map((child) => (
                            <NavLink key={child.title} to={child.url} end>
                              {({ isActive }) => (
                                <div
                                  className={`flex items-center p-3 rounded-lg min-h-[48px] transition-all duration-200 hover-scale cursor-pointer ml-6
                                    ${
                                      isActive
                                        ? // === same highlight as parent ===
                                          "bg-gradient-to-r from-primary to-black text-background font-medium shadow-sm"
                                        : "hover:bg-aqua/5 text-foreground"
                                    }`}
                                >
                                  <child.icon
                                    className={`w-4 h-4 mr-3 flex-shrink-0 ${
                                      isActive ? "text-background" : ""
                                    }`}
                                  />
                                  <div className="flex-1 min-w-0">
                                    <span className="block text-sm font-medium">
                                      {child.title}
                                    </span>
                                    <span
                                      className={`block text-xs truncate ${
                                        isActive ? "text-background/80" : "text-primary"
                                      }`}
                                    >
                                      {child.description}
                                    </span>
                                  </div>
                                </div>
                              )}
                            </NavLink>
                          ))}
                        </div>
                      )}
                    </SidebarMenuItem>
                  );
                }

                // Normal items
                return (
                  <SidebarMenuItem key={item.title}>
                    <NavLink to={item.url} end={item.exact !== false}>
                      {({ isActive }) => (
                        <div
                          className={`flex items-center p-3 rounded-lg min-h-[56px] transition-all duration-200 hover-scale cursor-pointer
                            ${
                              isActive
                                ? "bg-gradient-to-r from-primary to-black text-background font-medium"
                                : "hover:bg-aqua/10 hover:text-aqua text-foreground"
                            }`}
                        >
                          <item.icon className="w-5 h-5 mr-3 flex-shrink-0" />
                          {!collapsed && (
                            <div className="flex-1 min-w-0">
                              <span className="block text-base font-medium">
                                {item.title}
                              </span>
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
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Footer */}
        <div className="border-t border-aqua/10 p-2">
          <SidebarMenu className="space-y-2">
            <SidebarMenuItem>
              <NavLink to="/" end>
                {({ isActive }) => (
                  <div
                    className={`flex items-center p-3 rounded-lg min-h-[56px] transition-all hover:bg-primary/10 duration-200 hover-scale cursor-pointer
                      ${
                        isActive
                          ? "bg-gradient-to-r from-primary to-black text-background font-medium"
                          : "hover:bg-aqua/10 hover:text-aqua text-foreground"
                      }`}
                  >
                    <HouseIcon className="w-5 h-5 mr-3 flex-shrink-0" />
                    {!collapsed && (
                      <div className="flex-1 min-w-0">
                        <span className="block text-base font-medium">
                          Back to Home
                        </span>
                        <span className="block text-sm text-primary">
                          Visit home page
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </NavLink>
            </SidebarMenuItem>

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

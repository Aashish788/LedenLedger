import { NavLink } from "react-router-dom";
import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  FileText, 
  Wallet, 
  UserCog,
  Package2,
  ShoppingCart,
  Package,
  TrendingUp,
  Receipt,
  Settings,
  Bell,
  CreditCard,
  BarChart3
} from "lucide-react";
import LendenLedgerIcon from "@/assets/LenDenledgericon1.png";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from "@/components/ui/sidebar";

const mainNav = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
];

const businessNav = [
  { title: "Customers", url: "/customers", icon: Users },
  { title: "Suppliers", url: "/suppliers", icon: Building2 },
  { title: "Invoices", url: "/invoices", icon: FileText },
  { title: "Cash Book", url: "/cashbook", icon: Wallet },
  { title: "Staff", url: "/staff", icon: UserCog },
  { title: "Inventory", url: "/inventory", icon: Package2 },
];

const transactionNav = [
  { title: "Sales", url: "/sales", icon: ShoppingCart },
  { title: "Purchases", url: "/purchases", icon: Package },
  { title: "Expenses", url: "/expenses", icon: TrendingUp },
  { title: "Receipts", url: "/receipts", icon: Receipt },
];

const reportsNav = [
  { title: "Reports", url: "/reports", icon: BarChart3 },
];

const settingsNav = [
  { title: "Settings", url: "/settings", icon: Settings },
  { title: "Notifications", url: "/notifications", icon: Bell },
  { title: "Billing", url: "/billing", icon: CreditCard },
];

export function AppSidebar() {
  return (
    <Sidebar className="border-r border-sidebar-border bg-sidebar">
      <SidebarHeader className="border-b border-sidebar-border px-6 py-5">
        <div className="flex items-center gap-3">
          <img 
            src={LendenLedgerIcon} 
            alt="Lenden Ledger" 
            className="h-10 w-10 rounded-lg"
          />
          <div>
            <h2 className="text-base font-bold text-sidebar-primary">Lenden Ledger</h2>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-3 py-4">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNav.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                          isActive
                            ? "bg-sidebar-accent text-sidebar-accent-foreground"
                            : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                        }`
                      }
                    >
                      <item.icon className="h-[18px] w-[18px]" />
                      <span className="text-sm">{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-6">
          <SidebarGroupLabel className="px-3 text-xs font-semibold text-sidebar-foreground/50 uppercase tracking-wider">
            Business Management
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {businessNav.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                          isActive
                            ? "bg-sidebar-accent text-sidebar-accent-foreground"
                            : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                        }`
                      }
                    >
                      <item.icon className="h-[18px] w-[18px]" />
                      <span className="text-sm">{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-6">
          <SidebarGroupLabel className="px-3 text-xs font-semibold text-sidebar-foreground/50 uppercase tracking-wider">
            Transactions
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {transactionNav.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                          isActive
                            ? "bg-sidebar-accent text-sidebar-accent-foreground"
                            : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                        }`
                      }
                    >
                      <item.icon className="h-[18px] w-[18px]" />
                      <span className="text-sm">{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-6">
          <SidebarGroupLabel className="px-3 text-xs font-semibold text-sidebar-foreground/50 uppercase tracking-wider">
            Reports
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {reportsNav.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                          isActive
                            ? "bg-sidebar-accent text-sidebar-accent-foreground"
                            : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                        }`
                      }
                    >
                      <item.icon className="h-[18px] w-[18px]" />
                      <span className="text-sm">{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-6">
          <SidebarGroupLabel className="px-3 text-xs font-semibold text-sidebar-foreground/50 uppercase tracking-wider">
            Settings
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {settingsNav.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                          isActive
                            ? "bg-sidebar-accent text-sidebar-accent-foreground"
                            : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                        }`
                      }
                    >
                      <item.icon className="h-[18px] w-[18px]" />
                      <span className="text-sm">{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

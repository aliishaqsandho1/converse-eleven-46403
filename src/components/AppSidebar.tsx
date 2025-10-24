import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { 
  Home, 
  Package, 
  ShoppingCart, 
  Users, 
  Warehouse, 
  DollarSign, 
  FileText,
  Settings,
  Store,
  TrendingUp,
  Calculator,
  Truck,
  Bell,
  BarChart3,
  Calendar,
  CreditCard,
  UserCheck,
  Database,
  PieChart,
  ShoppingBag,
  MessageCircle,
  Bot,
  User,
  Building2
} from "lucide-react"
import { useNavigate, useLocation } from "react-router-dom"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

// Define the menu item type with optional badge
type MenuItem = {
  title: string;
  url: string;
  icon: React.ComponentType<any>;
  badge?: string;
}

// Main Menu items
const mainItems: MenuItem[] = [
  {
    title: "Dashboard",
    url: "/",
    icon: Home,
  },
  {
    title: "Products",
    url: "/products",
    icon: Package,
  },
  {
    title: "Point Of Sale",
    url: "/sales",
    icon: ShoppingCart,
  },
  {
    title: "All Sales",
    url: "/orders",
    icon: ShoppingBag,
  },
  {
    title: "Outsourced Sales",
    url: "/outsourced-orders",
    icon: Truck,
  },
   {
    title: "Ask AI",
    url: "/reports",
    icon: MessageCircle,
  }
]
// Business Operations - removed Sales Receipts
const businessItems: MenuItem[] = [
  {
    title: "Customers",
    url: "/customers",
    icon: Users,
  },
  {
    title: "Credits",
    url: "/credits",
    icon: CreditCard,
  },
  {
    title: "Employees",
    url: "/employees",
    icon: UserCheck,
  },
  {
    title: "Quotations",
    url: "/quotations",
    icon: Calculator,
  },
  {
    title: "Suppliers",
    url: "/suppliers",
    icon: Truck,
  },
  {
    title: "Purchase Orders",
    url: "/purchase-orders",
    icon: FileText,
  }
]

// Financial Management
const financeItems: MenuItem[] = [
  {
    title: "Finances",
    url: "/finances",
    icon: DollarSign,
  },
]

// Analytics & Reports
const analyticsItems: MenuItem[] = [
  {
    title: "Profit Analytics",
    url: "/profit",
    icon: PieChart,
  },
  {
    title: "Accounts",
    url: "/accounts",
    icon: Building2,
  }
]

export function AppSidebar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { toast } = useToast()
  const { state, toggleSidebar } = useSidebar()

  const handleNavigation = (url: string, title: string) => {
    if (url.startsWith('/')) {
      navigate(url)
    } else {
      toast({
        title: "Coming Soon",
        description: `${title} feature will be available in the next update`,
      });
    }
  }

  const handleSettingsClick = () => {
    navigate("/settings")
  }

  const renderMenuItems = (items: MenuItem[]) => (
    <SidebarMenu>
      {items.map((item) => (
        <SidebarMenuItem key={item.title}>
          <SidebarMenuButton 
            asChild
            isActive={location.pathname === item.url}
            className="w-full hover:bg-sidebar-accent data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground"
          >
            <button
              onClick={() => handleNavigation(item.url, item.title)}
              className="flex items-center gap-2 w-full text-left text-sidebar-foreground"
            >
              <item.icon className="h-4 w-4" />
              <span className="flex-1">{item.title}</span>
              {item.badge && (
                <Badge 
                  className={`text-xs ${
                    item.badge === 'New' ? 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900 dark:text-emerald-100' :
                    item.badge === 'Pro' ? 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900 dark:text-purple-100' :
                    'bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-100'
                  }`}
                >
                  {item.badge}
                </Badge>
              )}
            </button>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  )

  return (
    <Sidebar className="border-r border-sidebar-border bg-sidebar" collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border p-2">
        <div className="flex items-center justify-center w-full">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="h-10 w-10 bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90 rounded-lg flex items-center justify-center"
          >
            <Store className="h-6 w-6" />
          </Button>
          <div className="group-data-[collapsible=icon]:hidden flex-1 ml-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-sidebar-foreground">Usman Hardware</h2>
                <p className="text-xs text-sidebar-foreground/70">Admin Panel</p>
              </div>
            </div>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent className="overflow-y-auto">
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/70">Main Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            {renderMenuItems(mainItems)}
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Business Operations */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/70">Business Operations</SidebarGroupLabel>
          <SidebarGroupContent>
            {renderMenuItems(businessItems)}
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Financial Management */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/70">Financial Management</SidebarGroupLabel>
          <SidebarGroupContent>
            {renderMenuItems(financeItems)}
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Analytics & Reports */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/70">Analytics & Reports</SidebarGroupLabel>
          <SidebarGroupContent>
            {renderMenuItems(analyticsItems)}
          </SidebarGroupContent>
        </SidebarGroup>

    
      </SidebarContent>
      
      <SidebarFooter className="border-t border-sidebar-border p-2">
        <div className="flex items-center justify-center w-full">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleSettingsClick}
            className={`h-10 w-10 rounded-lg flex items-center justify-center transition-colors ${
              state === 'collapsed' 
                ? 'bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90' 
                : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
            }`}
          >
            <Settings className="h-4 w-4" />
            <span className="group-data-[collapsible=icon]:hidden ml-2 text-sm font-medium">Settings</span>
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}

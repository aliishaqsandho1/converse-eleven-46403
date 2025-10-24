
import { Bell, Package, User, Menu, Home, ChevronRight, Maximize, Minimize } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState, useEffect } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { getPendingOrders, removePendingOrder } from "@/data/storeData";
import { notificationsApi } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { useSidebar } from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { useLocation } from "react-router-dom";

export function Header() {
  const { toast } = useToast();
  const { toggleSidebar } = useSidebar();
  const isMobile = useIsMobile();
  const location = useLocation();
  
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [pendingOrders, setPendingOrders] = useState<any[]>([]);
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Fullscreen toggle function
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch((err) => {
        console.error('Error attempting to enable fullscreen:', err);
        toast({
          title: "Fullscreen Error",
          description: "Could not enter fullscreen mode",
          variant: "destructive"
        });
      });
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      }).catch((err) => {
        console.error('Error attempting to exit fullscreen:', err);
      });
    }
  };

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  useEffect(() => {
    fetchNotifications();
    fetchPendingOrders();
    
    // Set up polling for real-time updates
    const interval = setInterval(() => {
      fetchNotifications();
      fetchPendingOrders();
    }, 30000); // Poll every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await notificationsApi.getAll({ read: false, limit: 10 });
      if (response.success) {
        const notificationData = response.data.notifications || response.data || [];
        setNotifications(Array.isArray(notificationData) ? notificationData : []);
        setUnreadCount(response.data.unreadCount || notificationData.length || 0);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      // Fallback to demo notifications
      const demoNotifications = [
        { id: 1, title: "Low Stock Alert", message: "Product ABC is running low", type: "warning", createdAt: new Date().toISOString() },
        { id: 2, title: "New Order", message: "Order #123 received", type: "info", createdAt: new Date().toISOString() },
        { id: 3, title: "Payment Received", message: "Payment of PKR 5000 received", type: "success", createdAt: new Date().toISOString() }
      ];
      setNotifications(demoNotifications);
      setUnreadCount(3);
    }
  };

  const fetchPendingOrders = () => {
    const orders = getPendingOrders();
    setPendingOrders(orders);
    setPendingOrdersCount(orders.length);
  };

  const handleMarkAsRead = async (notificationId: number) => {
    try {
      await notificationsApi.markAsRead(notificationId);
      setNotifications(notifications.filter(n => n.id !== notificationId));
      setUnreadCount(Math.max(0, unreadCount - 1));
      toast({
        title: "Notification marked as read",
      });
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      // Fallback for demo
      setNotifications(notifications.filter(n => n.id !== notificationId));
      setUnreadCount(Math.max(0, unreadCount - 1));
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationsApi.markAllAsRead();
      setNotifications([]);
      setUnreadCount(0);
      toast({
        title: "All notifications marked as read",
      });
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  const handleRemoveOrder = (orderId: string) => {
    removePendingOrder(orderId);
    fetchPendingOrders(); // Refresh the list
    toast({
      title: "Order Removed",
      description: "Pending order has been removed successfully",
    });
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'warning': 
      case 'low_stock': return '⚠️';
      case 'success': return '✅';
      case 'error': return '❌';
      case 'new_order': return '📦';
      case 'overdue_payment': return '💰';
      default: return '📢';
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  // Breadcrumb generation based on current route
  const getBreadcrumbs = () => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const breadcrumbs: Array<{ name: string; path: string; icon?: React.ForwardRefExoticComponent<any> }> = [
      { name: 'Dashboard', path: '/', icon: Home }
    ];
    
    let currentPath = '';
    pathSegments.forEach(segment => {
      currentPath += `/${segment}`;
      let name = segment.charAt(0).toUpperCase() + segment.slice(1).replace('-', ' ');
      
      // Special case for reports route
      if (segment === 'reports') {
        name = 'Ask AI';
      }
      
      breadcrumbs.push({ name, path: currentPath });
    });
    
    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <header className="h-16 border-b border-border bg-background sticky top-0 z-50">
      <div className="flex h-full items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-4 flex-1">
          {/* Mobile Sidebar Toggle */}
          {isMobile && (
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="md:hidden h-8 w-8"
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}
          
          {/* Breadcrumb Navigation - Hidden on mobile */}
          <div className="hidden md:flex items-center gap-2 flex-1">
            <nav className="flex items-center space-x-1 text-sm text-muted-foreground">
              {breadcrumbs.map((breadcrumb, index) => (
                <div key={breadcrumb.path} className="flex items-center">
                  {index === 0 && breadcrumb.icon && (
                    <breadcrumb.icon className="h-4 w-4 mr-1" />
                  )}
                  <span className={index === breadcrumbs.length - 1 ? "text-foreground font-medium" : "hover:text-foreground cursor-pointer"}>
                    {breadcrumb.name}
                  </span>
                  {index < breadcrumbs.length - 1 && (
                    <ChevronRight className="h-4 w-4 mx-1" />
                  )}
                </div>
              ))}
            </nav>
          </div>
        </div>
        
        <div className="flex items-center gap-2 md:gap-4">
          {/* Fullscreen Toggle Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleFullscreen}
            className="h-8 w-8 md:h-10 md:w-10 hover:bg-accent hover:text-accent-foreground"
            title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
          >
            {isFullscreen ? (
              <Minimize className="h-4 w-4 md:h-5 md:w-5" />
            ) : (
              <Maximize className="h-4 w-4 md:h-5 md:w-5" />
            )}
          </Button>

          {/* Pending Orders Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="relative hover:bg-accent hover:text-accent-foreground h-8 w-8 md:h-10 md:w-10"
              >
                <Package className="h-4 w-4 md:h-5 md:w-5" />
                {pendingOrdersCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-4 w-4 md:h-5 md:w-5 rounded-full p-0 flex items-center justify-center text-xs bg-destructive text-destructive-foreground">
                    {pendingOrdersCount}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 max-h-96 overflow-y-auto bg-background border shadow-lg z-50">
              <DropdownMenuLabel className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-blue-600" />
                  Pending Orders ({pendingOrdersCount})
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {pendingOrders.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  <Package className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
                  <p className="text-sm">No pending orders</p>
                </div>
              ) : (
                pendingOrders.map((order) => (
                  <DropdownMenuItem key={order.id} className="p-0">
                    <div className="w-full p-3 hover:bg-accent">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-medium text-sm">Order #{order.id}</p>
                          <p className="text-xs text-muted-foreground">{order.customer}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-sm text-green-600">PKR {order.totalAmount.toLocaleString()}</p>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveOrder(order.id);
                            }}
                          >
                            ×
                          </Button>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">{order.orderDate}</p>
                      <Badge variant="outline" className="text-xs mt-1">
                        {order.items.length} items
                      </Badge>
                    </div>
                  </DropdownMenuItem>
                ))
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Notifications Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="relative hover:bg-accent hover:text-accent-foreground h-8 w-8 md:h-10 md:w-10"
              >
                <Bell className="h-4 w-4 md:h-5 md:w-5" />
                {unreadCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-4 w-4 md:h-5 md:w-5 rounded-full p-0 flex items-center justify-center text-xs bg-destructive text-destructive-foreground">
                    {unreadCount}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 max-h-96 overflow-y-auto bg-background border shadow-lg z-50">
              <DropdownMenuLabel className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4 text-blue-600" />
                  Notifications ({unreadCount})
                </div>
                {notifications.length > 0 && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleMarkAllAsRead}
                    className="text-xs text-blue-600 hover:text-blue-800"
                  >
                    Mark all read
                  </Button>
                )}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  <Bell className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
                  <p className="text-sm">No new notifications</p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <DropdownMenuItem key={notification.id} className="p-0">
                    <div className="w-full p-3 hover:bg-accent">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm">{getNotificationIcon(notification.type)}</span>
                            <p className="font-medium text-sm">{notification.title}</p>
                          </div>
                          <p className="text-xs text-muted-foreground">{notification.message}</p>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMarkAsRead(notification.id);
                          }}
                        >
                          ×
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">{formatTime(notification.createdAt)}</p>
                    </div>
                  </DropdownMenuItem>
                ))
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/avatars/01.png" alt="Admin" />
                  <AvatarFallback className="bg-primary text-primary-foreground">A</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 bg-background border shadow-lg z-50" align="end" forceMount>
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

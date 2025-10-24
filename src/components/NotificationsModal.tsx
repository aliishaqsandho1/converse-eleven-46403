import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bell, CheckCircle, AlertTriangle, Info, Clock, Trash2, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { notificationsApi, NotificationData } from "@/services/notificationsApi";

interface NotificationsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NotificationsModal({ open, onOpenChange }: NotificationsModalProps) {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    if (open) {
      fetchNotifications();
    }
  }, [open]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await notificationsApi.getAll({ limit: 50 });
      
      if (response.success && response.data) {
        // Handle both possible response structures
        const notificationsData = Array.isArray(response.data) 
          ? response.data 
          : response.data.notifications || [];
        setNotifications(notificationsData);
      } else {
        // Use fallback notifications for demo
        setNotifications([
          {
            id: 1,
            type: "low_stock",
            title: "Low Stock Alert",
            message: "Heavy Duty Hinges stock is running low (5 remaining)",
            read: false,
            createdAt: "2024-11-28T10:00:00Z"
          },
          {
            id: 2,
            type: "overdue_payment",
            title: "Payment Overdue",
            message: "Ahmad Furniture has an overdue payment of Rs. 15,000",
            read: false,
            createdAt: "2024-11-28T09:00:00Z"
          },
          {
            id: 3,
            type: "new_order",
            title: "New Order Received",
            message: "Hassan Carpentry placed a new order worth Rs. 8,500",
            read: true,
            createdAt: "2024-11-28T08:00:00Z"
          }
        ]);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      // Use fallback notifications for demo
      setNotifications([
        {
          id: 1,
          type: "low_stock",
          title: "Low Stock Alert",
          message: "Heavy Duty Hinges stock is running low (5 remaining)",
          read: false,
          createdAt: "2024-11-28T10:00:00Z"
        },
        {
          id: 2,
          type: "overdue_payment",
          title: "Payment Overdue",
          message: "Ahmad Furniture has an overdue payment of Rs. 15,000",
          read: false,
          createdAt: "2024-11-28T09:00:00Z"
        },
        {
          id: 3,
          type: "new_order",
          title: "New Order Received",
          message: "Hassan Carpentry placed a new order worth Rs. 8,500",
          read: true,
          createdAt: "2024-11-28T08:00:00Z"
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id: number) => {
    try {
      await notificationsApi.markAsRead(id);
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === id ? { ...notif, read: true } : notif
        )
      );
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationsApi.markAllAsRead();
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, read: true }))
      );
      toast({
        title: "Success",
        description: "All notifications marked as read",
      });
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'low_stock': return <AlertTriangle className="h-5 w-5 text-orange-600" />;
      case 'overdue_payment': return <Clock className="h-5 w-5 text-red-600" />;
      case 'new_order': return <CheckCircle className="h-5 w-5 text-green-600" />;
      default: return <Info className="h-5 w-5 text-blue-600" />;
    }
  };

  const getBgColor = (type: string, read: boolean) => {
    if (!read) {
      switch (type) {
        case 'low_stock': return 'bg-orange-50 border-orange-200 dark:bg-orange-950 dark:border-orange-800';
        case 'overdue_payment': return 'bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800';
        case 'new_order': return 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800';
        default: return 'bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800';
      }
    }
    return 'bg-background border-border';
  };

  const filterNotifications = (type: string) => {
    switch (type) {
      case 'urgent':
        return notifications.filter(n => n.type === 'overdue_payment' || n.type === 'low_stock');
      case 'unread':
        return notifications.filter(n => !n.read);
      case 'orders':
        return notifications.filter(n => n.type === 'new_order');
      default:
        return notifications;
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  const urgentCount = filterNotifications('urgent').length;
  const unreadCount = filterNotifications('unread').length;
  const ordersCount = filterNotifications('orders').length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
          </DialogTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleMarkAllAsRead}>
              Mark All Read
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-lg text-muted-foreground">Loading notifications...</div>
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">All ({notifications.length})</TabsTrigger>
              <TabsTrigger value="urgent">Urgent ({urgentCount})</TabsTrigger>
              <TabsTrigger value="unread">Unread ({unreadCount})</TabsTrigger>
              <TabsTrigger value="orders">Orders ({ordersCount})</TabsTrigger>
            </TabsList>
            
            <ScrollArea className="h-[500px] mt-4">
              <TabsContent value="all" className="space-y-3">
                {filterNotifications('all').map((notification) => (
                  <NotificationItem 
                    key={notification.id} 
                    notification={notification} 
                    onMarkAsRead={handleMarkAsRead}
                    getIcon={getIcon}
                    getBgColor={getBgColor}
                    formatTime={formatTime}
                  />
                ))}
              </TabsContent>

              <TabsContent value="urgent" className="space-y-3">
                {filterNotifications('urgent').map((notification) => (
                  <NotificationItem 
                    key={notification.id} 
                    notification={notification} 
                    onMarkAsRead={handleMarkAsRead}
                    getIcon={getIcon}
                    getBgColor={getBgColor}
                    formatTime={formatTime}
                  />
                ))}
              </TabsContent>

              <TabsContent value="unread" className="space-y-3">
                {filterNotifications('unread').map((notification) => (
                  <NotificationItem 
                    key={notification.id} 
                    notification={notification} 
                    onMarkAsRead={handleMarkAsRead}
                    getIcon={getIcon}
                    getBgColor={getBgColor}
                    formatTime={formatTime}
                  />
                ))}
              </TabsContent>

              <TabsContent value="orders" className="space-y-3">
                {filterNotifications('orders').map((notification) => (
                  <NotificationItem 
                    key={notification.id} 
                    notification={notification} 
                    onMarkAsRead={handleMarkAsRead}
                    getIcon={getIcon}
                    getBgColor={getBgColor}
                    formatTime={formatTime}
                  />
                ))}
              </TabsContent>
            </ScrollArea>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}

function NotificationItem({ 
  notification, 
  onMarkAsRead, 
  getIcon, 
  getBgColor, 
  formatTime 
}: {
  notification: NotificationData;
  onMarkAsRead: (id: number) => void;
  getIcon: (type: string) => JSX.Element;
  getBgColor: (type: string, read: boolean) => string;
  formatTime: (date: string) => string;
}) {
  return (
    <div className={`p-4 border rounded-lg ${getBgColor(notification.type, notification.read)}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 flex-1">
          {getIcon(notification.type)}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-semibold text-foreground">{notification.title}</h4>
              {!notification.read && <Badge className="bg-red-500 text-white">New</Badge>}
            </div>
            <p className="text-muted-foreground text-sm mb-2">{notification.message}</p>
            <p className="text-muted-foreground text-xs">{formatTime(notification.createdAt)}</p>
          </div>
        </div>
        <div className="flex gap-2">
          {!notification.read && (
            <Button 
              size="sm" 
              variant="ghost"
              onClick={() => onMarkAsRead(notification.id)}
            >
              <CheckCircle className="h-4 w-4" />
            </Button>
          )}
          <Button size="sm" variant="ghost">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

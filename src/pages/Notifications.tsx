import { Bell, CheckCircle, AlertTriangle, Info, Clock, Trash2, Mail } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationsApi, NotificationData } from "@/services/notificationsApi";
import { useToast } from "@/hooks/use-toast";
import { SidebarTrigger } from "@/components/ui/sidebar";

export default function Notifications() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: notificationsData, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationsApi.getAll({ limit: 50 }),
  });

  const markAsReadMutation = useMutation({
    mutationFn: (id: number) => notificationsApi.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast({
        title: "Success",
        description: "Notification marked as read",
      });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: () => notificationsApi.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast({
        title: "Success",
        description: "All notifications marked as read",
      });
    },
  });

  const notifications = notificationsData?.data.notifications || [];
  const unreadCount = notificationsData?.data.unreadCount || 0;
  
  const urgentNotifications = notifications.filter(n => n.type === "overdue_payment");
  const actionRequired = notifications.filter(n => !n.read);
  const unreadNotifications = notifications.filter(n => !n.read);

  const getIcon = (type: string) => {
    switch (type) {
      case 'overdue_payment': return <AlertTriangle className="h-5 w-5 text-red-600" />;
      case 'low_stock': return <Clock className="h-5 w-5 text-amber-600" />;
      case 'new_order': return <CheckCircle className="h-5 w-5 text-green-600" />;
      default: return <Info className="h-5 w-5 text-blue-600" />;
    }
  };

  const getBgColor = (type: string, read: boolean) => {
    if (!read) {
      switch (type) {
        case 'overdue_payment': return 'bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800';
        case 'low_stock': return 'bg-amber-50 border-amber-200 dark:bg-amber-950 dark:border-amber-800'; 
        case 'new_order': return 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800';
        default: return 'bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800';
      }
    }
    return 'bg-card border-border';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return "Just now";
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays === 1) return "Yesterday";
    return `${diffDays} days ago`;
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6 bg-background min-h-screen">
        <div className="flex items-center gap-4">
          <SidebarTrigger />
          <div>
            <h1 className="text-3xl font-bold text-foreground">Notifications</h1>
            <p className="text-muted-foreground">Loading notifications...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 space-y-3 bg-background min-h-[calc(100vh-65px)]">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
    
          <div>
            <h1 className="text-3xl font-bold text-foreground">Notifications</h1>
            <p className="text-muted-foreground">Stay updated with important business alerts</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => markAllAsReadMutation.mutate()}
            disabled={markAllAsReadMutation.isPending}
          >
            Mark All Read
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Bell className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Notification Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Urgent</p>
                <p className="text-2xl font-bold text-foreground">{urgentNotifications.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Action Required</p>
                <p className="text-2xl font-bold text-foreground">{actionRequired.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Bell className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Unread</p>
                <p className="text-2xl font-bold text-foreground">{unreadCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total</p>
                <p className="text-2xl font-bold text-foreground">{notifications.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notifications Tabs */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Notification Center</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">All ({notifications.length})</TabsTrigger>
              <TabsTrigger value="urgent">Urgent ({urgentNotifications.length})</TabsTrigger>
              <TabsTrigger value="unread">Unread ({unreadNotifications.length})</TabsTrigger>
              <TabsTrigger value="action">Action Required ({actionRequired.length})</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="space-y-4">
              {notifications.map((notification) => (
                <div key={notification.id} className={`p-4 border rounded-lg ${getBgColor(notification.type, notification.read)}`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      {getIcon(notification.type)}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-foreground">{notification.title}</h4>
                          {!notification.read && <Badge className="bg-red-500">New</Badge>}
                          {!notification.read && <Badge variant="outline" className="text-orange-600 border-orange-600">Action Required</Badge>}
                        </div>
                        <p className="text-muted-foreground text-sm mb-2">{notification.message}</p>
                        <p className="text-muted-foreground text-xs">{formatDate(notification.createdAt)}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {!notification.read && (
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => markAsReadMutation.mutate(notification.id)}
                          disabled={markAsReadMutation.isPending}
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      )}
                      <Button size="sm" variant="ghost">
                        <Mail className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="urgent" className="space-y-4">
              {urgentNotifications.map((notification) => (
                <div key={notification.id} className={`p-4 border rounded-lg ${getBgColor(notification.type, notification.read)}`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      {getIcon(notification.type)}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-foreground">{notification.title}</h4>
                          {!notification.read && <Badge className="bg-red-500">New</Badge>}
                        </div>
                        <p className="text-muted-foreground text-sm mb-2">{notification.message}</p>
                        <p className="text-muted-foreground text-xs">{formatDate(notification.createdAt)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="unread" className="space-y-4">
              {unreadNotifications.map((notification) => (
                <div key={notification.id} className={`p-4 border rounded-lg ${getBgColor(notification.type, notification.read)}`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      {getIcon(notification.type)}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-foreground">{notification.title}</h4>
                          <Badge className="bg-red-500">New</Badge>
                        </div>
                        <p className="text-muted-foreground text-sm mb-2">{notification.message}</p>
                        <p className="text-muted-foreground text-xs">{formatDate(notification.createdAt)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="action" className="space-y-4">
              {actionRequired.map((notification) => (
                <div key={notification.id} className={`p-4 border rounded-lg ${getBgColor(notification.type, notification.read)}`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      {getIcon(notification.type)}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-foreground">{notification.title}</h4>
                          <Badge variant="outline" className="text-orange-600 border-orange-600">Action Required</Badge>
                        </div>
                        <p className="text-muted-foreground text-sm mb-2">{notification.message}</p>
                        <p className="text-muted-foreground text-xs">{formatDate(notification.createdAt)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}


import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Database, Cloud, Download, Upload, CheckCircle, AlertCircle, Clock, HardDrive } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { backupApi } from "@/services/backupApi";

const BackupSync = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: backupStatus, isLoading: statusLoading } = useQuery({
    queryKey: ['backup-status'],
    queryFn: () => backupApi.getStatus(),
  });

  const { data: backupHistory, isLoading: historyLoading } = useQuery({
    queryKey: ['backup-history'],
    queryFn: () => backupApi.getHistory(),
  });

  const createBackupMutation = useMutation({
    mutationFn: () => backupApi.createBackup(),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['backup-status'] });
      queryClient.invalidateQueries({ queryKey: ['backup-history'] });
      toast({
        title: "Backup Started",
        description: data.message || "Your data backup has been initiated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to start backup. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleBackup = () => {
    createBackupMutation.mutate();
  };

  const handleSync = () => {
    toast({
      title: "Sync Complete",
      description: "Data synchronized with cloud storage.",
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getStoragePercentage = () => {
    if (!backupStatus?.data) return 0;
    const used = parseFloat(backupStatus.data.storageUsed.replace(' GB', ''));
    const limit = parseFloat(backupStatus.data.storageLimit.replace(' GB', ''));
    return Math.round((used / limit) * 100);
  };

  if (statusLoading || historyLoading) {
    return (
      <div className="flex-1 p-4 md:p-6 space-y-6 min-h-screen bg-background">
        <div className="flex items-center gap-4 mb-8">
          <SidebarTrigger />
          <div>
            <h1 className="text-3xl font-bold text-foreground">Backup & Sync</h1>
            <p className="text-muted-foreground">Loading backup information...</p>
          </div>
        </div>
      </div>
    );
  }

  const status = backupStatus?.data;
  const history = backupHistory?.data.backups || [];

  return (
    <div className="flex-1 p-3 md:p-6 space-y-3 min-h-[calc(100vh-65px)] bg-background">
      <div className="flex items-center gap-4 mb-3">
       
        <div>
          <h1 className="text-3xl font-bold text-foreground">Backup & Sync</h1>
          <p className="text-muted-foreground">Manage your data backup and synchronization</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Backup Status */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-blue-600" />
              Backup Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Last Backup</span>
              <Badge variant="outline" className="text-green-600 border-green-200">
                <CheckCircle className="h-3 w-3 mr-1" />
                {status ? formatDate(status.lastBackup) : 'Never'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Backup Size</span>
              <span className="text-sm font-medium">{status?.backupSize || 'N/A'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Storage Used</span>
              <span className="text-sm font-medium">
                {status ? `${status.storageUsed} / ${status.storageLimit}` : 'N/A'}
              </span>
            </div>
            <Progress value={getStoragePercentage()} className="w-full" />
            <Button 
              onClick={handleBackup} 
              className="w-full"
              disabled={createBackupMutation.isPending}
            >
              <Upload className="h-4 w-4 mr-2" />
              {createBackupMutation.isPending ? 'Creating Backup...' : 'Create Backup Now'}
            </Button>
          </CardContent>
        </Card>

        {/* Cloud Sync */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cloud className="h-5 w-5 text-blue-600" />
              Cloud Synchronization
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Sync Status</span>
              <Badge variant="outline" className="text-green-600 border-green-200">
                <CheckCircle className="h-3 w-3 mr-1" />
                {status?.syncStatus === 'up_to_date' ? 'Up to Date' : status?.syncStatus || 'Unknown'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Last Sync</span>
              <span className="text-sm font-medium">
                {status ? formatDate(status.lastSync) : 'Never'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Auto Backup</span>
              <Badge className={status?.autoBackupEnabled ? "text-green-600 bg-green-100 border-green-200" : "text-red-600 bg-red-100 border-red-200"}>
                {status?.autoBackupEnabled ? 'Enabled' : 'Disabled'}
              </Badge>
            </div>
            <Button onClick={handleSync} variant="outline" className="w-full">
              <Download className="h-4 w-4 mr-2" />
              Sync Now
            </Button>
          </CardContent>
        </Card>

        {/* Backup History */}
        <Card className="border-border bg-card lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-600" />
              Backup History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {history.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No backup history available
                </div>
              ) : (
                history.slice(0, 10).map((backup, index) => (
                  <div key={backup.id || index} className="flex items-center justify-between p-3 bg-accent rounded border">
                    <div className="flex items-center gap-3">
                      {backup.status === "completed" ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : backup.status === "failed" ? (
                        <AlertCircle className="h-4 w-4 text-red-600" />
                      ) : (
                        <Clock className="h-4 w-4 text-yellow-600" />
                      )}
                      <div>
                        <p className="font-medium text-sm">{formatDate(backup.date)}</p>
                        <p className="text-xs text-muted-foreground">Size: {backup.size}</p>
                        <p className="text-xs text-muted-foreground">Type: {backup.type}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant="outline" 
                        className={
                          backup.status === "completed" ? "text-green-600 border-green-600" :
                          backup.status === "failed" ? "text-red-600 border-red-600" :
                          "text-yellow-600 border-yellow-600"
                        }
                      >
                        {backup.status}
                      </Badge>
                      {backup.status === "completed" && (
                        <Button size="sm" variant="outline">
                          <Download className="h-3 w-3 mr-1" />
                          Restore
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BackupSync;

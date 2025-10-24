
import { Save, User, Store, Bell, Shield, Database, Palette, Globe, Settings as SettingsIcon, Type } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { settingsApi, SettingsData } from "@/services/settingsApi";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { apiConfig } from "@/utils/apiConfig";
import { useFont, fontOptions } from "@/components/FontProvider";
import { z } from "zod";
import { verifyPin, changePin } from "@/utils/pin";

export default function Settings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { font, setFont } = useFont();
  const [formData, setFormData] = useState<SettingsData | null>(null);
  const [apiBaseUrl, setApiBaseUrl] = useState(apiConfig.getBaseUrl());

  const ADMIN_PASSWORD = "mirzausman@123";
  const [adminPassword, setAdminPassword] = useState("");
  const [oldPin, setOldPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [changing, setChanging] = useState(false);

  const handleChangePin = async () => {
    try {
      setChanging(true);
      const pinSchema = z.string().regex(/^\d{7}$/, { message: "Pincode must be exactly 7 digits" });

      if (adminPassword !== ADMIN_PASSWORD) {
        toast({
          title: "Invalid credentials",
          description: "Admin password is incorrect.",
          variant: "destructive",
        });
        return;
      }

      pinSchema.parse(oldPin);
      pinSchema.parse(newPin);
      if (newPin !== confirmPin) {
        toast({ title: "Mismatch", description: "New pincode and confirmation do not match.", variant: "destructive" });
        return;
      }

      const okOld = await verifyPin(oldPin);
      if (!okOld) {
        toast({ title: "Invalid current pincode", description: "Please enter the correct current pincode.", variant: "destructive" });
        return;
      }

      if (oldPin === newPin) {
        toast({ title: "No change", description: "New pincode must be different from current.", variant: "destructive" });
        return;
      }

      const changed = await changePin(oldPin, newPin);
      if (!changed) {
        toast({ title: "Update failed", description: "Current pincode is incorrect.", variant: "destructive" });
        return;
      }

      setAdminPassword("");
      setOldPin("");
      setNewPin("");
      setConfirmPin("");
      toast({ title: "Pincode updated", description: "Keep your pincode somewhere safe." });
    } catch (e: any) {
      toast({ title: "Validation error", description: e?.message || "Please check your inputs.", variant: "destructive" });
    } finally {
      setChanging(false);
    }
  };

  const { data: settingsData, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      try {
        return await settingsApi.getSettings();
      } catch (error) {
        // If API fails, return default data so Settings page still works
        return {
          profile: {
            name: "Admin",
            email: "admin@usmanhardware.com",
            phone: "",
            role: "Owner",
          },
          store: {
            name: "Usman Hardware",
            address: "",
            currency: "PKR",
            taxRate: 0,
            lowStockThreshold: 10,
            openTime: "09:00",
            closeTime: "21:00",
          },
          notifications: {
            newOrder: true,
            lowStock: true,
            paymentDue: true,
            dailyTarget: false,
          },
          system: {
            autoBackup: false,
            dataRetention: 30,
            cacheEnabled: true,
            darkMode: true,
          },
        };
      }
    },
    retry: false,
    refetchOnWindowFocus: false,
  });

  const updateSettingsMutation = useMutation({
    mutationFn: (settings: Partial<SettingsData>) => settingsApi.updateSettings(settings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      toast({
        title: "Settings Updated",
        description: "Your settings have been saved successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update settings. Please try again.",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (settingsData) {
      // Handle both API response format and fallback format
      const data = 'data' in settingsData ? settingsData.data : settingsData;
      setFormData(data);
    }
  }, [settingsData]);

  const handleSave = () => {
    if (formData) {
      updateSettingsMutation.mutate(formData);
    }
  };

  const handleSaveApiUrl = () => {
    apiConfig.setBaseUrl(apiBaseUrl);
    toast({
      title: "API Configuration Updated",
      description: "Base URL has been saved successfully.",
    });
  };

  const handleResetApiUrl = () => {
    apiConfig.resetToDefault();
    setApiBaseUrl(apiConfig.getBaseUrl());
    toast({
      title: "API Configuration Reset",
      description: "Base URL has been reset to default.",
    });
  };

  const updateField = (section: keyof SettingsData, field: string, value: any) => {
    if (formData && formData[section]) {
      setFormData({
        ...formData,
        [section]: {
          ...formData[section],
          [field]: value,
        },
      });
    }
  };

  if (isLoading || !formData || !formData.profile || !formData.store || !formData.notifications || !formData.system) {
    return (
      <div className="p-6 space-y-6 bg-background min-h-screen">
        <div className="flex items-center gap-4">
          <SidebarTrigger />
          <div>
            <h1 className="text-3xl font-bold text-foreground">Settings</h1>
            <p className="text-muted-foreground">Loading settings...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-background min-h-[calc(100vh-65px)]">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <SidebarTrigger />
          <div>
            <h1 className="text-3xl font-bold text-foreground">Settings</h1>
            <p className="text-muted-foreground">Configure your system preferences</p>
          </div>
        </div>
        <Button 
          className="bg-blue-600 hover:bg-blue-700"
          onClick={handleSave}
          disabled={updateSettingsMutation.isPending}
        >
          <Save className="h-4 w-4 mr-2" />
          {updateSettingsMutation.isPending ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="store">Store</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
          <TabsTrigger value="api">API</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input 
                    id="fullName" 
                    value={formData.profile?.name || ''}
                    onChange={(e) => updateField('profile', 'name', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    value={formData.profile?.email || ''}
                    onChange={(e) => updateField('profile', 'email', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input 
                    id="phone" 
                    value={formData.profile?.phone || ''}
                    onChange={(e) => updateField('profile', 'phone', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Input id="role" value={formData.profile?.role || ''} disabled />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="store" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Store className="h-5 w-5" />
                Store Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="storeName">Store Name</Label>
                  <Input 
                    id="storeName" 
                    value={formData.store?.name || ''}
                    onChange={(e) => updateField('store', 'name', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Input 
                    id="currency" 
                    value={formData.store?.currency || ''}
                    onChange={(e) => updateField('store', 'currency', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="taxRate">Tax Rate (%)</Label>
                  <Input 
                    id="taxRate" 
                    type="number" 
                    value={formData.store?.taxRate || 0}
                    onChange={(e) => updateField('store', 'taxRate', parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lowStockThreshold">Low Stock Alert Threshold</Label>
                  <Input 
                    id="lowStockThreshold" 
                    type="number" 
                    value={formData.store?.lowStockThreshold || 0}
                    onChange={(e) => updateField('store', 'lowStockThreshold', parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="storeAddress">Store Address</Label>
                <Input 
                  id="storeAddress" 
                  value={formData.store?.address || ''}
                  onChange={(e) => updateField('store', 'address', e.target.value)}
                />
              </div>
              <Separator />
              <div className="space-y-4">
                <h4 className="font-medium">Business Hours</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="openTime">Opening Time</Label>
                    <Input 
                      id="openTime" 
                      type="time" 
                      value={formData.store?.openTime || ''}
                      onChange={(e) => updateField('store', 'openTime', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="closeTime">Closing Time</Label>
                    <Input 
                      id="closeTime" 
                      type="time" 
                      value={formData.store?.closeTime || ''}
                      onChange={(e) => updateField('store', 'closeTime', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-medium">Business Notifications</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="newOrder">New Order Alerts</Label>
                    <Switch 
                      id="newOrder" 
                      checked={formData.notifications?.newOrder || false}
                      onCheckedChange={(checked) => updateField('notifications', 'newOrder', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="dailyTarget">Daily Target Updates</Label>
                    <Switch 
                      id="dailyTarget" 
                      checked={formData.notifications?.dailyTarget || false}
                      onCheckedChange={(checked) => updateField('notifications', 'dailyTarget', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="lowStock">Low Stock Alerts</Label>
                    <Switch 
                      id="lowStock" 
                      checked={formData.notifications?.lowStock || false}
                      onCheckedChange={(checked) => updateField('notifications', 'lowStock', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="paymentDue">Payment Due Reminders</Label>
                    <Switch 
                      id="paymentDue" 
                      checked={formData.notifications?.paymentDue || false}
                      onCheckedChange={(checked) => updateField('notifications', 'paymentDue', checked)}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                System Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-medium">Data Management</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="autoBackup">Automatic Daily Backup</Label>
                    <Switch 
                      id="autoBackup" 
                      checked={formData.system?.autoBackup || false}
                      onCheckedChange={(checked) => updateField('system', 'autoBackup', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="cacheEnabled">Enable Caching</Label>
                    <Switch 
                      id="cacheEnabled" 
                      checked={formData.system?.cacheEnabled || false}
                      onCheckedChange={(checked) => updateField('system', 'cacheEnabled', checked)}
                    />
                  </div>
                </div>
              </div>
              <Separator />
              <div className="space-y-4">
                <h4 className="font-medium">Interface</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="darkMode">Dark Mode</Label>
                    <Switch 
                      id="darkMode" 
                      checked={formData.system?.darkMode || false}
                      onCheckedChange={(checked) => updateField('system', 'darkMode', checked)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fontFamily">Font Family</Label>
                    <Select value={font} onValueChange={setFont}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select font family" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border border-border">
                        {fontOptions.map((fontOption) => (
                          <SelectItem key={fontOption.value} value={fontOption.value} className="hover:bg-accent">
                            <div className="flex flex-col items-start">
                              <span className="font-medium">{fontOption.label}</span>
                              <span className="text-xs text-muted-foreground">{fontOption.description}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-muted-foreground">
                      Selected font will be applied to the entire application
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pincode Settings */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Pincode Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Keep your Pincode somewhere safe. To change it, verify admin password and current pincode.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="adminPassword">Admin Password</Label>
                  <Input id="adminPassword" type="password" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="oldPin">Current Pincode</Label>
                  <Input id="oldPin" type="password" inputMode="numeric" maxLength={7} value={oldPin} onChange={(e) => setOldPin(e.target.value.replace(/\D/g, '').slice(0,7))} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPin">New Pincode</Label>
                  <Input id="newPin" type="password" inputMode="numeric" maxLength={7} value={newPin} onChange={(e) => setNewPin(e.target.value.replace(/\D/g, '').slice(0,7))} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPin">Confirm New Pincode</Label>
                  <Input id="confirmPin" type="password" inputMode="numeric" maxLength={7} value={confirmPin} onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, '').slice(0,7))} />
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={handleChangePin} disabled={changing}>
                  {changing ? 'Updating...' : 'Update Pincode'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <SettingsIcon className="h-5 w-5" />
                API Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-medium">Base URL Configuration</h4>
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="apiBaseUrl">API Base URL</Label>
                    <Input 
                      id="apiBaseUrl" 
                      placeholder="https://example.com"
                      value={apiBaseUrl}
                      onChange={(e) => setApiBaseUrl(e.target.value)}
                    />
                    <p className="text-sm text-muted-foreground">
                      This URL will be used for all API requests across the application.
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <Button 
                      onClick={handleSaveApiUrl}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save URL
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={handleResetApiUrl}
                    >
                      <Database className="h-4 w-4 mr-2" />
                      Reset to Default
                    </Button>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      <strong>Current URL:</strong> {apiConfig.getBaseUrl()}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

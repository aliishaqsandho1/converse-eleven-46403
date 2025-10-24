
import { Clock, Database, Shield, Zap, BarChart3, Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function Footer() {
  const systemInfo = {
    version: "v2.1.0",
    lastBackup: "2 hours ago",
    uptime: "99.8%",
    storageUsed: "45%"
  };

  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-700">
      {/* Admin Footer Content */}
      <div className="px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* System Status */}
          <div className="space-y-3">
            <h4 className="text-white font-semibold flex items-center gap-2">
              <Shield className="h-4 w-4 text-green-400" />
              System Status
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>System Uptime:</span>
                <Badge className="bg-green-600 text-white text-xs">{systemInfo.uptime}</Badge>
              </div>
              <div className="flex justify-between">
                <span>Storage Used:</span>
                <span className="text-slate-400">{systemInfo.storageUsed}</span>
              </div>
              <div className="flex justify-between">
                <span>Last Backup:</span>
                <span className="text-slate-400">{systemInfo.lastBackup}</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-3">
            <h4 className="text-white font-semibold flex items-center gap-2">
              <Zap className="h-4 w-4 text-blue-400" />
              Quick Actions
            </h4>
            <div className="space-y-2">
              {[
                'Export Daily Report',
                'Backup Database',
                'Generate Invoice',
                'Stock Alert Settings'
              ].map((action) => (
                <Button
                  key={action}
                  variant="ghost"
                  className="h-auto p-0 text-slate-400 hover:text-white justify-start text-sm"
                >
                  {action}
                </Button>
              ))}
            </div>
          </div>

          {/* Admin Tools */}
          <div className="space-y-3">
            <h4 className="text-white font-semibold flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-purple-400" />
              Admin Tools
            </h4>
            <div className="space-y-2">
              {[
                'Data Analytics',
                'User Activity Log',
                'Performance Monitor',
                'Error Reports'
              ].map((tool) => (
                <Button
                  key={tool}
                  variant="ghost"
                  className="h-auto p-0 text-slate-400 hover:text-white justify-start text-sm"
                >
                  {tool}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="border-t border-slate-700 px-6 py-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-sm">
            <p className="text-slate-400">
              © 2024 Usman Hardware Admin Panel
            </p>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-400" />
              <span className="text-slate-400">Session: Active</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <Database className="h-4 w-4 text-emerald-400" />
            <span>System Version</span>
            <Badge className="bg-emerald-600 text-white text-xs">
              {systemInfo.version}
            </Badge>
          </div>
        </div>
      </div>
    </footer>
  );
}

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ApiService } from "@/lib/api";
import { MockDatabase } from "@/lib/database";
import { manuallyCreateMenuItems } from "@/lib/manualInit";
import { useToast } from "@/hooks/use-toast";
import { RefreshCw, Database, Trash2, Plus } from "lucide-react";

export const DataDebugger = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [dataStats, setDataStats] = useState<any>({});
  const { toast } = useToast();

  const loadDataStats = async () => {
    try {
      const shops = await MockDatabase.findMany("shops");
      const menuItems = await MockDatabase.findMany("menu_items");
      const users = await MockDatabase.findMany("users");
      const orders = await MockDatabase.findMany("orders");

      setDataStats({
        shops: shops.length,
        menuItems: menuItems.length,
        users: users.length,
        orders: orders.length,
        shopsData: shops,
        menuItemsData: menuItems,
      });
    } catch (error) {
      console.error("Error loading data stats:", error);
    }
  };

  const resetAllData = async () => {
    try {
      await ApiService.resetAllData();
      await ApiService.initializeMockData(true);
      await manuallyCreateMenuItems();
      await loadDataStats();
      toast({
        title: "Data Reset Complete",
        description:
          "All data has been cleared and reinitialized with menu items",
      });
      window.location.reload();
    } catch (error) {
      console.error("Error resetting data:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to reset data",
      });
    }
  };

  const forceReload = async () => {
    try {
      await ApiService.initializeMockData(false);
      await loadDataStats();
      toast({
        title: "Data Reloaded",
        description: "Data has been reloaded from storage",
      });
      window.location.reload();
    } catch (error) {
      console.error("Error reloading data:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to reload data",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="fixed bottom-4 left-4 z-50"
          onClick={loadDataStats}
        >
          <Database className="h-4 w-4 mr-2" />
          Debug Data
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Data Debugger</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Data Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>Shops: {dataStats.shops || 0}</div>
                <div>Menu Items: {dataStats.menuItems || 0}</div>
                <div>Users: {dataStats.users || 0}</div>
                <div>Orders: {dataStats.orders || 0}</div>
              </div>
            </CardContent>
          </Card>

          <div className="flex space-x-2">
            <Button onClick={forceReload} className="flex-1">
              <RefreshCw className="h-4 w-4 mr-2" />
              Reload Data
            </Button>
            <Button
              onClick={resetAllData}
              variant="destructive"
              className="flex-1"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Reset All Data
            </Button>
          </div>

          {dataStats.shopsData && dataStats.shopsData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Shops in Database</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {dataStats.shopsData.map((shop: any) => (
                    <div
                      key={shop.id}
                      className="text-xs p-2 bg-gray-50 rounded"
                    >
                      <div className="font-medium">{shop.name}</div>
                      <div className="text-gray-600">ID: {shop.id}</div>
                      <div className="text-gray-600">Owner: {shop.ownerId}</div>
                      <div className="text-gray-600">
                        Active: {shop.isActive ? "Yes" : "No"}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {dataStats.menuItemsData && dataStats.menuItemsData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">
                  Menu Items in Database
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {dataStats.menuItemsData.map((item: any) => (
                    <div
                      key={item.id}
                      className="text-xs p-2 bg-gray-50 rounded"
                    >
                      <div className="font-medium">{item.name}</div>
                      <div className="text-gray-600">
                        Shop ID: {item.shopId}
                      </div>
                      <div className="text-gray-600">Price: ${item.price}</div>
                      <div className="text-gray-600">
                        Available: {item.isAvailable ? "Yes" : "No"}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">LocalStorage Contents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs space-y-1">
                <div>
                  campuseats_shops:{" "}
                  {localStorage.getItem("campuseats_shops")
                    ? "exists"
                    : "missing"}
                </div>
                <div>
                  campuseats_menu_items:{" "}
                  {localStorage.getItem("campuseats_menu_items")
                    ? "exists"
                    : "missing"}
                </div>
                <div>
                  campuseats_users:{" "}
                  {localStorage.getItem("campuseats_users")
                    ? "exists"
                    : "missing"}
                </div>
                <div>
                  campuseats_orders:{" "}
                  {localStorage.getItem("campuseats_orders")
                    ? "exists"
                    : "missing"}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

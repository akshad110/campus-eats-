import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, Database, Eye } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface DbRecord {
  id: string;
  [key: string]: any;
}

export const LocalStorageDBViewer = () => {
  const [shops, setShops] = useState<DbRecord[]>([]);
  const [menuItems, setMenuItems] = useState<DbRecord[]>([]);
  const [users, setUsers] = useState<DbRecord[]>([]);
  const [orders, setOrders] = useState<DbRecord[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const loadData = () => {
    try {
      // Load shops
      const shopsData = localStorage.getItem("campuseats_shops");
      if (shopsData) {
        setShops(JSON.parse(shopsData));
      }

      // Load menu items
      const menuItemsData = localStorage.getItem("campuseats_menu_items");
      if (menuItemsData) {
        setMenuItems(JSON.parse(menuItemsData));
      }

      // Load users
      const usersData = localStorage.getItem("campuseats_users");
      if (usersData) {
        setUsers(JSON.parse(usersData));
      }

      // Load orders
      const ordersData = localStorage.getItem("campuseats_orders");
      if (ordersData) {
        setOrders(JSON.parse(ordersData));
      }
    } catch (error) {
      console.error("Error loading localStorage data:", error);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const formatValue = (value: any): string => {
    if (value === null || value === undefined) return "NULL";
    if (typeof value === "boolean") return value ? "true" : "false";
    if (typeof value === "object") return JSON.stringify(value);
    return String(value);
  };

  const ShopsTable = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          Shops Table ({shops.length} records)
        </h3>
        <Button onClick={loadData} size="sm" variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>
      <div className="border rounded-lg overflow-auto max-h-96">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[100px]">ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Owner ID</TableHead>
              <TableHead>Active</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Crowd Level</TableHead>
              <TableHead>Wait Time</TableHead>
              <TableHead>Created At</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {shops.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={11}
                  className="text-center text-muted-foreground"
                >
                  No shops found in localStorage
                </TableCell>
              </TableRow>
            ) : (
              shops.map((shop) => (
                <TableRow key={shop.id}>
                  <TableCell className="font-mono text-xs">{shop.id}</TableCell>
                  <TableCell className="font-medium">{shop.name}</TableCell>
                  <TableCell className="max-w-[200px] truncate">
                    {shop.description}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{shop.category}</Badge>
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {shop.ownerId}
                  </TableCell>
                  <TableCell>
                    <Badge variant={shop.isActive ? "default" : "destructive"}>
                      {shop.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>{shop.location || "N/A"}</TableCell>
                  <TableCell>{shop.phone || "N/A"}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        shop.crowdLevel === "low"
                          ? "default"
                          : shop.crowdLevel === "medium"
                            ? "secondary"
                            : "destructive"
                      }
                    >
                      {shop.crowdLevel}
                    </Badge>
                  </TableCell>
                  <TableCell>{shop.estimatedWaitTime || 0} min</TableCell>
                  <TableCell className="text-xs">{shop.createdAt}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );

  const MenuItemsTable = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          Menu Items Table ({menuItems.length} records)
        </h3>
      </div>
      <div className="border rounded-lg overflow-auto max-h-96">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Shop ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Available</TableHead>
              <TableHead>Prep Time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {menuItems.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center text-muted-foreground"
                >
                  No menu items found in localStorage
                </TableCell>
              </TableRow>
            ) : (
              menuItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-mono text-xs">{item.id}</TableCell>
                  <TableCell className="font-mono text-xs">
                    {item.shopId}
                  </TableCell>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>${item.price}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{item.category}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={item.isAvailable ? "default" : "destructive"}
                    >
                      {item.isAvailable ? "Available" : "Unavailable"}
                    </Badge>
                  </TableCell>
                  <TableCell>{item.preparationTime || 0} min</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Database className="h-4 w-4 mr-2" />
          View Database
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            LocalStorage Database Viewer
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div className="grid grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Shops</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{shops.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Menu Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{menuItems.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{users.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{orders.length}</div>
              </CardContent>
            </Card>
          </div>

          <ShopsTable />
          <MenuItemsTable />
        </div>
      </DialogContent>
    </Dialog>
  );
};

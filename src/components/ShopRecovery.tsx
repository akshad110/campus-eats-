import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ApiService } from "@/lib/api";
import { MockDatabase } from "@/lib/database";
import { useToast } from "@/hooks/use-toast";
import {
  Search,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Trash2,
  Plus,
  Eye,
  Database,
  Wrench,
} from "lucide-react";

interface ShopRecoveryData {
  missingShopId?: string;
  allShops: any[];
  storageData: any;
  potentialMatches: any[];
}

const ShopRecovery = () => {
  const { toast } = useToast();
  const [isVisible, setIsVisible] = useState(false);
  const [recoveryData, setRecoveryData] = useState<ShopRecoveryData | null>(
    null,
  );
  const [searchId, setSearchId] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const analyzeShopData = async (missingId?: string) => {
    setIsLoading(true);
    try {
      const allShops = await ApiService.getShops();

      // Get raw localStorage data
      const storageKey = "campuseats_shops";
      const rawStorage = localStorage.getItem(storageKey);
      let storageData = null;
      try {
        storageData = rawStorage ? JSON.parse(rawStorage) : null;
      } catch (e) {
        console.error("Failed to parse localStorage shops data:", e);
      }

      // Find potential matches if looking for a specific ID
      let potentialMatches: any[] = [];
      if (missingId) {
        // Look for similar IDs or shops with similar names
        const searchTerm = missingId.toLowerCase();
        potentialMatches = allShops.filter(
          (shop) =>
            shop.id.toLowerCase().includes(searchTerm.substring(0, 10)) ||
            shop.name.toLowerCase().includes(searchTerm.split("_").join(" ")) ||
            searchTerm.includes(shop.id.substring(0, 10)),
        );
      }

      setRecoveryData({
        missingShopId: missingId,
        allShops,
        storageData,
        potentialMatches,
      });
    } catch (error) {
      console.error("Error analyzing shop data:", error);
      toast({
        variant: "destructive",
        title: "Analysis Failed",
        description: "Could not analyze shop data. Check console for details.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    if (searchId.trim()) {
      analyzeShopData(searchId.trim());
    } else {
      analyzeShopData();
    }
  };

  const recreateShop = async (shopName: string, category: string) => {
    try {
      const newShop = await ApiService.createShop({
        name: shopName,
        description: `Recreated ${category} shop`,
        category,
        location: "Campus Location",
        phone: "+1-555-RECOVERY",
      });

      toast({
        title: "Shop Recreated",
        description: `${newShop.name} has been recreated successfully.`,
      });

      // Refresh the analysis
      analyzeShopData(recoveryData?.missingShopId);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Recreation Failed",
        description: "Could not recreate the shop. Try manual creation.",
      });
    }
  };

  const clearAllShops = async () => {
    if (confirm("⚠️ This will delete ALL shops! Are you absolutely sure?")) {
      try {
        localStorage.removeItem("campuseats_shops");
        localStorage.removeItem("campuseats_menu_items");
        await ApiService.createFallbackShops();

        toast({
          title: "Shops Reset",
          description: "All shops cleared and fallback shops created.",
        });

        analyzeShopData();
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Reset Failed",
          description: "Could not reset shops data.",
        });
      }
    }
  };

  const fixShopData = async () => {
    try {
      // Remove duplicates and fix data consistency
      const allShops = await MockDatabase.findMany("shops");
      const uniqueShops = allShops.filter(
        (shop: any, index: number, self: any[]) =>
          index === self.findIndex((s: any) => s.id === shop.id),
      );

      if (allShops.length !== uniqueShops.length) {
        localStorage.setItem("campuseats_shops", JSON.stringify(uniqueShops));
        toast({
          title: "Data Fixed",
          description: `Removed ${allShops.length - uniqueShops.length} duplicate shops.`,
        });
      } else {
        toast({
          title: "Data OK",
          description: "No issues found in shop data.",
        });
      }

      analyzeShopData(recoveryData?.missingShopId);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Fix Failed",
        description: "Could not fix shop data.",
      });
    }
  };

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 left-4 z-50">
        <Button
          onClick={() => {
            setIsVisible(true);
            analyzeShopData();
          }}
          size="sm"
          variant="outline"
          className="bg-white shadow-lg hover:bg-gray-50"
        >
          <Wrench className="h-4 w-4 mr-2" />
          Shop Recovery
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <Wrench className="h-5 w-5 mr-2 text-blue-600" />
              Shop Recovery & Debug Tool
            </CardTitle>
            <Button
              onClick={() => setIsVisible(false)}
              size="sm"
              variant="outline"
            >
              <Eye className="h-4 w-4 mr-2" />
              Close
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Search for specific shop */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-3">Search for Missing Shop</h3>
            <div className="flex space-x-2">
              <Input
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                placeholder="Enter shop ID (e.g., shop_akshad_vengurlekar_1750044312447)"
                className="flex-1"
              />
              <Button onClick={handleSearch} disabled={isLoading}>
                <Search className="h-4 w-4 mr-2" />
                Analyze
              </Button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <Button
              onClick={() => analyzeShopData()}
              size="sm"
              variant="outline"
              disabled={isLoading}
            >
              <Database className="h-4 w-4 mr-1" />
              Refresh
            </Button>
            <Button
              onClick={fixShopData}
              size="sm"
              variant="outline"
              disabled={isLoading}
            >
              <CheckCircle className="h-4 w-4 mr-1" />
              Fix Data
            </Button>
            <Button
              onClick={() => ApiService.createFallbackShops()}
              size="sm"
              variant="outline"
              disabled={isLoading}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Fallbacks
            </Button>
            <Button
              onClick={clearAllShops}
              size="sm"
              variant="destructive"
              disabled={isLoading}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Reset All
            </Button>
          </div>

          {/* Analysis Results */}
          {recoveryData && (
            <div className="space-y-4">
              {/* Missing Shop Analysis */}
              {recoveryData.missingShopId && (
                <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                  <h3 className="font-semibold text-red-800 mb-2 flex items-center">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Missing Shop Analysis
                  </h3>
                  <p className="text-red-700 mb-3">
                    Shop ID:{" "}
                    <code className="bg-red-100 px-2 py-1 rounded">
                      {recoveryData.missingShopId}
                    </code>
                  </p>

                  {recoveryData.potentialMatches.length > 0 ? (
                    <div>
                      <p className="text-red-700 mb-2">
                        Potential matches found:
                      </p>
                      <div className="space-y-2">
                        {recoveryData.potentialMatches.map((shop, index) => (
                          <div
                            key={index}
                            className="bg-white p-2 rounded border flex items-center justify-between"
                          >
                            <div>
                              <span className="font-medium">{shop.name}</span>
                              <span className="text-sm text-gray-600 ml-2">
                                ({shop.id})
                              </span>
                            </div>
                            <Badge variant="outline">{shop.category}</Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p className="text-red-700 mb-2">
                        No matches found. You can recreate the shop:
                      </p>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          onClick={() =>
                            recreateShop("Recreated Shop", "Fast Food")
                          }
                        >
                          Recreate as Fast Food
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            recreateShop("Recreated Shop", "Asian")
                          }
                        >
                          Recreate as Asian
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Current Shops */}
              <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                <h3 className="font-semibold text-green-800 mb-3 flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Current Shops ({recoveryData.allShops.length})
                </h3>
                {recoveryData.allShops.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                    {recoveryData.allShops.map((shop, index) => (
                      <div
                        key={index}
                        className="bg-white p-2 rounded border text-sm"
                      >
                        <div className="font-medium">{shop.name}</div>
                        <div className="text-gray-600 text-xs">{shop.id}</div>
                        <Badge size="sm" variant="outline">
                          {shop.category}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-green-700">
                    No shops found in the system.
                  </p>
                )}
              </div>

              {/* Storage Info */}
              <div className="bg-gray-50 border p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Storage Information</h3>
                <div className="text-sm space-y-1">
                  <p>
                    <strong>Raw storage shops:</strong>{" "}
                    {recoveryData.storageData
                      ? recoveryData.storageData.length
                      : "None"}
                  </p>
                  <p>
                    <strong>API shops:</strong> {recoveryData.allShops.length}
                  </p>
                  <p>
                    <strong>Storage key:</strong> campuseats_shops
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ShopRecovery;

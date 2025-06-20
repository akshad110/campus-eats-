import React from "react";
import { useShop } from "@/contexts/ShopContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock } from "lucide-react";

const ShopList = () => {
  const { shops, loading, refreshShops } = useShop();
  const navigate = useNavigate();

  const handleViewMenu = (shopId: string) => {
    navigate(`/shop/${shopId}/menu`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">All Campus Shops</h1>
      <Button onClick={refreshShops} className="mb-4">
        Refresh Shops
      </Button>
      {loading ? (
        <p>Loading shops...</p>
      ) : shops.length === 0 ? (
        <p>No shops available.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {shops.map((shop) => (
            <Card key={shop.id} className="shadow-md">
              <CardHeader>
                <CardTitle>{shop.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-2">{shop.category}</p>
                <div className="flex items-center text-sm text-gray-600 mb-2">
                  <Clock className="mr-1" size={14} />
                  <span>{shop.estimatedWaitTime} min wait</span>
                </div>
                <Button
                  onClick={() => handleViewMenu(shop.id)}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                >
                  View Menu
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ShopList;

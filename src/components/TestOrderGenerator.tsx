import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { OrderManagement } from "@/lib/orderManagement";
import { MockDatabase } from "@/lib/database";
import { Plus, Users, ShoppingCart, Zap, RefreshCw } from "lucide-react";

interface TestOrderGeneratorProps {
  shopId: string;
  onOrderGenerated?: () => void;
}

export const TestOrderGenerator = ({
  shopId,
  onOrderGenerated,
}: TestOrderGeneratorProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const generateTestOrder = async () => {
    setIsGenerating(true);
    try {
      // Create a test user if one doesn't exist
      let testUser = await MockDatabase.findMany("users", {
        email: "test@customer.com",
      });
      if (testUser.length === 0) {
        const newUser = await MockDatabase.create("users", {
          email: "test@customer.com",
          password: "hashed_password",
          name: "Test Customer",
          role: "student",
          isActive: true,
          phone: "+1-555-TEST",
        });
        testUser = [newUser];
      }

      // Generate random order data
      const testOrders = [
        {
          items: [
            {
              menuItemId: "item_pizza_001",
              quantity: 2,
              price: 12.99,
              notes: "",
            },
            {
              menuItemId: "item_drink_001",
              quantity: 1,
              price: 2.99,
              notes: "",
            },
          ],
          notes: "Extra cheese please!",
          totalAmount: 28.97,
        },
        {
          items: [
            {
              menuItemId: "item_burger_001",
              quantity: 1,
              price: 9.99,
              notes: "",
            },
            {
              menuItemId: "item_fries_001",
              quantity: 1,
              price: 4.99,
              notes: "",
            },
          ],
          notes: "No onions",
          totalAmount: 14.98,
        },
        {
          items: [
            {
              menuItemId: "item_salad_001",
              quantity: 1,
              price: 8.99,
              notes: "",
            },
          ],
          notes: "Dressing on the side",
          totalAmount: 8.99,
        },
        {
          items: [
            {
              menuItemId: "item_coffee_001",
              quantity: 2,
              price: 3.99,
              notes: "",
            },
            {
              menuItemId: "item_muffin_001",
              quantity: 1,
              price: 2.99,
              notes: "",
            },
          ],
          notes: "One coffee black, one with milk",
          totalAmount: 10.97,
        },
      ];

      const randomOrder =
        testOrders[Math.floor(Math.random() * testOrders.length)];

      // Submit order for approval
      await OrderManagement.submitOrderForApproval({
        shopId,
        items: randomOrder.items,
        userId: testUser[0].id,
        totalAmount: randomOrder.totalAmount,
        notes: randomOrder.notes,
      });

      toast({
        title: "🎉 Test Order Generated!",
        description: `A new test order has been created and is waiting for your approval.`,
      });

      onOrderGenerated?.();
    } catch (error) {
      console.error("Failed to generate test order:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to generate test order. Please try again.",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const generateMultipleOrders = async () => {
    setIsGenerating(true);
    try {
      // Generate 3 test orders
      for (let i = 0; i < 3; i++) {
        await generateTestOrder();
        // Small delay between orders
        await new Promise((resolve) => setTimeout(resolve, 500));
      }

      toast({
        title: "🔥 Multiple Orders Generated!",
        description: "Generated 3 test orders for approval testing.",
      });
    } catch (error) {
      console.error("Failed to generate multiple orders:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="border-dashed border-2 border-gray-300 bg-gray-50/50">
      <CardHeader>
        <CardTitle className="text-sm flex items-center">
          <Zap className="h-4 w-4 mr-2 text-blue-500" />
          Testing Tools
          <Badge variant="outline" className="ml-2 text-xs">
            Demo Mode
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          <p className="text-xs text-gray-600">
            Generate test orders to demo the approval system:
          </p>

          <div className="flex space-x-2">
            <Button
              onClick={generateTestOrder}
              disabled={isGenerating}
              size="sm"
              variant="outline"
              className="flex-1"
            >
              {isGenerating ? (
                <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
              ) : (
                <Plus className="h-3 w-3 mr-1" />
              )}
              Single Order
            </Button>

            <Button
              onClick={generateMultipleOrders}
              disabled={isGenerating}
              size="sm"
              variant="outline"
              className="flex-1"
            >
              {isGenerating ? (
                <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
              ) : (
                <Users className="h-3 w-3 mr-1" />
              )}
              3 Orders
            </Button>
          </div>

          <div className="text-xs text-gray-500 bg-blue-50 p-2 rounded">
            💡 <strong>Tip:</strong> Generated orders will appear above for
            approval testing. You can approve/reject them to see the full
            workflow.
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

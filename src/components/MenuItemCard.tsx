import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Minus, Plus } from "lucide-react";
import { useCart, MenuItem } from "@/contexts/CartContext";

interface MenuItemCardProps {
  menuItem: MenuItem;
  disabled?: boolean;
}

const MenuItemCard = ({ menuItem, disabled = false }: MenuItemCardProps) => {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleAddToCart = () => {
    addToCart(menuItem, quantity, notes);
    setQuantity(1);
    setNotes("");
    setIsDialogOpen(false);
  };

  const handleQuickAdd = () => {
    addToCart(menuItem, 1);
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="aspect-video rounded-lg overflow-hidden mb-3">
          <img
            src={menuItem.image}
            alt={menuItem.name}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-lg">{menuItem.name}</CardTitle>
            <CardDescription className="mt-1">
              {menuItem.description}
            </CardDescription>
          </div>
          {!menuItem.isAvailable && (
            <Badge variant="secondary" className="ml-2">
              Unavailable
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="flex items-center justify-between mb-4">
          <div className="text-2xl font-bold text-green-600">
            ${menuItem.price.toFixed(2)}
          </div>
          <div className="text-sm text-gray-500">
            🕒 {menuItem.preparationTime} min
          </div>
        </div>

        <div className="space-y-2">
          {/* Quick Add Button */}
          <Button
            onClick={handleQuickAdd}
            disabled={disabled || !menuItem.isAvailable}
            className="w-full"
            size="sm"
          >
            Quick Add
          </Button>

          {/* Customize & Add Button */}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                disabled={disabled || !menuItem.isAvailable}
                className="w-full"
                size="sm"
              >
                Customize & Add
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>{menuItem.name}</DialogTitle>
                <DialogDescription>{menuItem.description}</DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                {/* Item Image */}
                <div className="aspect-video rounded-lg overflow-hidden">
                  <img
                    src={menuItem.image}
                    alt={menuItem.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Price */}
                <div className="text-2xl font-bold text-green-600">
                  ${menuItem.price.toFixed(2)}
                </div>

                {/* Quantity Selector */}
                <div className="flex items-center justify-between">
                  <span className="font-medium">Quantity:</span>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <span className="w-8 text-center font-medium">
                      {quantity}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setQuantity(quantity + 1)}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Special Instructions */}
                <div className="space-y-2">
                  <label
                    htmlFor="notes"
                    className="text-sm font-medium leading-none"
                  >
                    Special Instructions (Optional)
                  </label>
                  <Textarea
                    id="notes"
                    placeholder="Any special requests or modifications..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                  />
                </div>

                {/* Total Price */}
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">Total:</span>
                  <span className="text-xl font-bold text-green-600">
                    ${(menuItem.price * quantity).toFixed(2)}
                  </span>
                </div>

                {/* Add to Cart Button */}
                <Button onClick={handleAddToCart} className="w-full" size="lg">
                  Add {quantity} to Cart
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
};

export default MenuItemCard;

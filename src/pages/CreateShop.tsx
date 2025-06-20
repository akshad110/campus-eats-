import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Store } from "lucide-react";
import { useSimpleAuth } from "@/contexts/SimpleAuthContext";
import ShopService from "@/lib/shopService";

const CreateShop = () => {
  const { user, logout } = useSimpleAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if user is not logged in
  useEffect(() => {
    console.log("CreateShop: Current user:", user);
    if (!user) {
      console.log("User not authenticated, redirecting to login");
      navigate("/auth");
    }
  }, [user, navigate]);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    location: "",
    phone: "",
    image: "/placeholder.svg",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.id) {
      alert("Please log in to create a shop");
      navigate("/auth");
      return;
    }

    if (!formData.name.trim()) {
      alert("Please enter a shop name");
      return;
    }

    if (!formData.category) {
      alert("Please select a category");
      return;
    }

    if (!formData.location.trim()) {
      alert("Please enter a location");
      return;
    }

    setIsLoading(true);

    try {
      const shop = await ShopService.createShop({
        name: formData.name,
        description: formData.description,
        category: formData.category,
        location: formData.location,
        phone: formData.phone,
        image: formData.image,
        ownerId: user?.id,
      });

      console.log("Shop created successfully:", shop);
      alert("Shop created successfully!");
      navigate("/shop-dashboard");
    } catch (error) {
      console.error("Error creating shop:", error);
      alert("Failed to create shop. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const categories = [
    "Fast Food",
    "Italian",
    "Chinese",
    "Indian",
    "Mexican",
    "American",
    "Café",
    "Healthy Food",
    "Desserts",
    "Beverages",
    "Pizza",
    "Burgers",
    "Sandwiches",
    "Sushi",
    "BBQ",
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/shop-dashboard">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <h1 className="text-2xl font-bold">Create New Shop</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">{user?.name}</span>
              <Button variant="outline" size="sm" onClick={logout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Store className="w-8 h-8 text-orange-600" />
              </div>
              <CardTitle className="text-2xl">Create Your Shop</CardTitle>
              <CardDescription>
                Set up your restaurant or food business on CampusEats
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Shop Name */}
                <div className="space-y-2">
                  <Label htmlFor="name">Shop Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="e.g., Campus Café, Pizza Corner"
                    required
                  />
                  <p className="text-sm text-gray-500">
                    Choose a memorable name for your shop
                  </p>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Brief description of your food and service..."
                    rows={3}
                  />
                  <p className="text-sm text-gray-500">
                    Tell customers what makes your shop special
                  </p>
                </div>

                {/* Category */}
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) =>
                      setFormData({ ...formData, category: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select your food category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-gray-500">
                    Choose the category that best fits your cuisine
                  </p>
                </div>

                {/* Location */}
                <div className="space-y-2">
                  <Label htmlFor="location">Location *</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                    placeholder="e.g., Building A Ground Floor, Food Court Level 2"
                    required
                  />
                  <p className="text-sm text-gray-500">
                    Where can customers find your shop?
                  </p>
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    placeholder="e.g., +1 (555) 123-4567"
                  />
                  <p className="text-sm text-gray-500">
                    Contact number for order inquiries
                  </p>
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full"
                    size="lg"
                  >
                    {isLoading ? "Creating Shop..." : "Create Shop"}
                  </Button>
                </div>

                <div className="text-center text-sm text-gray-500">
                  <p>
                    After creating your shop, you can add menu items and start
                    receiving orders
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CreateShop;

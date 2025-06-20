import { useState, useEffect } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { X, Database, Wifi, WifiOff } from "lucide-react";

interface ConnectionStatusBannerProps {
  isVisible?: boolean;
  onDismiss?: () => void;
}

export const ConnectionStatusBanner = ({
  isVisible = true,
  onDismiss,
}: ConnectionStatusBannerProps) => {
  const [isDismissed, setIsDismissed] = useState(false);

  const handleDismiss = () => {
    setIsDismissed(true);
    onDismiss?.();
  };

  // Don't show banner if dismissed or explicitly hidden
  if (isDismissed || !isVisible) {
    return null;
  }

  // Always show the demo mode banner since database is currently unavailable
  // This avoids making additional fetch calls that cause error spam

  return (
    <Alert className="border-green-200 bg-green-50 mx-4 mt-4 relative">
      <Database className="h-4 w-4 text-green-600" />
      <AlertDescription className="text-green-800 pr-8">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <strong className="block mb-1">✅ Demo Mode Active</strong>
            <p className="text-sm mb-2">
              Full CampusEats functionality available with demo data. Create
              shops, manage menus, place orders, and explore all features!
            </p>
            <p className="text-xs opacity-80">
              All data is stored locally. Perfect for testing and demonstration.
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="absolute top-2 right-2 h-6 w-6 p-0 text-green-600 hover:text-green-700"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
};

export default ConnectionStatusBanner;

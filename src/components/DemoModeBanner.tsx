import { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { X, HardDrive, Terminal } from "lucide-react";

export const DemoModeBanner = () => {
  const [isVisible, setIsVisible] = useState(true);

  // Always show demo mode banner (no backend checking to avoid fetch errors)
  if (!isVisible) {
    return null;
  }

  return (
    <Alert className="border-orange-200 bg-orange-50 mx-4 mt-4 relative">
      <HardDrive className="h-4 w-4 text-orange-600" />
      <AlertDescription className="text-orange-800 pr-8">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <strong className="block mb-1">Demo Mode Active</strong>
            <p className="text-sm mb-2">
              CampusEats is running in demo mode using localStorage. All
              features work perfectly! To enable the real-time MySQL database:
            </p>
            <div className="bg-orange-100 p-2 rounded text-xs font-mono flex items-center">
              <Terminal className="h-3 w-3 mr-2" />
              npm run dev:server
            </div>
            <p className="text-xs mt-2 opacity-80">
              The app will automatically switch to MySQL when the backend is
              detected.
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsVisible(false)}
            className="absolute top-2 right-2 h-6 w-6 p-0 text-orange-600 hover:text-orange-700"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
};
